
window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnLogin").addEventListener("click", async () => {
        const usuario = document.getElementById("usuario").value;
        const contra = document.getElementById("contrasena").value;
        
        const result = await window.api.login({ usuario, contra });
        
        if (result) {
            window.location = "/";
        } else {
            document.getElementById("mensaje").textContent = "Datos inválidos.";
        }
    });
    
    document.getElementById("usuario").addEventListener("input", () => {
        document.getElementById("mensaje").textContent = "";
    });
});

