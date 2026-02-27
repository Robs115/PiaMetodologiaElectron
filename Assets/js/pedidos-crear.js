const form = document.getElementById("formPedidos");


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
                window.location.href = "/pedidos";
            }

        }, 200);//Tiempo en lo que redirige a la pagina principal de productos
    }, 800);//Tiempo en lo que redirige a la pagina principal de productos
}




form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const idproducto = document.getElementById("idproducto").value.trim();
    const idproveedor = document.getElementById("idproveedor").value.trim();
    const fechapedido = document.getElementById("fechapedido").value.trim();
    const cantidad = document.getElementById("cantidad").value.trim();

    

    

    const pedido = {
        idproducto,
        idproveedor,
        fechapedido,
        cantidad
    };

    try {
        const respuesta = await fetch('/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedido)
        });

        if (respuesta.ok) {
            mostrarToast("Cliente creado correctamente", "success");
        } else {
            mostrarToast("Error al crear cliente", "error");
        }

    } catch (error) {
        console.error(error);
        mostrarToast("Error de conexión con el servidor", "error");
    }
});

