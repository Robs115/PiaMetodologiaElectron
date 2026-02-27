const { app: electronApp, BrowserWindow } = require('electron');
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();


const server = express(); // 👈 nombre diferente
const PORT = 3000;

const db = new sqlite3.Database(path.join(__dirname, 'PiaMetodologia.db'), (err) => {
    if (err) {
        console.error("Error conectando a la BD:", err.message);
    } else {
        console.log("Conectado a PIAMETODOLOGIA.db");
    }
});








function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720
    });

    // 👇 MUY IMPORTANTE
    win.loadURL(`http://localhost:${PORT}`);
}

electronApp.whenReady().then(createWindow);



// Archivos estáticos
server.use(express.static('Assets'));
server.use(express.json());

// Rutas
server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

server.get('/venta', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/venta.html'));
});

server.get('/clientes', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/clientes.html'));
});

server.get('/pedidos', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/pedidos.html'));
});

server.get('/productos', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/productos.html'));
});

server.get('/proveedores', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/proveedores.html'));
});

server.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/dashboard.html'));
});

server.get('/clientes/crear', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/clientes-crear.html'));
});

server.get('/pedidos/crear', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/pedidos-crear.html'));
});

server.get('/proveedores/crear', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/proveedores-crear.html'));
});

server.get('/productos/crear', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/productos-crear.html'));
});

server.get('/venta/listar', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/ventas-listar.html'));
});


// Obtener productos
server.get('/api/productos', (req, res) => {

    const sql = `
        SELECT 
            P.IDPRODUCTO as id,
            P.NOMBRE as nombre,
            P.PRECIOVENTA as precio,
            IFNULL(I.STOCK, 0) as stock
        FROM PRODUCTOS P
        LEFT JOIN INVENTARIO I
        ON P.IDPRODUCTO = I.IDPRODUCTO
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Error en la consulta" });
        } else {
            res.json(rows);
        }
    });
});


// Crear producto
server.post('/api/productos', (req, res) => {

    const { nombre, descripcion, precioCompra, precioVenta, idProveedor, stock } = req.body;

    const sqlProducto = `
        INSERT INTO PRODUCTOS 
        (NOMBRE, DESCRIPCION, PRECIOCOMPRA, PRECIOVENTA, IDPROVEEDOR)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sqlProducto, [nombre, descripcion, precioCompra, precioVenta, idProveedor], function(err) {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error al insertar producto" });
        }

        const idProducto = this.lastID;

        const sqlInventario = `
            INSERT INTO INVENTARIO (IDPRODUCTO, STOCK)
            VALUES (?, ?)
        `;

        db.run(sqlInventario, [idProducto, stock], (err2) => {

            if (err2) {
                console.error(err2);
                return res.status(500).json({ error: "Error al insertar inventario" });
            }

            res.json({ success: true });
        });
    });
});

// Obtener pedidos
server.get('/api/pedidos', (req, res) => {
    

    const sql = `
        SELECT 
            IDPEDIDO as id,
            IDPRODUCTO as idproducto,
            IDPROVEEDOR as idproveedor,
            FECHAPEDIDO as fechapedido,
            CANTIDAD as cantidad
        FROM PEDIDOS
    `;

    db.all(sql, [], (err, rows) => {
        
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Error en la consulta" });
        } else {
            res.json(rows);
        }
    });
});


//Crear pedido
server.post('/api/pedidos', (req, res) => {



    const { idproducto, idProveedor, fechapedido, cantidad } = req.body;

    const sqlCliente = `
        INSERT INTO PEDIDOS
        (IDPRODUCTO, IDPROVEEDOR, FECHAPEDIDO, CANTIDAD)
        VALUES (?, ?, ?, ?)
    `;

    db.run(sqlCliente, [idproducto, idProveedor, fechapedido, cantidad], function(err) {

        if (err) {
            console.error("ERROR SQLITE:", err);
            return res.status(500).json({ success: false });
        }

        console.log("INSERT OK, ID:", this.lastID); // ← IMPORTANTE

        res.json({
            success: true,
            idCliente: this.lastID
        });

    });

});

// Obtener clientes
server.get('/api/clientes', (req, res) => {
    

    const sql = `
        SELECT 
            IDCLIENTE as id,
            NOMBRE as nombre,
            TELEFONO as telefono,
            EMAIL as email,
            DIRECCION as direccion
        FROM CLIENTES
    `;

    db.all(sql, [], (err, rows) => {
        console.log("CLIENTES ENCONTRADOS:", rows);
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Error en la consulta" });
        } else {
            res.json(rows);
        }
    });
});


//Crear cliente
server.post('/api/clientes', (req, res) => {

    console.log("BODY RECIBIDO:", req.body);

    const { nombre, telefono, email, direccion } = req.body;

    const sqlCliente = `
        INSERT INTO CLIENTES
        (NOMBRE, TELEFONO, EMAIL, DIRECCION)
        VALUES (?, ?, ?, ?)
    `;

    db.run(sqlCliente, [nombre, telefono, email, direccion], function(err) {

        if (err) {
            console.error("ERROR SQLITE:", err);
            return res.status(500).json({ success: false });
        }

        console.log("INSERT OK, ID:", this.lastID); // ← IMPORTANTE

        res.json({
            success: true,
            idCliente: this.lastID
        });

    });

});

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});