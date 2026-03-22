const tablaBody = document.querySelector("#tablaDetalleVentas tbody");
const buscador = document.getElementById("buscador");
const totalDiv = document.getElementById("total");

let detalles = [];
let ventaInfo = null;

function renderTabla(lista) {
    tablaBody.innerHTML = "";
    
    if (!lista || lista.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="9" style="text-align: center;">No hay detalles para esta venta</td>`;
        tablaBody.appendChild(fila);
        return;
    }
    
    let totalGeneral = 0;
    
    lista.forEach(detalle => {
        const fila = document.createElement("tr");
        const subtotal = detalle.cantidad * detalle.precio_unitario;
        totalGeneral += subtotal;
        
        fila.innerHTML = `
            <td>${detalle.id || ''}</td>
            <td>${formatFecha(ventaInfo?.fecha)}</td>
            <td>${ventaInfo?.id || detalle.idventa}</td>
            <td>${ventaInfo?.idusuario || ''}</td>
            <td>${detalle.idproducto || ''}</td>
            <td><strong>${escapeHtml(detalle.nombre_producto || 'Producto')}</strong></td>
            <td>${detalle.cantidad}</td>
            <td>$${formatearPrecio(detalle.precio_unitario)}</td>
            <td>$${formatearPrecio(subtotal)}</td>
        `;
        
        tablaBody.appendChild(fila);
    });
    
    if (totalDiv) {
        totalDiv.innerHTML = `
            <div class="total-venta">
                <h3>Total de la Venta: $${formatearPrecio(totalGeneral)}</h3>
            </div>
        `;
    }
}

async function cargarDetalleVenta() {
    // Obtener ID de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const idVenta = urlParams.get('idVenta');
    
    if (!idVenta) {
        console.error('No se especificó ID de venta');
        tablaBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No se especificó ID de venta</td></tr>';
        return;
    }
    
    try {
        const respuesta = await fetch(`/api/ventas/${idVenta}`);
        
        if (!respuesta.ok) {
            throw new Error('Error al cargar detalle de venta');
        }
        
        const venta = await respuesta.json();
        ventaInfo = venta;
        
        // Convertir detalles al formato esperado por renderTabla
        if (venta.detalles && venta.detalles.length > 0) {
            detalles = venta.detalles.map(d => ({
                ...d,
                idventa: venta.id
            }));
        } else {
            detalles = [];
        }
        
        renderTabla(detalles);
        
        // Actualizar el título con el ID de la venta
        const titulo = document.querySelector(".header-ventas h2");
        if (titulo) {
            titulo.textContent = `Detalle de Venta #${idVenta}`;
        }
        
    } catch (error) {
        console.error('Error:', error);
        tablaBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: red;">Error al cargar detalle: ${error.message}</td></tr>`;
    }
}

function formatFecha(fecha) {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatearPrecio(precio) {
    return parseFloat(precio).toFixed(2);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Buscador para filtrar productos en el detalle
buscador.addEventListener("keyup", () => {
    const texto = buscador.value.toLowerCase();
    if (!detalles.length) return;
    
    const filtrados = detalles.filter(d =>
        d.nombre_producto?.toLowerCase().includes(texto) ||
        d.idproducto?.toString().includes(texto)
    );
    renderTabla(filtrados);
});

cargarDetalleVenta();