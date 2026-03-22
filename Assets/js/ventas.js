
const input = document.getElementById("buscadorproducto");
const tabla = document.querySelector("#tablaVentas tbody");
const realizar = document.querySelector(".btn-success");

let venta = []; // cada elemento: {IDPRODUCTO, NOMBRE, PRECIOVENTA, cantidad}

input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
        const codigo = input.value.trim();
        if (!codigo) return;

        try {
            const res = await fetch(`http://localhost:3000/producto/${codigo}`);
            const data = await res.json();

            if (data.error) {
                alert("Producto no encontrado");
                input.value = "";
                return;
            }

            agregarProducto(data);
            input.value = "";

        } catch (error) {
            console.error(error);
        }
    }
});

function agregarProducto(producto) {
    const existente = venta.find(p => p.IDPRODUCTO === producto.IDPRODUCTO);

    if (existente) {
        existente.cantidad++;
    } else {
        venta.push({
            ...producto,
            cantidad: 1
        });
    }

    renderTabla();
}

function renderTabla() {
    tabla.innerHTML = "";
    let total = 0;

    venta.forEach((p, index) => {
        const subtotal = p.PRECIOVENTA * p.cantidad;
        total += subtotal;

        const fila = `
            <tr>
                <td>${p.NOMBRE}</td>
                <td>$${p.PRECIOVENTA}</td>
                <td><input 
                        type="number" 
                        min="1" 
                        value="${p.cantidad}" 
                        data-index="${index}" 
                        class="input-cantidad"
                        style="width: 60px;"
                    >
                </td>
                <td>$${subtotal}</td>
            </tr>
        `;
        tabla.innerHTML += fila;
    });
 // 🔥 Escuchar cambios en los inputs
    document.querySelectorAll(".input-cantidad").forEach(inputCantidad => {
        inputCantidad.addEventListener("change", (e) => {
            const index = e.target.dataset.index;
            let nuevaCantidad = parseInt(e.target.value);

            if (nuevaCantidad < 1 || isNaN(nuevaCantidad)) {
                nuevaCantidad = 1;
            }

            venta[index].cantidad = nuevaCantidad;
            renderTabla(); // refresca tabla
        });
    });
    console.log("Total:", total);
}

realizar.addEventListener("click", async () => {
    if (venta.length === 0) {
        const alerta = document.querySelector(".alert");
        alerta.style.display = "block";
        alerta.textContent = "No hay productos en la venta";
        alerta.style.color = "red";
        input.focus();
        return;
    }

    if (venta.length > 0) {
        const alerta = document.querySelector(".alert");
        alerta.style.display = "none";
    }

    const fecha = new Date().toISOString().split('T')[0];
    const idusuario = 1;
    let total = 0;

    venta.forEach(p => {
        total += p.PRECIOVENTA * p.cantidad;
    });

    // ✅ Creamos el array de productos como objetos para el backend
    const productosDetalle = venta.map(p => ({
        IDPRODUCTO: p.IDPRODUCTO,
        cantidad: p.cantidad,
        PRECIO_UNITARIO: p.PRECIOVENTA,
        SUBTOTAL: p.PRECIOVENTA * p.cantidad
    }));

    try {
        const res = await fetch("http://localhost:3000/api/ventas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fecha,
                idusuario,
                total,
                productos: productosDetalle
            })
        });

        const data = await res.json();

        if (data.success) {
            console.log("Venta guardada con ID:", data.idVenta);

            // Limpiar venta
            venta = [];
            renderTabla();
            input.value = "";

            setTimeout(() => {
                input.focus();
            }, 0);

        } else {
            alert("Error al guardar la venta");
        }

    } catch (error) {
        console.error("Error:", error);
    }
});