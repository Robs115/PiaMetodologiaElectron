const proveedores = [
    { id: 1, nombre: "Francisco Huerta", telefono: 450, email: "croquetas@empresa.com", direccion: "Calle Falsa 123", activo: true },
    { id: 2, nombre: "Nelson Rodriguez", telefono: 320, email: "arena@empresa.com", direccion: "Avenida Principal 456", activo: false },
    { id: 3, nombre: "Roberto Gael", telefono: 560, email: "vacuna@empresa.com", direccion: "Calle Secundaria 789", activo: true },
    { id: 4, nombre: "Hiram Mendoza", telefono: 280, email: "shampoo@empresa.com", direccion: "Boulevard Central 101", activo: false }
];

const tablaBody = document.querySelector("#tablaProveedores tbody");
const buscador = document.getElementById("buscador");

function renderTabla(lista) {
    tablaBody.innerHTML = "";


    
    lista.forEach(proveedores => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${proveedores.id}</td>
            <td>${proveedores.nombre}</td>
            <td>$${proveedores.telefono}</td>
            <td>${proveedores.email}</td>
            <td>${proveedores.direccion}</td>
            <td>${proveedores.activo ? 'Sí' : 'No'}</td>
            <td>
                <button class="btn editar" onclick="editar(${proveedores.id})">Editar</button>
                <button class="btn eliminar" onclick="eliminar(${proveedores.id})">Eliminar</button>
            </td>
        `;

        tablaBody.appendChild(fila);
    });
}

function editar(id) {
    alert("Editar proveedor ID: " + id);
}

function eliminar(id) {
    const index = proveedores.findIndex(c => c.id === id);
    if (index !== -1) {
        proveedores.splice(index, 1);
        renderTabla(proveedores);
    }
}

buscador.addEventListener("keyup", () => {
    const texto = buscador.value.toLowerCase();
    const filtrados = proveedores.filter(c =>
        c.nombre.toLowerCase().includes(texto)
    );
    renderTabla(filtrados);
});

renderTabla(proveedores);