const form = document.getElementById("formProducto");


function mostrarToast(mensaje, tipo = "success") {
    const toast = document.getElementById("toast");

    toast.textContent = mensaje;
    toast.classList.remove("hidden");

    if (tipo === "error") {
        toast.style.background = "#ef4444"; // rojo
    } else {
        toast.style.background = "#22c55e"; // verde
    }


    setTimeout(() => {
        toast.classList.add("show");
    }, 10);

    setTimeout(() => {
        toast.classList.remove("show");

        setTimeout(() => {
            toast.classList.add("hidden");


            if (tipo === "success") {
                window.location.href = "/productos";
            }

        }, 200);//Tiempo en lo que redirige a la pagina principal de productos
    }, 800);//Tiempo en lo que redirige a la pagina principal de productos
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const precioCompra = parseFloat(document.getElementById("precioCompra").value);
    const precioVenta = parseFloat(document.getElementById("precioVenta").value);
    const idProveedor = parseInt(document.getElementById("idProveedor").value);
    const stock = parseInt(document.getElementById("stock").value);


    if (!nombre || precioCompra <= 0 || precioVenta <= 0 || stock < 0) {
        mostrarToast("Datos inválidos. Verifica los campos.", "error");
        return;
    }

    if (precioVenta < precioCompra) {
        mostrarToast("El precio de venta no puede ser menor al de compra.", "error");
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
        const respuesta = await fetch('/api/productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(producto)
        });

        if (respuesta.ok) {
            mostrarToast("Producto creado correctamente", "success");
        } else {
            mostrarToast("Error al crear producto", "error");
        }

    } catch (error) {
        console.error(error);
        mostrarToast("Error de conexión con el servidor", "error");
    }
});