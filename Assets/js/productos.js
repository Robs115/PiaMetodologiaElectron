const tablaBody = document.querySelector("#tablaProductos tbody");
const buscador = document.getElementById("buscador");

let productos = [];

function renderTabla(lista) {
    tablaBody.innerHTML = "";

    lista.forEach(producto => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${producto.id}</td>
            <td>${producto.nombre}</td>
            <td>$${producto.precio}</td>
            <td>${producto.stock}</td>
            <td>
                <button class="btn editar">Editar</button>
                <button class="btn eliminar">Eliminar</button>
            </td>
        `;

        tablaBody.appendChild(fila);
    });
}

async function cargarProductos() {
    const respuesta = await fetch('/api/productos');
    productos = await respuesta.json();
    renderTabla(productos);
}

buscador.addEventListener("keyup", () => {
    const texto = buscador.value.toLowerCase();
    const filtrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(texto)
    );
    renderTabla(filtrados);
});

cargarProductos();