const tablaBody = document.querySelector("#tablaPedidos tbody");
const buscador = document.getElementById("buscador");

let pedidos = [];

function renderTabla(lista) {
    tablaBody.innerHTML = "";
    
    if (lista.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="6" style="text-align: center;">No hay pedidos registrados</td>`;
        tablaBody.appendChild(fila);
        return;
    }
    
    lista.forEach(pedido => {
        const fila = document.createElement("tr");
        
        // Mostrar nombres, si no existen mostrar "No disponible"
        const nombreProducto = pedido.nombre_producto || `ID: ${pedido.idproducto}`;
        const nombreProveedor = pedido.nombre_proveedor || `ID: ${pedido.idproveedor}`;
        
        fila.innerHTML = `
            <td>${pedido.id}</td>
            <td>
                <strong>${escapeHtml(nombreProducto)}</strong>
                <br>
                <small class="text-muted">ID: ${pedido.idproducto}</small>
            </td>
            <td>
                <strong>${escapeHtml(nombreProveedor)}</strong>
                <br>
                <small class="text-muted">ID: ${pedido.idproveedor}</small>
            </td>
            <td>${formatFecha(pedido.fechapedido)}</td>
            <td>${pedido.cantidad}</td>
            <td class="acciones">
                <button class="btn btn-editar" onclick="editarPedido(${pedido.id})">
                    Editar
                </button>
                <button class="btn btn-eliminar" onclick="eliminarPedido(${pedido.id})">
                    Eliminar
                </button>
            </td>
        `;
        
        tablaBody.appendChild(fila);
    });
}

async function cargarPedidos() {
    try {
        const respuesta = await fetch('/api/pedidos');
        if (!respuesta.ok) throw new Error('Error al cargar pedidos');
        pedidos = await respuesta.json();
        renderTabla(pedidos);
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al cargar pedidos', 'error');
    }
}

// Función para editar pedido
window.editarPedido = async (id) => {
    try {
        window.location.href = `/pedidos/editar/${id}`;
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al editar pedido', 'error');
    }
};

// Función para eliminar pedido
window.eliminarPedido = async (id) => {
    const confirmado = await mostrarConfirmacion(
        '¿Estás seguro de eliminar este pedido?',
        'Esta acción no se puede deshacer.'
    );
    
    if (!confirmado) return;
    
    try {
        const respuesta = await fetch(`/api/pedidos/${id}`, {
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
        mostrarNotificacion(resultado.message || 'Pedido eliminado correctamente', 'success');
        await cargarPedidos();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion(error.message || 'Error al eliminar pedido', 'error');
    }
};

// Función para formatear fecha
function formatFecha(fecha) {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Funciones de utilidad
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

// Buscador mejorado para buscar por nombre de producto o proveedor
buscador.addEventListener("keyup", () => {
    const texto = buscador.value.toLowerCase();
    const filtrados = pedidos.filter(p => 
        (p.nombre_producto && p.nombre_producto.toLowerCase().includes(texto)) ||
        (p.nombre_proveedor && p.nombre_proveedor.toLowerCase().includes(texto)) ||
        p.idproducto.toString().includes(texto) ||
        p.idproveedor.toString().includes(texto) ||
        p.id.toString().includes(texto)
    );
    renderTabla(filtrados);
});

cargarPedidos();