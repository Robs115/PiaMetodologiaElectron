async function cargarDashboard() {
    const data = await window.api.obtenerDashboard();
    console.log("DATA:", data);

    // KPIs
    document.getElementById('ventas').innerText = "$" + (data.totalVentas || 0);
    document.getElementById('productos').innerText = data.totalProductos;
    document.getElementById('clientes').innerText = data.totalClientes;
    document.getElementById('stock').innerText = data.stockBajo;

    // Tabla
    const tabla = document.getElementById('tablaVentas');
    tabla.innerHTML = "";
    data.ultimasVentas.forEach(v => {
        tabla.innerHTML += `
            <tr>
                <td>${v.FECHA}</td>
                <td>$${v.TOTAL}</td>
            </tr>
        `;
    });

    // Top productos
    const lista = document.getElementById('topProductos');
    lista.innerHTML = "";
    data.topProductos.forEach(p => {
        lista.innerHTML += `<li>${p.NOMBRE} (${p.total})</li>`;
    });

    crearGrafica(data.ventasPorDia);
}

function crearGrafica(datos) {
    const ctx = document.getElementById('ventasChart');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: datos.map(d => d.fecha),
            datasets: [{
                label: 'Ventas',
                data: datos.map(d => d.total)
            }]
        }
    });
}

cargarDashboard();