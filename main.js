const { app: electronApp, BrowserWindow, ipcMain } = require('electron');
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();


const server = express(); 
const PORT = 3000;

let currentUser = null;

const db = new sqlite3.Database(path.join(__dirname, 'PiaMetodologia.db'), (err) => {
    if (err) {
        console.error("Error conectando a la BD:", err.message);
    } else {
        console.log("Conectado a PIAMETODOLOGIA.db");
    }
});

function createWindow() {
    const win = new BrowserWindow({
    width: 1500,
    height: 800,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true
    }
});
    win.loadURL(`http://localhost:${PORT}/login`);
}

electronApp.whenReady().then(createWindow);

//dashboard
ipcMain.handle('obtenerDashboard', async () => {
    return new Promise((resolve, reject) => {

        db.get(`
            SELECT 
                (SELECT COUNT(*) FROM PRODUCTOS) AS totalProductos,
                (SELECT COUNT(*) FROM CLIENTES) AS totalClientes,
                (SELECT COUNT(*) FROM USUARIOS) AS totalUsuarios,
                (SELECT COUNT(*) FROM PROVEEDORES) AS totalProveedores,
                (SELECT COUNT(*) FROM PEDIDOS) AS totalPedidos,
                (SELECT IFNULL(SUM(TOTAL),0) FROM VENTAS) AS totalVentas,
                (
                    SELECT COUNT(*) 
                    FROM INVENTARIO 
                    WHERE STOCK <= STOCKMINIMO
                ) AS stockBajo
        `, (err, resumen) => {
            if (err) return reject(err);

            db.all(`
                SELECT FECHA, TOTAL
                FROM VENTAS
                ORDER BY FECHA DESC
                LIMIT 5
            `, (err2, ultimas) => {
                if (err2) return reject(err2);

                db.all(`
                    SELECT p.NOMBRE, SUM(d.CANTIDAD) as total
                    FROM DETALLEVENTA d
                    JOIN PRODUCTOS p ON d.IDPRODUCTO = p.IDPRODUCTO
                    GROUP BY p.NOMBRE
                    ORDER BY total DESC
                    LIMIT 5
                `, (err3, topProductos) => {
                    if (err3) return reject(err3);

                    db.all(`
                        SELECT DATE(FECHA) as fecha, SUM(TOTAL) as total
                        FROM VENTAS
                        GROUP BY DATE(FECHA)
                    `, (err4, grafica) => {
                        if (err4) return reject(err4);

                        db.all(`
                            SELECT u.NOMBRE, SUM(v.TOTAL) as total
                            FROM VENTAS v
                            JOIN USUARIOS u ON v.IDUSUARIO = u.IDUSUARIO
                            GROUP BY u.NOMBRE
                            ORDER BY total DESC
                            LIMIT 5
                        `, (err5, usuariosTop) => {
                            if (err5) return reject(err5);

                            db.all(`
                                SELECT p.NOMBRE, COUNT(*) as total
                                FROM PEDIDOS ped
                                JOIN PROVEEDORES p ON ped.IDPROVEEDOR = p.IDPROVEEDOR
                                GROUP BY p.NOMBRE
                                ORDER BY total DESC
                            `, (err6, proveedoresTop) => {
                                if (err6) return reject(err6);

                                resolve({
                                    ...resumen,
                                    ultimasVentas: ultimas,
                                    topProductos,
                                    ventasPorDia: grafica,
                                    usuariosTop,
                                    proveedoresTop
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

//Login

ipcMain.handle('login', (event, { usuario, contra }) => {
    return new Promise((resolve, reject) => {

        db.get(
            "SELECT USUARIO, ROL FROM USUARIOS WHERE USUARIO = ? AND PASSWORD = ?",
            [usuario, contra],
            (err, row) => {
                if (err) return reject(err);

                if (row) {
                    currentUser = row;
                    resolve(row);   // user found
                } else {
                    resolve(null);  // wrong login
                }
            }
        );

    });
});

ipcMain.handle('getUser', () => {
    return currentUser;
});


// Archivos estáticos
server.use(express.static('Assets'));
server.use(express.json());

// Rutas

server.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/login.html'));
});

server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

server.get('/detalle-venta', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/detalle-venta.html'));
});

server.get('/venta', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/venta.html'));
});

server.get('/ventas-listar', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/ventas-listar.html'));
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

server.get('/productos/editar/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/productos-editar.html'));
});


//Productos

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


// Obtener producto para editar
server.get('/api/productos/:id', (req, res) => {
    const id = req.params.id;
    
    const sql = `
        SELECT 
            P.IDPRODUCTO as id,
            P.NOMBRE as nombre,
            P.DESCRIPCION as descripcion,
            P.PRECIOCOMPRA as precioCompra,
            P.PRECIOVENTA as precioVenta,
            P.IDPROVEEDOR as idProveedor,
            IFNULL(I.STOCK, 0) as stock
        FROM PRODUCTOS P
        LEFT JOIN INVENTARIO I ON P.IDPRODUCTO = I.IDPRODUCTO
        WHERE P.IDPRODUCTO = ?
    `;
    
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error en la consulta" });
        }
        
        if (!row) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        res.json(row);
    });
});

// Actualizar producto
server.put('/api/productos/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, descripcion, precioCompra, precioVenta, idProveedor, stock } = req.body;
    
    console.log(`Actualizando producto ID: ${id}`);
    
    // Validar datos
    if (!nombre || precioCompra <= 0 || precioVenta <= 0 || stock < 0) {
        return res.status(400).json({ error: "Datos inválidos" });
    }
    
    // Actualizar tabla PRODUCTOS
    const sqlProducto = `
        UPDATE PRODUCTOS 
        SET NOMBRE = ?, 
            DESCRIPCION = ?, 
            PRECIOCOMPRA = ?, 
            PRECIOVENTA = ?, 
            IDPROVEEDOR = ?
        WHERE IDPRODUCTO = ?
    `;
    
    db.run(sqlProducto, [nombre, descripcion, precioCompra, precioVenta, idProveedor || null, id], function(err) {
        if (err) {
            console.error("Error al actualizar producto:", err);
            return res.status(500).json({ error: "Error al actualizar producto: " + err.message });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        console.log(`Producto ${id} actualizado, procediendo con inventario...`);
        
        // Manejar inventario
        const sqlCheckInventario = `SELECT IDPRODUCTO FROM INVENTARIO WHERE IDPRODUCTO = ?`;
        
        db.get(sqlCheckInventario, [id], (err2, row) => {
            if (err2) {
                console.error("Error al verificar inventario:", err2);
                return res.status(500).json({ error: "Error al verificar inventario" });
            }
            
            if (row) {
                // Actualizar inventario existente
                const sqlUpdateInventario = `UPDATE INVENTARIO SET STOCK = ? WHERE IDPRODUCTO = ?`;
                db.run(sqlUpdateInventario, [stock, id], (err3) => {
                    if (err3) {
                        console.error("Error al actualizar inventario:", err3);
                        return res.status(500).json({ error: "Error al actualizar inventario" });
                    }
                    console.log(`Inventario actualizado para producto ${id}`);
                    res.json({ success: true, message: "Producto actualizado correctamente" });
                });
            } else {
                // Crear nuevo registro de inventario
                const sqlInsertInventario = `INSERT INTO INVENTARIO (IDPRODUCTO, STOCK) VALUES (?, ?)`;
                db.run(sqlInsertInventario, [id, stock], (err3) => {
                    if (err3) {
                        console.error("Error al insertar inventario:", err3);
                        return res.status(500).json({ error: "Error al insertar inventario" });
                    }
                    console.log(`Inventario creado para producto ${id}`);
                    res.json({ success: true, message: "Producto actualizado correctamente" });
                });
            }
        });
    });
});

// Eliminar producto
server.delete('/api/productos/:id', (req, res) => {
    const id = req.params.id;
    
    // Primero verificar si el producto existe
    const sqlCheck = `SELECT IDPRODUCTO FROM PRODUCTOS WHERE IDPRODUCTO = ?`;
    
    db.get(sqlCheck, [id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error en la consulta" });
        }
        
        if (!row) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        // Eliminar primero de INVENTARIO (por la relación)
        const sqlDeleteInventario = `DELETE FROM INVENTARIO WHERE IDPRODUCTO = ?`;
        
        db.run(sqlDeleteInventario, [id], (err2) => {
            if (err2) {
                console.error(err2);
                return res.status(500).json({ error: "Error al eliminar inventario" });
            }
            
            // Luego eliminar de PRODUCTOS
            const sqlDeleteProducto = `DELETE FROM PRODUCTOS WHERE IDPRODUCTO = ?`;
            
            db.run(sqlDeleteProducto, [id], function(err3) {
                if (err3) {
                    console.error(err3);
                    return res.status(500).json({ error: "Error al eliminar producto" });
                }
                
                res.json({ success: true, message: "Producto eliminado correctamente" });
            });
        });
    });
});


//Pedidos

// Obtener pedidos
// Obtener pedidos con nombres de producto y proveedor
server.get('/api/pedidos', (req, res) => {
    const sql = `
        SELECT 
            P.IDPEDIDO as id,
            P.IDPRODUCTO as idproducto,
            PR.NOMBRE as nombre_producto,
            P.IDPROVEEDOR as idproveedor,
            PV.NOMBRE as nombre_proveedor,
            P.FECHAPEDIDO as fechapedido,
            P.CANTIDAD as cantidad
        FROM PEDIDOS P
        LEFT JOIN PRODUCTOS PR ON P.IDPRODUCTO = PR.IDPRODUCTO
        LEFT JOIN PROVEEDORES PV ON P.IDPROVEEDOR = PV.IDPROVEEDOR
        ORDER BY P.FECHAPEDIDO DESC
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



    const { idproducto, idproveedor, fechapedido, cantidad } = req.body;

    const sqlCliente = `
        INSERT INTO PEDIDOS
        (IDPRODUCTO, IDPROVEEDOR, FECHAPEDIDO, CANTIDAD)
        VALUES (?, ?, ?, ?)
    `;

    db.run(sqlCliente, [idproducto, idproveedor, fechapedido, cantidad], function(err) {

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

// Obtener pedido por ID con nombres
server.get('/api/pedidos/:id', (req, res) => {
    const id = req.params.id;
    
    const sql = `
        SELECT 
            P.IDPEDIDO as id,
            P.IDPRODUCTO as idproducto,
            PR.NOMBRE as nombre_producto,
            P.IDPROVEEDOR as idproveedor,
            PV.NOMBRE as nombre_proveedor,
            P.FECHAPEDIDO as fechapedido,
            P.CANTIDAD as cantidad
        FROM PEDIDOS P
        LEFT JOIN PRODUCTOS PR ON P.IDPRODUCTO = PR.IDPRODUCTO
        LEFT JOIN PROVEEDORES PV ON P.IDPROVEEDOR = PV.IDPROVEEDOR
        WHERE P.IDPEDIDO = ?
    `;
    
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error en la consulta" });
        }
        
        if (!row) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }
        
        res.json(row);
    });
});

// Actualizar pedido
server.put('/api/pedidos/:id', (req, res) => {
    const id = req.params.id;
    const { idproducto, idproveedor, fechapedido, cantidad } = req.body;
    
    // Validar que el producto exista
    const sqlCheckProducto = `SELECT IDPRODUCTO FROM PRODUCTOS WHERE IDPRODUCTO = ?`;
    
    db.get(sqlCheckProducto, [idproducto], (err, producto) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error al verificar producto" });
        }
        
        if (!producto) {
            return res.status(400).json({ error: "El producto no existe" });
        }
        
        // Validar que el proveedor exista
        const sqlCheckProveedor = `SELECT IDPROVEEDOR FROM PROVEEDORES WHERE IDPROVEEDOR = ?`;
        
        db.get(sqlCheckProveedor, [idproveedor], (err2, proveedor) => {
            if (err2) {
                console.error(err2);
                return res.status(500).json({ error: "Error al verificar proveedor" });
            }
            
            if (!proveedor) {
                return res.status(400).json({ error: "El proveedor no existe" });
            }
            
            // Actualizar pedido
            const sql = `
                UPDATE PEDIDOS 
                SET IDPRODUCTO = ?, 
                    IDPROVEEDOR = ?, 
                    FECHAPEDIDO = ?, 
                    CANTIDAD = ?
                WHERE IDPEDIDO = ?
            `;
            
            db.run(sql, [idproducto, idproveedor, fechapedido, cantidad, id], function(err3) {
                if (err3) {
                    console.error(err3);
                    return res.status(500).json({ error: "Error al actualizar pedido" });
                }
                
                if (this.changes === 0) {
                    return res.status(404).json({ error: "Pedido no encontrado" });
                }
                
                res.json({ success: true, message: "Pedido actualizado correctamente" });
            });
        });
    });
});

// Eliminar pedido
server.delete('/api/pedidos/:id', (req, res) => {
    const id = req.params.id;
    
    // Verificar si el pedido existe
    const sqlCheck = `SELECT IDPEDIDO FROM PEDIDOS WHERE IDPEDIDO = ?`;
    
    db.get(sqlCheck, [id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error en la consulta" });
        }
        
        if (!row) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }
        
        // Eliminar pedido
        const sqlDelete = `DELETE FROM PEDIDOS WHERE IDPEDIDO = ?`;
        
        db.run(sqlDelete, [id], function(err2) {
            if (err2) {
                console.error(err2);
                return res.status(500).json({ error: "Error al eliminar pedido" });
            }
            
            res.json({ success: true, message: "Pedido eliminado correctamente" });
        });
    });
});

// Agregar la ruta para la página de edición
server.get('/pedidos/editar/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/pedidos-editar.html'));
});


//Clientes

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

// Obtener cliente por ID (para editar)
server.get('/api/clientes/:id', (req, res) => {
    const id = req.params.id;
    
    const sql = `
        SELECT 
            IDCLIENTE as id,
            NOMBRE as nombre,
            TELEFONO as telefono,
            EMAIL as email,
            DIRECCION as direccion
        FROM CLIENTES
        WHERE IDCLIENTE = ?
    `;
    
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error en la consulta" });
        }
        
        if (!row) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        
        res.json(row);
    });
});

// Actualizar cliente
server.put('/api/clientes/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, telefono, email, direccion } = req.body;
    
    const sql = `
        UPDATE CLIENTES 
        SET NOMBRE = ?, 
            TELEFONO = ?, 
            EMAIL = ?, 
            DIRECCION = ?
        WHERE IDCLIENTE = ?
    `;
    
    db.run(sql, [nombre, telefono, email, direccion, id], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error al actualizar cliente" });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        
        res.json({ success: true, message: "Cliente actualizado correctamente" });
    });
});


// Eliminar cliente
server.delete('/api/clientes/:id', (req, res) => {
    const id = req.params.id;
    
    // Verificar si el cliente existe
    const sqlCheck = `SELECT IDCLIENTE FROM CLIENTES WHERE IDCLIENTE = ?`;
    
    db.get(sqlCheck, [id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error en la consulta" });
        }
        
        if (!row) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        
        // Eliminar cliente
        const sqlDelete = `DELETE FROM CLIENTES WHERE IDCLIENTE = ?`;
        
        db.run(sqlDelete, [id], function(err2) {
            if (err2) {
                console.error(err2);
                return res.status(500).json({ error: "Error al eliminar cliente: " + err2.message });
            }
            
            res.json({ success: true, message: "Cliente eliminado correctamente" });
        });
    });
});

// Agregar la ruta para la página de edición
server.get('/clientes/editar/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/clientes-editar.html'));
});


//Proveedores

// Obtener proveedores
server.get('/api/proveedores', (req, res) => {
    

    const sql = `
        SELECT 
            IDPROVEEDOR as id,
            NOMBRE as nombre,
            TELEFONO as telefono,
            EMAIL as email,
            DIRECCION as direccion,
            ACTIVO as activo
        FROM PROVEEDORES
    `;

    db.all(sql, [], (err, rows) => {
        console.log("PROVEEDORES ENCONTRADOS:", rows);
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Error en la consulta" });
        } else {
            res.json(rows);
        }
    });
});
//Crear proveedor
server.post('/api/proveedores', (req, res) => {

    console.log("BODY RECIBIDO:", req.body);

    const { nombre, telefono, email, direccion, activo } = req.body;

    const sqlCheck = `
        SELECT * FROM PROVEEDORES 
        WHERE EMAIL = ? OR TELEFONO = ? OR NOMBRE = ?
    `;
    
    db.get(sqlCheck, [email, telefono, nombre], (err, row) => {

        if (err) {
            console.error("Error en SELECT:", err);
            return res.status(400).json({success: false });
        }

        if (row) {
            return res.status(400).json({error: "Proveedor ya existe", success: false });
        }

        // 🔥 SOLO SI NO EXISTE, INSERTAMOS
        const sqlProveedor = `
            INSERT INTO PROVEEDORES
            (NOMBRE, TELEFONO, EMAIL, DIRECCION, ACTIVO)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.run(sqlProveedor, [nombre, telefono, email, direccion, activo], function(err) {

            if (err) {
                console.error("ERROR SQLITE:", err);
                return res.status(400).json({ success: false });
            }

            console.log("INSERT OK, ID:", this.lastID);

            return res.json({
                success: true,
                idProveedor: this.lastID
            });
        });

    });

});


// Obtener proveedor por ID (para editar)
server.get('/api/proveedores/:id', (req, res) => {
    const id = req.params.id;
    
    const sql = `
        SELECT 
            IDPROVEEDOR as id,
            NOMBRE as nombre,
            TELEFONO as telefono,
            EMAIL as email,
            DIRECCION as direccion,
            ACTIVO as activo
        FROM PROVEEDORES
        WHERE IDPROVEEDOR = ?
    `;
    
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error en la consulta" });
        }
        
        if (!row) {
            return res.status(404).json({ error: "Proveedor no encontrado" });
        }
        
        res.json(row);
    });
});

// Actualizar proveedor
server.put('/api/proveedores/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, telefono, email, direccion, activo } = req.body;
    
    const sql = `
        UPDATE PROVEEDORES 
        SET NOMBRE = ?, 
            TELEFONO = ?, 
            EMAIL = ?, 
            DIRECCION = ?,
            ACTIVO = ?
        WHERE IDPROVEEDOR = ?
    `;
    
    db.run(sql, [nombre, telefono, email, direccion, activo, id], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error al actualizar proveedor" });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: "Proveedor no encontrado" });
        }
        
        res.json({ success: true, message: "Proveedor actualizado correctamente" });
    });
});

