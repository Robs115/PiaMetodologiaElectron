const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    obtenerDashboard: () => ipcRenderer.invoke('obtenerDashboard'),
    login: (data) => ipcRenderer.invoke('login', data),
    getUser: () => ipcRenderer.invoke('getUser')
});