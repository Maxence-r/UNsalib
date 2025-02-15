function showError(error) {
    const errorDisplay = document.querySelector('#error-display');
    errorDisplay.textContent = error;
    errorDisplay.style.display = 'block';
}

async function login() {
    fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
        }),
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                if (data.error == 'BAD_CREDENTIALS') {
                    showError('Nom d\'utilisateur ou mot de passe incorrect');
                } else if (data.error == 'INTERNAL_ERROR') {
                    showError('Erreur interne du serveur');
                } else {
                    showError('Erreur inconnue');
                }
            } else {
                window.location.href = '/admin/dashboard';
            }
        })
        .catch((err) => {
            console.error(err);
            showError('Erreur inconnue');
        });
}


var input = document.querySelectorAll('input');
input.forEach((input) => {
    input.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.querySelector('#submit-button').click();
        }
    });
});