// Eliminar proveedor
server.delete('/api/proveedores/:id', (req, res) => {
    const id = req.params.id;
    
    // Primero verificar si el proveedor existe
    const sqlCheck = `SELECT IDPROVEEDOR FROM PROVEEDORES WHERE IDPROVEEDOR = ?`;
    
    db.get(sqlCheck, [id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error en la consulta" });
        }
        
        if (!row) {
            return res.status(404).json({ error: "Proveedor no encontrado" });
        }
        
        // Verificar si tiene productos asociados
        const sqlCheckProductos = `SELECT COUNT(*) as total FROM PRODUCTOS WHERE IDPROVEEDOR = ?`;
        
        db.get(sqlCheckProductos, [id], (err2, result) => {
            if (err2) {
                console.error(err2);
                return res.status(500).json({ error: "Error al verificar productos asociados" });
            }
            
            if (result.total > 0) {
                return res.status(400).json({ 
                    error: `No se puede eliminar el proveedor porque tiene ${result.total} producto(s) asociado(s)` 
                });
            }
            
            // Eliminar proveedor
            const sqlDelete = `DELETE FROM PROVEEDORES WHERE IDPROVEEDOR = ?`;
            
            db.run(sqlDelete, [id], function(err3) {
                if (err3) {
                    console.error(err3);
                    return res.status(500).json({ error: "Error al eliminar proveedor" });
                }
                
                res.json({ success: true, message: "Proveedor eliminado correctamente" });
            });
        });
    });
});

