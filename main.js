const { app: electronApp, BrowserWindow } = require('electron');
const express = require('express');
const path = require('path');

const server = express(); // 👈 nombre diferente
const PORT = 3000;

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
// Iniciar servidor
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});