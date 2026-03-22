
const tablaBody = document.querySelector("#tablaVentas tbody");
const buscador = document.getElementById("buscador");

let ventas = [];

function renderTabla(lista) {
    tablaBody.innerHTML = "";

    lista.forEach(venta => {
        const fila = document.createElement("tr");
        
        fila.innerHTML = `
            <td>${venta.id}</td>
            <td>${venta.fecha}</td>
            <td>${venta.idusuario}</td>
            <td>${venta.total}</td>
            <td>
                <button class="btn editar">Editar</button>
                <button class="btn detalle"> <a href="/detalle-venta?idVenta=${venta.id}" class="btn btn-success">
            Detalle
        </a></button>
                <button class="btn eliminar">Eliminar</button>
            </td>
        `;

        tablaBody.appendChild(fila);
    });
}

async function cargarVentas() {
    const respuesta = await fetch('/api/ventas');
    ventas = await respuesta.json();
    renderTabla(ventas);
}

buscador.addEventListener("keyup", () => {
    const texto = buscador.value.toLowerCase();
    const filtrados = ventas.filter(v =>
        v.id.toLowerCase().includes(texto)
    );
    renderTabla(filtrados);
});

cargarVentas();