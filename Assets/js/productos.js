const productos = [
    { id: 1, nombre: "Croquetas Premium", precio: 450, stock: 20 },
    { id: 2, nombre: "Arena para gato", precio: 180, stock: 35 },
    { id: 3, nombre: "Vacuna Antirrábica", precio: 350, stock: 15 },
    { id: 4, nombre: "Shampoo Canino", precio: 120, stock: 40 }
];

const tablaBody = document.querySelector("#tablaProductos tbody");
const buscador = document.getElementById("buscador");

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
                <button class="btn editar" onclick="editar(${producto.id})">Editar</button>
                <button class="btn eliminar" onclick="eliminar(${producto.id})">Eliminar</button>
            </td>
        `;

        tablaBody.appendChild(fila);
    });
}

function editar(id) {
    alert("Editar producto ID: " + id);
}

function eliminar(id) {
    const index = productos.findIndex(p => p.id === id);
    if (index !== -1) {
        productos.splice(index, 1);
        renderTabla(productos);
    }
}

buscador.addEventListener("keyup", () => {
    const texto = buscador.value.toLowerCase();
    const filtrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(texto)
    );
    renderTabla(filtrados);
});

renderTabla(productos);