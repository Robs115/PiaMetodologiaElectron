const pedidos = [
    { id: 1, producto: "Francisco Huerta", proveedor: 450, cantidad: "croquetas@empresa.com", precio: "Calle Falsa 123",activo: true },
    { id: 2, producto: "Nelson Rodriguez", proveedor: 320, cantidad: "arena@empresa.com", precio: "Avenida Principal 456", activo: true },
    { id: 3, producto: "Roberto Gael", proveedor: 560, cantidad: "vacuna@empresa.com", precio: "Calle Secundaria 789", activo: true },
    { id: 4, producto: "Hiram Mendoza", proveedor: 280, cantidad: "shampoo@empresa.com", precio: "Boulevard Central 101", activo: true}
];

const tablaBody = document.querySelector("#tablaPedidos tbody");
const buscador = document.getElementById("buscador");

function renderTabla(lista) {
    tablaBody.innerHTML = "";
    
    lista.forEach(pedidos => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${pedidos.id}</td>
            <td>${pedidos.producto}</td>
            <td>${pedidos.proveedor}</td>
            <td>${pedidos.cantidad}</td>
            <td>${pedidos.precio}</td>
            <td>${pedidos.activo ? "Activo" : "Inactivo"}</td>
            <td>
                <button class="btn editar" onclick="editar(${pedidos.id})">Editar</button>
                <button class="btn eliminar" onclick="eliminar(${pedidos.id})">Eliminar</button>
            </td>
        `;

        tablaBody.appendChild(fila);
    });
}

function editar(id) {
    alert("Editar pedido ID: " + id);
}

function eliminar(id) {
    const index = pedidos.findIndex(p => p.id === id);
    if (index !== -1) {
        pedidos.splice(index, 1);
        renderTabla(pedidos);
    }
}

buscador.addEventListener("keyup", () => {
    const texto = buscador.value.toLowerCase();
    const filtrados = pedidos.filter(p =>
        p.producto.toLowerCase().includes(texto)
    );
    renderTabla(filtrados);
});

renderTabla(pedidos);