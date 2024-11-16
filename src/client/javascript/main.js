function displayNotification(message) {
    let notification = document.querySelector('.notif')
    notification.querySelector('p').innerText = message
    notification.classList.add('active')
    setTimeout(() => {
        notification.classList.remove('active')
    }, 5000)
}