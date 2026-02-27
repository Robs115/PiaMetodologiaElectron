const tablaBody = document.querySelector("#tablaProveedores tbody");
const buscador = document.getElementById("buscador");

let proveedores = [];

function renderTabla(lista) {
    tablaBody.innerHTML = "";

    lista.forEach(proveedor => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${proveedor.id}</td>
            <td>${proveedor.nombre}</td>
            <td>${proveedor.telefono}</td>
            <td>${proveedor.email}</td>
            <td>${proveedor.direccion}</td>
            <td>${proveedor.activo}</td>

            <td>
                <button class="btn editar">Editar</button>
                <button class="btn eliminar">Eliminar</button>
            </td>
        `;

        tablaBody.appendChild(fila);
    });
}

async function cargarProveedores() {
    const respuesta = await fetch('/api/proveedores');
    proveedores = await respuesta.json();
    renderTabla(proveedores);
}

buscador.addEventListener("keyup", () => {
    const texto = buscador.value.toLowerCase();
    const filtrados = proveedores.filter(p =>
        p.nombre.toLowerCase().includes(texto)
    );
    renderTabla(filtrados);
});

cargarProveedores();