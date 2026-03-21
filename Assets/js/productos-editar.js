// Obtener ID de la URL
const urlParams = new URLSearchParams(window.location.search);
const productoId = window.location.pathname.split('/')[3]; // /productos/editar/ID

const form = document.getElementById("formEditarProducto");
const loadingDiv = document.getElementById("loading");

// Cargar proveedores para el select
async function cargarProveedores() {
    try {
        const respuesta = await fetch('/api/proveedores');
        const proveedores = await respuesta.json();
        
        const selectProveedor = document.getElementById("idProveedor");
        proveedores.forEach(proveedor => {
            const option = document.createElement("option");
            option.value = proveedor.id;
            option.textContent = proveedor.nombre;
            selectProveedor.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar proveedores:', error);
    }
}

// Cargar datos del producto
async function cargarProducto() {
    try {
        const respuesta = await fetch(`/api/productos/${productoId}`);
        
        if (!respuesta.ok) {
            throw new Error('Producto no encontrado');
        }
        
        const producto = await respuesta.json();
        
        // Llenar el formulario
        document.getElementById("nombre").value = producto.nombre || '';
        document.getElementById("descripcion").value = producto.descripcion || '';
        document.getElementById("precioCompra").value = producto.precioCompra || 0;
        document.getElementById("precioVenta").value = producto.precioVenta || 0;
        document.getElementById("stock").value = producto.stock || 0;
        
        if (producto.idProveedor) {
            document.getElementById("idProveedor").value = producto.idProveedor;
        }
        
        // Mostrar formulario y ocultar loading
        loadingDiv.style.display = "none";
        form.style.display = "block";
        
    } catch (error) {
        console.error('Error:', error);
        loadingDiv.innerHTML = `<p style="color: red;">Error al cargar el producto: ${error.message}</p>
                                <a href="/productos" class="btn-cancelar">Volver a productos</a>`;
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
            window.location.href = "/productos";
        }
    }, 2000);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const precioCompra = parseFloat(document.getElementById("precioCompra").value);
    const precioVenta = parseFloat(document.getElementById("precioVenta").value);
    const idProveedor = parseInt(document.getElementById("idProveedor").value) || null;
    const stock = parseInt(document.getElementById("stock").value);
    
    // Validaciones
    if (!nombre) {
        mostrarNotificacion("El nombre del producto es obligatorio", "error");
        return;
    }
    
    if (precioCompra <= 0) {
        mostrarNotificacion("El precio de compra debe ser mayor a 0", "error");
        return;
    }
    
    if (precioVenta <= 0) {
        mostrarNotificacion("El precio de venta debe ser mayor a 0", "error");
        return;
    }
    
    if (precioVenta < precioCompra) {
        mostrarNotificacion("El precio de venta no puede ser menor al de compra", "error");
        return;
    }
    
    if (stock < 0) {
        mostrarNotificacion("El stock no puede ser negativo", "error");
        return;
    }
    
    const producto = {
        nombre,
        descripcion,
        precioCompra,
        precioVenta,
        idProveedor,
        stock
    };
    
    try {
        const respuesta = await fetch(`/api/productos/${productoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(producto)
        });
        
        if (!respuesta.ok) {
            const error = await respuesta.json();
            throw new Error(error.error || 'Error al actualizar');
        }
        
        const resultado = await respuesta.json();
        mostrarNotificacion(resultado.message || "Producto actualizado correctamente", "success");
        
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion(error.message || "Error al actualizar el producto", "error");
    }
});

// Agregar estilos para la animación
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

// Iniciar carga
cargarProveedores();
cargarProducto();