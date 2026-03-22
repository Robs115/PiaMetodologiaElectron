// Obtener ID de la URL
const pedidoId = window.location.pathname.split('/')[3];

const form = document.getElementById("formEditarPedido");
const loadingDiv = document.getElementById("loading");

async function cargarPedido() {
    try {
        const respuesta = await fetch(`/api/pedidos/${pedidoId}`);
        
        if (!respuesta.ok) {
            throw new Error('Pedido no encontrado');
        }
        
        const pedido = await respuesta.json();
        
        document.getElementById("idproducto").value = pedido.idproducto || '';
        document.getElementById("idproveedor").value = pedido.idproveedor || '';
        
        // Formatear fecha para input type="date"
        if (pedido.fechapedido) {
            const fecha = new Date(pedido.fechapedido);
            const fechaFormateada = fecha.toISOString().split('T')[0];
            document.getElementById("fechapedido").value = fechaFormateada;
        }
        
        document.getElementById("cantidad").value = pedido.cantidad || '';
        
        loadingDiv.style.display = "none";
        form.style.display = "block";
        
    } catch (error) {
        console.error('Error:', error);
        loadingDiv.innerHTML = `<p style="color: red;">Error al cargar el pedido: ${error.message}</p>
                                <a href="/pedidos" class="btn-cancelar">Volver a pedidos</a>`;
    }
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
            window.location.href = "/pedidos";
        }
    }, 2000);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const idproducto = parseInt(document.getElementById("idproducto").value);
    const idproveedor = parseInt(document.getElementById("idproveedor").value);
    const fechapedido = document.getElementById("fechapedido").value;
    const cantidad = parseInt(document.getElementById("cantidad").value);
    
    // Validaciones
    if (!idproducto || idproducto <= 0) {
        mostrarNotificacion("El ID del producto es obligatorio y debe ser válido", "error");
        return;
    }
    
    if (!idproveedor || idproveedor <= 0) {
        mostrarNotificacion("El ID del proveedor es obligatorio y debe ser válido", "error");
        return;
    }
    
    if (!fechapedido) {
        mostrarNotificacion("La fecha del pedido es obligatoria", "error");
        return;
    }
    
    if (!cantidad || cantidad <= 0) {
        mostrarNotificacion("La cantidad debe ser mayor a 0", "error");
        return;
    }
    
    const pedido = {
        idproducto,
        idproveedor,
        fechapedido,
        cantidad
    };
    
    try {
        const respuesta = await fetch(`/api/pedidos/${pedidoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedido)
        });
        
        if (!respuesta.ok) {
            const error = await respuesta.json();
            throw new Error(error.error || 'Error al actualizar');
        }
        
        const resultado = await respuesta.json();
        mostrarNotificacion(resultado.message || "Pedido actualizado correctamente", "success");
        
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion(error.message || "Error al actualizar el pedido", "error");
    }
});

// Agregar estilos para animación
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
`;
document.head.appendChild(style);

cargarPedido();