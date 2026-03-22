// Obtener ID de la URL
const ventaId = window.location.pathname.split('/')[3];

const form = document.getElementById("formEditarVenta");
const loadingDiv = document.getElementById("loading");

console.log('Editando venta ID:', ventaId);

async function cargarVenta() {
    try {
        const respuesta = await fetch(`/api/ventas/${ventaId}`);
        
        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.error || 'Venta no encontrada');
        }
        
        const venta = await respuesta.json();
        console.log('Venta cargada para editar:', venta);
        
        // Formatear fecha para input type="date"
        if (venta.fecha) {
            const fecha = new Date(venta.fecha);
            const fechaFormateada = fecha.toISOString().split('T')[0];
            document.getElementById("fecha").value = fechaFormateada;
        }
        
        document.getElementById("idusuario").value = venta.idusuario || '';
        document.getElementById("total").value = `$${parseFloat(venta.total).toFixed(2)}`;
        
        // Mostrar detalles de la venta
        const detallesContainer = document.getElementById("detalles-container");
        if (venta.detalles && venta.detalles.length > 0) {
            detallesContainer.innerHTML = `
                <table class="tabla-detalles">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio Unitario</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${venta.detalles.map(d => `
                            <tr>
                                <td>${escapeHtml(d.nombre_producto)}</td>
                                <td>${d.cantidad}</td>
                                <td>$${parseFloat(d.precio_unitario).toFixed(2)}</td>
                                <td>$${parseFloat(d.subtotal).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            detallesContainer.innerHTML = '<p class="text-muted">No hay productos en esta venta</p>';
        }
        
        loadingDiv.style.display = "none";
        form.style.display = "block";
        
    } catch (error) {
        console.error('Error:', error);
        loadingDiv.innerHTML = `<p style="color: red;">Error al cargar la venta: ${error.message}</p>
                                <a href="/venta/listar" class="btn-cancelar">Volver a ventas</a>`;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function mostrarNotificacion(mensaje, tipo = "success") {
    const notificacion = document.createElement('div');
    notificacion.textContent = mensaje;
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background-color: ${tipo === "success" ? "#22c55e" : "#ef4444"};
        color: white;
        border-radius: 8px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.remove();
        if (tipo === "success") {
            window.location.href = "/venta/listar";
        }
    }, 2000);
}

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const fecha = document.getElementById("fecha").value;
        const idusuario = parseInt(document.getElementById("idusuario").value);
        
        if (!fecha) {
            mostrarNotificacion("La fecha es obligatoria", "error");
            return;
        }
        
        if (!idusuario || idusuario <= 0) {
            mostrarNotificacion("El ID de usuario es obligatorio", "error");
            return;
        }
        
        const venta = {
            fecha,
            idusuario
        };
        
        try {
            const respuesta = await fetch(`/api/ventas/${ventaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(venta)
            });
            
            if (!respuesta.ok) {
                const error = await respuesta.json();
                throw new Error(error.error || 'Error al actualizar');
            }
            
            const resultado = await respuesta.json();
            mostrarNotificacion(resultado.message || "Venta actualizada correctamente", "success");
            
        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion(error.message || "Error al actualizar la venta", "error");
        }
    });
}

// Agregar estilos adicionales
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .tabla-detalles {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
    }
    
    .tabla-detalles th,
    .tabla-detalles td {
        padding: 8px;
        text-align: left;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .tabla-detalles th {
        background-color: #f3f4f6;
        font-weight: 600;
    }
    
    .detalles-container {
        margin-top: 5px;
        max-height: 300px;
        overflow-y: auto;
    }
    
    .text-muted {
        color: #6b7280;
        font-style: italic;
    }
`;
document.head.appendChild(style);

cargarVenta();