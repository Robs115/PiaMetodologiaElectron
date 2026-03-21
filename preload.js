const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    obtenerDashboard: () => ipcRenderer.invoke('obtenerDashboard')
});