const tablaBody = document.querySelector("#tablaPedidos tbody");
const buscador = document.getElementById("buscador");

let pedidos = [];

function renderTabla(lista) {
    tablaBody.innerHTML = "";

    lista.forEach(pedido => {
        const fila = document.createElement("tr");
 
        fila.innerHTML = `
            <td>${pedido.id}</td>
            <td>${pedido.idproducto}</td>
            <td>$${pedido.idproveedor}</td>
            <td>${pedido.fechapedido}</td>
            <td>${pedido.cantidad}</td>
            
        
            <td>
                <button class="btn editar">Editar</button>
                <button class="btn eliminar">Eliminar</button>
            </td>
        `;

        tablaBody.appendChild(fila);
    });
}

async function cargarPedidos() {
    const respuesta = await fetch('/api/pedidos');
    pedidos = await respuesta.json();
    renderTabla(pedidos);
}

buscador.addEventListener("keyup", () => {
    const texto = buscador.value.toLowerCase();
    const filtrados = pedidos.filter(p =>
        p.idproducto.toLowerCase().includes(texto)
    );
    renderTabla(filtrados);
});

cargarPedidos();