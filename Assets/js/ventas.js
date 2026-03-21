const input = document.getElementById("buscadorproducto");
const tabla = document.querySelector("#tablaVentas tbody");

let venta = []; 

input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
        console.log("Buscando producto:", input.value);
        const codigo = input.value.trim();

        if (!codigo) return;

        try {
            const res = await fetch(`http://localhost:3000/producto/${codigo}`);
            const data = await res.json();

            if (data.error) {
                alert("Producto no encontrado");
                input.value = "";
                return;
            }

            agregarProducto(data);
            input.value = "";

        } catch (error) {
            console.error(error);
        }
    }
});

function agregarProducto(producto) {
    // Ver si ya existe en la venta
    const existente = venta.find(p => p.IDPRODUCTO === producto.IDPRODUCTO);

    if (existente) {
        existente.cantidad++;
    } else {
        venta.push({
            ...producto,
            cantidad: 1
        });
    }

    renderTabla();
}

function renderTabla() {
    tabla.innerHTML = "";

    let total = 0;

    venta.forEach(p => {
        const subtotal = p.PRECIOVENTA * p.cantidad;
        total += subtotal;

        const fila = `
            <tr>
                <td>${p.NOMBRE}</td>
                <td>$${p.PRECIOVENTA}</td>
                <td>${p.cantidad}</td>
                <td>$${subtotal}</td>
            </tr>
        `;

        tabla.innerHTML += fila;
    });

    console.log("Total:", total);
}