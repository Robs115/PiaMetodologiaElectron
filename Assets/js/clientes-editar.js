// Obtener ID de la URL
const clienteId = window.location.pathname.split('/')[3];

const form = document.getElementById("formEditarCliente");
const loadingDiv = document.getElementById("loading");

async function cargarCliente() {
    try {
        const respuesta = await fetch(`/api/clientes/${clienteId}`);
        
        if (!respuesta.ok) {
            throw new Error('Cliente no encontrado');
        }
        
        const cliente = await respuesta.json();
        
        document.getElementById("nombre").value = cliente.nombre || '';
        document.getElementById("telefono").value = cliente.telefono || '';
        document.getElementById("email").value = cliente.email || '';
        document.getElementById("direccion").value = cliente.direccion || '';
        
        loadingDiv.style.display = "none";
        form.style.display = "block";
        
    } catch (error) {
        console.error('Error:', error);
        loadingDiv.innerHTML = `<p style="color: red;">Error al cargar el cliente: ${error.message}</p>
                                <a href="/clientes" class="btn-cancelar">Volver a clientes</a>`;
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
            window.location.href = "/clientes";
        }
    }, 2000);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const email = document.getElementById("email").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    
    if (!nombre) {
        mostrarNotificacion("El nombre del cliente es obligatorio", "error");
        return;
    }
    
    if (!telefono) {
        mostrarNotificacion("El teléfono es obligatorio", "error");
        return;
    }
    
    if (!email) {
        mostrarNotificacion("El email es obligatorio", "error");
        return;
    }
    
    if (!direccion) {
        mostrarNotificacion("La dirección es obligatoria", "error");
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarNotificacion("El email no tiene un formato válido", "error");
        return;
    }
    
    const cliente = {
        nombre,
        telefono,
        email,
        direccion
    };
    
    try {
        const respuesta = await fetch(`/api/clientes/${clienteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cliente)
        });
        
        if (!respuesta.ok) {
            const error = await respuesta.json();
            throw new Error(error.error || 'Error al actualizar');
        }
        
        const resultado = await respuesta.json();
        mostrarNotificacion(resultado.message || "Cliente actualizado correctamente", "success");
        
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion(error.message || "Error al actualizar el cliente", "error");
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

cargarCliente();