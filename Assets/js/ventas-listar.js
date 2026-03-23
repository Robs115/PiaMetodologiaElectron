const tablaBody = document.querySelector("#tablaVentas tbody");
const buscador = document.getElementById("buscador");

let ventas = [];

function renderTabla(lista) {
    tablaBody.innerHTML = "";
    
    if (lista.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="5" style="text-align: center;">No hay ventas registradas</td>`;
        tablaBody.appendChild(fila);
        return;
    }
    
    lista.forEach(venta => {
        const fila = document.createElement("tr");
        
        fila.innerHTML = `
            <td>${venta.id}</td>
            <td>${formatFecha(venta.fecha)}</td>
            <td>${escapeHtml(venta.nombre_usuario || venta.idusuario)}</td>
            <td>$${formatearPrecio(venta.total)}</td>
            <td class="acciones">
                <button class="btn btn-detalle" onclick="verDetalle(${venta.id})">
                    Ver detalle
                </button>
                <button class="btn btn-editar" onclick="editarVenta(${venta.id})">
                    Editar
                </button>
                <button class="btn btn-eliminar" onclick="eliminarVenta(${venta.id})">
                    Eliminar
                </button>
            </td>
        `;
        
        tablaBody.appendChild(fila);
    });
}

async function cargarVentas() {
    try {
        const respuesta = await fetch('/api/ventas');
        if (!respuesta.ok) throw new Error('Error al cargar ventas');
        ventas = await respuesta.json();
        renderTabla(ventas);
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al cargar ventas', 'error');
    }
}

// Función para ver detalle de venta
window.verDetalle = (id) => {
    try {
        window.location.href = `/detalle-venta?idVenta=${id}`;
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al ver detalle', 'error');
    }
};

// Función para editar venta
window.editarVenta = (id) => {
    try {
        window.location.href = `/ventas/editar/${id}`;
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al editar venta', 'error');
    }
};

// Función para eliminar venta
window.eliminarVenta = async (id) => {
    const confirmado = await mostrarConfirmacion(
        '¿Estás seguro de eliminar esta venta?',
        'Esta acción eliminará también todos los detalles de la venta y no se puede deshacer.'
    );
    
    if (!confirmado) return;
    
    try {
        const respuesta = await fetch(`/api/ventas/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!respuesta.ok) {
            const error = await respuesta.json();
            throw new Error(error.error || 'Error al eliminar');
        }
        
        const resultado = await respuesta.json();
        mostrarNotificacion(resultado.message || 'Venta eliminada correctamente', 'success');
        await cargarVentas();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion(error.message || 'Error al eliminar venta', 'error');
    }
};

function formatFecha(fecha) {
    if (!fecha) return '';
    
    const [year, month, day] = fecha.split('-');
    const date = new Date(year, month - 1, day);

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

function mostrarNotificacion(mensaje, tipo = 'success') {
    let notificacion = document.getElementById('custom-notification');
    
    if (!notificacion) {
        notificacion = document.createElement('div');
        notificacion.id = 'custom-notification';
        document.body.appendChild(notificacion);
        
        const style = document.createElement('style');
        style.textContent = `
            #custom-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            }
            #custom-notification.show {
                opacity: 1;
            }
            #custom-notification.success {
                background-color: #22c55e;
            }
            #custom-notification.error {
                background-color: #ef4444;
            }
        `;
        document.head.appendChild(style);
    }
    
    notificacion.textContent = mensaje;
    notificacion.className = `show ${tipo}`;
    
    setTimeout(() => {
        notificacion.classList.remove('show');
    }, 3000);
}

function mostrarConfirmacion(titulo, mensaje) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal-confirmacion';
        modal.innerHTML = `
            <div class="modal-contenido">
                <h3>${escapeHtml(titulo)}</h3>
                <p>${escapeHtml(mensaje)}</p>
                <div class="modal-botones">
                    <button class="btn btn-cancelar">Cancelar</button>
                    <button class="btn btn-confirmar">Eliminar</button>
                </div>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .modal-confirmacion {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }
            .modal-contenido {
                background: white;
                padding: 20px;
                border-radius: 8px;
                min-width: 300px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .modal-contenido h3 {
                margin-top: 0;
                color: #333;
            }
            .modal-contenido p {
                margin: 15px 0;
                color: #666;
            }
            .modal-botones {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 20px;
            }
            .btn-cancelar {
                background-color: #6c757d;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
            }
            .btn-cancelar:hover {
                background-color: #5a6268;
            }
            .btn-confirmar {
                background-color: #ef4444;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
            }
            .btn-confirmar:hover {
                background-color: #dc2626;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(modal);
        
        modal.querySelector('.btn-cancelar').onclick = () => {
            modal.remove();
            resolve(false);
        };
        
        modal.querySelector('.btn-confirmar').onclick = () => {
            modal.remove();
            resolve(true);
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
                resolve(false);
            }
        };
    });
}

buscador.addEventListener("keyup", () => {
    const texto = buscador.value.toLowerCase();
    const filtrados = ventas.filter(v =>
        v.id.toString().includes(texto) ||
        (v.nombre_usuario && v.nombre_usuario.toLowerCase().includes(texto))
    );
    renderTabla(filtrados);
});

cargarVentas();