activeNotif = false;
function displayNotification(message) {
    if (activeNotif) return
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




function openModal(modal) {
    navigator.vibrate(10)
    document.querySelector('.modal').classList.add('active')
    document.querySelectorAll('.modal-content > div').forEach(el => {
        el.style.display = 'none'
    })
    if (modal) {
        document.querySelector(`.${modal}`).style.display = 'flex'
    }
}

function closeModal() {
    document.querySelector('.modal').classList.remove('active')
}

document.querySelector('.modal').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active')
    }
})

let slider = document.getElementById("myRange");
let output = document.getElementById("places");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}


document.querySelector('.profile').addEventListener('dblclick', () => {
    document.location.href = '/admin/auth'
})

document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => {
        tag.classList.toggle('selected')
    })
})