// Agregar la ruta para la página de edición
server.get('/proveedores/editar/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/proveedores-editar.html'));
});

//Ventas

//Obtener ventas
server.get('/api/ventas', (req, res) => {
    

    const sql = `
        SELECT 
            IDVENTA as id,
            FECHA as fecha,
            IDUSUARIO as idusuario,
            TOTAL as total
        FROM VENTAS
    `;

    db.all(sql, [], (err, rows) => {
        console.log("VENTAS ENCONTRADAS:", rows);
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Error en la consulta" });
        } else {
            res.json(rows);
        }
    });
});

//buscar producto en venta
server.get("/producto/:codigo", (req, res) => {
    const codigo = req.params.codigo;

    db.get(
        "SELECT * FROM productos WHERE IDPRODUCTO = ?",
        [codigo],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: "Error en la base de datos" });
            }

            if (!row) {
                return res.json({ error: "Producto no encontrado" });
            }

            res.json(row);
        }
    );
});


//Generar venta
server.post('/api/ventas', (req, res) => {
    const { fecha, idusuario, total, productos } = req.body;

    const sqlVenta = `
        INSERT INTO VENTAS
        (FECHA, IDUSUARIO, TOTAL)
        VALUES (?, ?, ?)
    `;

    db.run(sqlVenta, [fecha, idusuario, total], function(err) {
        if (err) {
            console.error("ERROR SQLITE:", err);
            return res.status(500).json({ success: false });
        }

      
        const idVenta = this.lastID;
        console.log("INSERT OK, ID:", idVenta);

        
        const sqlDetalle = `
            INSERT INTO DETALLEVENTA
            (IDVENTA, IDPRODUCTO, CANTIDAD, PRECIOUNITARIO, SUBTOTAL)
            VALUES (?, ?, ?, ?, ?)
        `;
        const sqlUpdateStock = `
            UPDATE INVENTARIO
            SET STOCK = STOCK - ?
            WHERE IDPRODUCTO = ?
        `;
        productos.forEach(p => {
            db.run(sqlUpdateStock, [p.cantidad, p.IDPRODUCTO], (err) => {
                if (err) console.error("Error actualizando stock:", err);
            });

        });

        productos.forEach(p => {
            db.run(sqlDetalle, [
                idVenta,
                p.IDPRODUCTO,
                p.cantidad,
                p.PRECIO_UNITARIO,
                p.SUBTOTAL
            ], (err) => {
                if (err) console.error("Error insertando detalle:", err);
            });
        });

        
        res.json({
            success: true,
            idVenta: idVenta
        });
    });
});

