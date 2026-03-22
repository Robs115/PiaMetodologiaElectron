
const tablaBody = document.querySelector("#tablaDetalleVentas tbody");
const divtotal = document.getElementById("total");
const buscador = document.getElementById("buscador");
const params = new URLSearchParams(window.location.search);
const idVenta = params.get("idVenta");  // <-- este es el ID de la venta

let detalle = []; // Lista de detalles de venta
 // ID de venta para filtrar detalles

function renderTabla(lista) {
    tablaBody.innerHTML = "";
    
    let total = 0; // Variable para acumular el total general
    
    lista.forEach(detalle => {
        const fila = document.createElement("tr");
        
        total += detalle.SUBTOTAL; // Sumar el subtotal de cada detalle al total general

        fila.innerHTML = `
            <td>${detalle.IDDETALLE}</td>
            <td>${detalle.FECHA}</td>
            <td>${detalle.IDVENTA}</td>
            <td>${detalle.IDUSUARIO}</td>
            <td>${detalle.IDPRODUCTO}</td>
            <td>${detalle.NOMBREPRODUCTO}</td>
            <td>${detalle.CANTIDAD}</td>
            <td>${detalle.PRECIO}</td>
            <td>${detalle.SUBTOTAL}</td>
            
        `;

        tablaBody.appendChild(fila);
        divtotal.innerHTML = `<p><strong>Total: $${total.toFixed(2)}</strong></p>`;
    });
}
async function cargarDetalleVentas(idVenta) {
    const respuesta = await fetch(`/api/detalle-ventas?idVenta=${idVenta}`);
    const detalle = await respuesta.json();
    renderTabla(detalle);
}

// Llamamos a la función con el ID de la URL


buscador.addEventListener("keyup", () => {
    const texto = buscador.value.toLowerCase();
    const filtrados = detalle.filter(d =>
        d.id.toLowerCase().includes(texto)
    );
    renderTabla(filtrados);
});

cargarDetalleVentas(idVenta);