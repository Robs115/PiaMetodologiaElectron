const input = document.getElementById("buscadorproducto");
const tabla = document.querySelector("#tablaVentas tbody");
const realizar = document.querySelector(".btn-realizar-venta");
const totalSpan = document.getElementById("total-venta");

let venta = [];

// Función para limpiar el nombre del producto
function limpiarNombre(nombre) {
    if (!nombre) return '';
    
    let nombreLimpio = nombre
        .replace(/_/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`/g, '')
        .replace(/#/g, '')
        .replace(/\[/g, '')
        .replace(/\]/g, '')
        .replace(/\(/g, '')
        .replace(/\)/g, '')
        .trim();
    
    if (nombreLimpio.includes('_')) {
        nombreLimpio = nombreLimpio.split('_')[0];
    }
    
    return nombreLimpio;
}

input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
        const codigo = input.value.trim();
        if (!codigo) return;

        try {
            const res = await fetch(`/producto/${codigo}`);
            const data = await res.json();

            if (data.error) {
                mostrarAlerta("Producto no encontrado", "error");
                input.value = "";
                return;
            }

            data.NOMBRE = limpiarNombre(data.NOMBRE);
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
            IDPRODUCTO: producto.IDPRODUCTO,
            NOMBRE: limpiarNombre(producto.NOMBRE),
            PRECIOVENTA: producto.PRECIOVENTA,
            cantidad: 1
        });
    }

    renderTabla();
}

function renderTabla() {
    if (!tabla) return;
    
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
    
    if (totalSpan) {
        totalSpan.textContent = `$${total.toFixed(2)}`;
    }
    
    document.querySelectorAll(".input-cantidad").forEach(inputCantidad => {
        inputCantidad.removeEventListener("change", handleCantidadChange);
        inputCantidad.addEventListener("change", handleCantidadChange);
    });
}

function handleCantidadChange(e) {
    const index = e.target.dataset.index;
    let nuevaCantidad = parseInt(e.target.value);

    if (nuevaCantidad < 1 || isNaN(nuevaCantidad)) {
        nuevaCantidad = 1;
        e.target.value = 1;
    }

    venta[index].cantidad = nuevaCantidad;
    renderTabla();
}

function mostrarAlerta(mensaje, tipo = "error") {
    const alerta = document.querySelector(".alert");
    if (!alerta) return;
    
    alerta.style.display = "block";
    alerta.textContent = mensaje;
    alerta.style.backgroundColor = tipo === "error" ? "#fee2e2" : "#dcfce7";
    alerta.style.color = tipo === "error" ? "#dc2626" : "#16a34a";
    
    setTimeout(() => {
        alerta.style.display = "none";
    }, 3000);
}

if (realizar) {
    realizar.addEventListener("click", async () => {
        if (venta.length === 0) {
            mostrarAlerta("No hay productos en la venta", "error");
            if (input) input.focus();
            return;
        }

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

        console.log('Guardando venta...');

        try {
            const res = await fetch("/api/ventas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idusuario,
                    total,
                    productos: productosDetalle
                })
            });

            const data = await res.json();

            if (data.success) {
                mostrarAlerta("Venta realizada correctamente", "success");
                
                venta = [];
                renderTabla();
                if (input) input.value = "";
                
                setTimeout(() => {
                    if (input) input.focus();
                }, 0);

            } else {
                mostrarAlerta("Error al guardar la venta", "error");
            }

        } catch (error) {
            console.error("Error:", error);
            mostrarAlerta("Error de conexión con el servidor", "error");
        }
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}