//Obtener detalle-venta

server.get('/api/detalle-ventas', (req, res) => {
    
    const idVenta = req.query.idVenta;
    const sql = `
       SELECT 
    d.IDDETALLE,        -- ID detalle
    v.FECHA,            -- Fecha de la venta
    v.IDVENTA,          -- ID venta
    v.IDUSUARIO,        -- ID usuario
    d.IDPRODUCTO,       -- ID producto
    p.NOMBRE AS NOMBREPRODUCTO,  -- Nombre del producto
    d.CANTIDAD,         -- Cantidad vendida
    d.PRECIOUNITARIO,   -- Precio unitario
    d.SUBTOTAL,         -- Subtotal
    v.TOTAL             -- Total de la venta
FROM DETALLEVENTA d
JOIN VENTAS v
    ON d.IDVENTA = v.IDVENTA
JOIN PRODUCTOS p
    ON d.IDPRODUCTO = p.IDPRODUCTO
WHERE d.IDVENTA = ?;
`;

    db.all(sql, [idVenta], (err, rows) => {
        console.log("DETALLE DE VENTAS ENCONTRADO:", rows);
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Error en la consulta" });
        } else {
            res.json(rows);
        }
    });
});


// Obtener todas las ventas con detalles
server.get('/api/ventas', (req, res) => {
    const sql = `
        SELECT 
            V.IDVENTA as id,
            V.FECHA as fecha,
            V.IDUSUARIO as idusuario,
            U.NOMBRE as nombre_usuario,
            V.TOTAL as total
        FROM VENTAS V
        LEFT JOIN USUARIOS U ON V.IDUSUARIO = U.IDUSUARIO
        ORDER BY V.FECHA DESC
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error en la consulta" });
        }
        res.json(rows);
    });
});

// Obtener venta por ID con sus detalles
server.get('/api/ventas/:id', (req, res) => {
    const id = req.params.id;
    
    const sqlVenta = `
        SELECT 
            V.IDVENTA as id,
            V.FECHA as fecha,
            V.IDUSUARIO as idusuario,
            U.NOMBRE as nombre_usuario,
            V.TOTAL as total
        FROM VENTAS V
        LEFT JOIN USUARIOS U ON V.IDUSUARIO = U.IDUSUARIO
        WHERE V.IDVENTA = ?
    `;
    
    db.get(sqlVenta, [id], (err, venta) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error en la consulta" });
        }
        
        if (!venta) {
            return res.status(404).json({ error: "Venta no encontrada" });
        }
        
        // Obtener detalles de la venta
        const sqlDetalles = `
            SELECT 
                D.IDDETALLE as id,
                D.IDPRODUCTO as idproducto,
                P.NOMBRE as nombre_producto,
                D.CANTIDAD as cantidad,
                D.PRECIO_UNITARIO as precio_unitario,
                D.SUBTOTAL as subtotal
            FROM DETALLEVENTA D
            LEFT JOIN PRODUCTOS P ON D.IDPRODUCTO = P.IDPRODUCTO
            WHERE D.IDVENTA = ?
        `;
        
        db.all(sqlDetalles, [id], (err2, detalles) => {
            if (err2) {
                console.error(err2);
                return res.status(500).json({ error: "Error al obtener detalles" });
            }
            
            res.json({
                ...venta,
                detalles
            });
        });
    });
});

// Actualizar venta (solo fecha y usuario, los detalles se manejan aparte)
server.put('/api/ventas/:id', (req, res) => {
    const id = req.params.id;
    const { fecha, idusuario } = req.body;
    
    const sql = `
        UPDATE VENTAS 
        SET FECHA = ?, 
            IDUSUARIO = ?
        WHERE IDVENTA = ?
    `;
    
    db.run(sql, [fecha, idusuario, id], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error al actualizar venta" });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: "Venta no encontrada" });
        }
        
        res.json({ success: true, message: "Venta actualizada correctamente" });
    });
});

// Eliminar venta y sus detalles
server.delete('/api/ventas/:id', (req, res) => {
    const id = req.params.id;
    
    // Verificar si la venta existe
    const sqlCheck = `SELECT IDVENTA FROM VENTAS WHERE IDVENTA = ?`;
    
    db.get(sqlCheck, [id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error en la consulta" });
        }
        
        if (!row) {
            return res.status(404).json({ error: "Venta no encontrada" });
        }
        
        // Primero eliminar los detalles de la venta
        const sqlDeleteDetalles = `DELETE FROM DETALLEVENTA WHERE IDVENTA = ?`;
        
        db.run(sqlDeleteDetalles, [id], function(err2) {
            if (err2) {
                console.error(err2);
                return res.status(500).json({ error: "Error al eliminar detalles de la venta" });
            }
            
            // Luego eliminar la venta
            const sqlDeleteVenta = `DELETE FROM VENTAS WHERE IDVENTA = ?`;
            
            db.run(sqlDeleteVenta, [id], function(err3) {
                if (err3) {
                    console.error(err3);
                    return res.status(500).json({ error: "Error al eliminar venta" });
                }
                
                res.json({ success: true, message: "Venta eliminada correctamente" });
            });
        });
    });
});

// Agregar la ruta para la página de edición
server.get('/ventas/editar/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/ventas-editar.html'));
});

// Agregar la ruta para detalle de venta
server.get('/detalle-venta', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/detalle-venta.html'));
});


  


// Iniciar servidor
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});