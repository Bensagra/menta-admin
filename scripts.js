let button = document.getElementById('loginButton');
button.addEventListener('click', async()=> {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
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
});