const clientes = [
    { id: 1, nombre: "Francisco Huerta", telefono: 450, email: "croquetas@empresa.com", direccion: "Calle Falsa 123" },
    { id: 2, nombre: "Nelson Rodriguez", telefono: 320, email: "arena@empresa.com", direccion: "Avenida Principal 456" },
    { id: 3, nombre: "Roberto Gael", telefono: 560, email: "vacuna@empresa.com", direccion: "Calle Secundaria 789" },
    { id: 4, nombre: "Hiram Mendoza", telefono: 280, email: "shampoo@empresa.com", direccion: "Boulevard Central 101" }
];

const tablaBody = document.querySelector("#tablaClientes tbody");
const buscador = document.getElementById("buscador");

function renderTabla(lista) {
    tablaBody.innerHTML = "";


    
    lista.forEach(clientes => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${clientes.id}</td>
            <td>${clientes.nombre}</td>
            <td>$${clientes.telefono}</td>
            <td>${clientes.email}</td>
            <td>${clientes.direccion}</td>
            <td>
                <button class="btn editar" onclick="editar(${clientes.id})">Editar</button>
                <button class="btn eliminar" onclick="eliminar(${clientes.id})">Eliminar</button>
            </td>
        `;

        tablaBody.appendChild(fila);
    });
}

function editar(id) {
    alert("Editar cliente ID: " + id);
}

function eliminar(id) {
    const index = clientes.findIndex(c => c.id === id);
    if (index !== -1) {
        clientes.splice(index, 1);
        renderTabla(clientes);
    }
}

buscador.addEventListener("keyup", () => {
    const texto = buscador.value.toLowerCase();
    const filtrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(texto)
    );
    renderTabla(filtrados);
});

renderTabla(clientes);