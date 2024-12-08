async function login() {
    fetch('/admin/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            mail: document.getElementById('mail').value,
            password: document.getElementById('password').value,
        }),
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                console.log("erreur");
            } else {
                console.log("succès");
                setTimeout(() => {
                    window.location.href = '/admin/dashboard';
                }, 1500);
            }
        })
        .catch(err => {
            console.log("erreur");
        });
}