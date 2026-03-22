const input = document.getElementById("buscadorproducto");
const tabla = document.querySelector("#tablaVentas tbody");
const realizar = document.querySelector(".btn-realizar-venta");
const totalSpan = document.getElementById("total-venta");

let venta = []; // cada elemento: {IDPRODUCTO, NOMBRE, PRECIOVENTA, cantidad}

input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
        const codigo = input.value.trim();
        if (!codigo) return;

        try {
            const res = await fetch(`http://localhost:3000/producto/${codigo}`);
            const data = await res.json();

            if (data.error) {
                mostrarAlerta("Producto no encontrado", "error");
                input.value = "";
                return;
            }

            agregarProducto(data);
            input.value = "";

        } catch (error) {
            console.error(error);
            mostrarAlerta("Error de conexión", "error");
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
                <td><strong>${escapeHtml(p.NOMBRE)}</strong></td>
                <td>$${p.PRECIOVENTA.toFixed(2)}</td>
                <td>
                    <input 
                        type="number" 
                        min="1" 
                        value="${p.cantidad}" 
                        data-index="${index}" 
                        class="input-cantidad"
                    >
                </td>
                <td>$${subtotal.toFixed(2)}</td>
            </tr>
        `;
        tabla.innerHTML += fila;
    });
    
    // Actualizar total
    if (totalSpan) {
        totalSpan.textContent = `$${total.toFixed(2)}`;
    }
    
    // Escuchar cambios en los inputs
    document.querySelectorAll(".input-cantidad").forEach(inputCantidad => {
        inputCantidad.addEventListener("change", (e) => {
            const index = e.target.dataset.index;
            let nuevaCantidad = parseInt(e.target.value);

            if (nuevaCantidad < 1 || isNaN(nuevaCantidad)) {
                nuevaCantidad = 1;
                e.target.value = 1;
            }

            venta[index].cantidad = nuevaCantidad;
            renderTabla();
        });
    });
}

function mostrarAlerta(mensaje, tipo = "error") {
    const alerta = document.querySelector(".alert");
    alerta.style.display = "block";
    alerta.textContent = mensaje;
    alerta.style.backgroundColor = tipo === "error" ? "#fee2e2" : "#dcfce7";
    alerta.style.color = tipo === "error" ? "#dc2626" : "#16a34a";
    
    setTimeout(() => {
        alerta.style.display = "none";
    }, 3000);
}

realizar.addEventListener("click", async () => {
    if (venta.length === 0) {
        mostrarAlerta("No hay productos en la venta", "error");
        input.focus();
        return;
    }

    const fecha = new Date().toISOString().split('T')[0];
    const idusuario = 1;
    let total = 0;

    venta.forEach(p => {
        total += p.PRECIOVENTA * p.cantidad;
    });

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
            mostrarAlerta("Venta realizada correctamente", "success");
            
            // Limpiar venta
            venta = [];
            renderTabla();
            input.value = "";
            
            setTimeout(() => {
                input.focus();
            }, 0);

        } else {
            mostrarAlerta("Error al guardar la venta", "error");
        }

    } catch (error) {
        console.error("Error:", error);
        mostrarAlerta("Error de conexión con el servidor", "error");
    }
});

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}