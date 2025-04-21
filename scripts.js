let button = document.getElementById('loginButton');

function showLoading() {
    document.getElementById("loadingOverlay").style.display = "flex";
}

function hideLoading() {
    document.getElementById("loadingOverlay").style.display = "none";
}

button.addEventListener('click', async()=> {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    try {
        showLoading();

        let data = await fetch('https://menta-backend.vercel.app/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
        let response = await data.json();
        console.log(response);
        
        if (data.status === 200 && await response.user.role === 'ADMIN') {
            sessionStorage.setItem('userId', JSON.stringify(response.user.id));
            window.location.href = './home/admin.html';
        }
        if (data.status === 200 && await response.user.role != 'ADMIN') {
            alert('Your user its not an admin');
        }
        if (data.status === 401) {
            alert('Invalid email or password');
        }
        
    } catch (error) {
        alert('Invalid email or password');
        console.error(error);
    }
    hideLoading();
});