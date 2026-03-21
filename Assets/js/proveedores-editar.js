// Obtener ID de la URL
const urlParams = new URLSearchParams(window.location.search);
const proveedorId = window.location.pathname.split('/')[3];

const form = document.getElementById("formEditarProveedor");
const loadingDiv = document.getElementById("loading");

async function cargarProveedor() {
    try {
        const respuesta = await fetch(`/api/proveedores/${proveedorId}`);
        
        if (!respuesta.ok) {
            throw new Error('Proveedor no encontrado');
        }
        
        const proveedor = await respuesta.json();
        
        document.getElementById("nombre").value = proveedor.nombre || '';
        document.getElementById("telefono").value = proveedor.telefono || '';
        document.getElementById("email").value = proveedor.email || '';
        document.getElementById("direccion").value = proveedor.direccion || '';
        document.getElementById("activo").value = proveedor.activo || '1';
        
        loadingDiv.style.display = "none";
        form.style.display = "block";
        
    } catch (error) {
        console.error('Error:', error);
        loadingDiv.innerHTML = `<p style="color: red;">Error al cargar el proveedor: ${error.message}</p>
                                <a href="/proveedores" class="btn-cancelar">Volver a proveedores</a>`;
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
            window.location.href = "/proveedores";
        }
    }, 2000);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const email = document.getElementById("email").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const activo = parseInt(document.getElementById("activo").value);
    
    if (!nombre) {
        mostrarNotificacion("El nombre del proveedor es obligatorio", "error");
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
    
    const proveedor = {
        nombre,
        telefono,
        email,
        direccion,
        activo
    };
    
    try {
        const respuesta = await fetch(`/api/proveedores/${proveedorId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(proveedor)
        });
        
        if (!respuesta.ok) {
            const error = await respuesta.json();
            throw new Error(error.error || 'Error al actualizar');
        }
        
        const resultado = await respuesta.json();
        mostrarNotificacion(resultado.message || "Proveedor actualizado correctamente", "success");
        
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion(error.message || "Error al actualizar el proveedor", "error");
    }
});

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
    
    .loading {
        text-align: center;
        padding: 50px;
        font-size: 18px;
        color: #666;
    }
    
    .btn-guardar {
        background-color: #22c55e;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .btn-guardar:hover {
        background-color: #16a34a;
    }
    
    .btn-cancelar {
        background-color: #6c757d;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
    }
    
    .btn-cancelar:hover {
        background-color: #5a6268;
    }
`;
document.head.appendChild(style);

cargarProveedor();