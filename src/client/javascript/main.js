activeNotif = false;
function displayNotification(message) {
    if(activeNotif) return
    activeNotif = true

    let notification = document.querySelector('.notif')
    notification.querySelector('p').innerText = message
    notification.classList.add('active')
    setTimeout(() => {
        notification.classList.remove('active')
        activeNotif = false
    }, 5000)

}

function toggleLoading(action) {
    let loading = document.querySelector('.loading-calendar')
    loading.style.display = (action == 'disable') ? 'none' : 'flex'
}

socket.on("connect", () => {
    console.log("Connected to Socket.IO server");
});

socket.on("groupUpdated", (data) => {
    const feed = document.querySelector(".campus_feed_content");
    const feedInfo = document.createElement("p");
    feedInfo.innerText = data.message;
    feed.appendChild(feedInfo);
});

socket.on("disconnect", () => {
    console.log("Disconnected from Socket.IO server");
});

socket.on("error", (error) => {
    console.error("Socket.IO error:", error);
});


let defferedPrompt;
const addbtn = document.querySelector('.version');

window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    defferedPrompt = event
    addbtn.style.display = 'block';
});

addbtn.addEventListener('click', event => {
    defferedPrompt.prompt();

    defferedPrompt.userChoice.then(choice => {
        if(choice.outcome === 'accepted'){
            console.log('user accepted the prompt')
        }
        defferedPrompt = null;
    })
})