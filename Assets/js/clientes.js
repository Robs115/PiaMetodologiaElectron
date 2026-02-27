const tablaBody = document.querySelector("#tablaCliente tbody");
const buscador = document.getElementById("buscador");

let clientes = [];

function renderTabla(lista) {
    tablaBody.innerHTML = "";

    lista.forEach(cliente => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${cliente.id}</td>
            <td>${cliente.nombre}</td>
            <td>${cliente.telefono}</td>
            <td>${cliente.email}</td>
            <td>${cliente.direccion}</td>
            <td>
                <button class="btn editar">Editar</button>
                <button class="btn eliminar">Eliminar</button>
            </td>
        `;

        tablaBody.appendChild(fila);
    });
}

async function cargarClientes() {
    const respuesta = await fetch('/api/clientes');
    clientes = await respuesta.json();
    renderTabla(clientes);
}

buscador.addEventListener("keyup", () => {
    const texto = buscador.value.toLowerCase();
    const filtrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(texto)
    );
    renderTabla(filtrados);
});

cargarClientes();