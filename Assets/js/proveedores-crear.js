const form = document.getElementById("formProveedor");


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
                window.location.href = "/proveedores";
            }

        }, 200);//Tiempo en lo que redirige a la pagina principal de productos
    }, 800);//Tiempo en lo que redirige a la pagina principal de productos
}




form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const email = document.getElementById("email").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const activo = document.getElementById("activo").value.trim();

    

    

    const proveedor = {
        nombre,
        telefono,
        email,
        direccion,
        activo
    };

    try {
        const respuesta = await fetch('/api/proveedores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(proveedor)
        });

        if (respuesta.ok) {
            mostrarToast("Proveedor creado correctamente", "success");
        } else {
            mostrarToast("Error al crear proveedor", "error");
        }

    } catch (error) {
        console.error(error);
        mostrarToast("Error de conexión con el servidor", "error");
    }
});

