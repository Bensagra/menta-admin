if (sessionStorage.getItem("userId") === null) {
    window.location.href = "../index.html";
    
}

document.getElementById('cerrar').addEventListener('click', () => {
    sessionStorage.removeItem('user');
    window.location.href = '../index.html';
});