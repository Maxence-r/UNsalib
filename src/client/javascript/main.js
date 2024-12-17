let params = new URLSearchParams(window.location.search);
let isFromSelect = params.get("fromSelector");

/* let campus = localStorage.getItem("campus");

if (!campus) {
    window.location.href = "/campus";
}
 */

activeNotif = false;
function displayNotification(message) {
    if (activeNotif) return;
    activeNotif = true;

    let notification = document.querySelector(".notif");
    notification.querySelector("p").innerText = message;
    notification.classList.add("active");
    setTimeout(() => {
        notification.classList.remove("active");
        activeNotif = false;
    }, 5000);
}

function toggleLoading(action) {
    let loading = document.querySelector(".calendar > .loader-indicator");
    loading.style.display = action == "disable" ? "none" : "flex";
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

function openModal(modal) {
    const canVibrate = window.navigator.vibrate;
    if (canVibrate) window.navigator.vibrate(10);

    document.querySelector(".modal").classList.add("active");
    document.querySelectorAll(".modal-content > div").forEach((el) => {
        el.style.display = "none";
    });
    if (modal) {
        document.querySelector(`.${modal}`).style.display = "flex";
    }
}

function closeModal() {
    document.querySelector(".modal").classList.remove("active");
}

document.querySelector(".modal").addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
        e.target.classList.remove("active");
    }
});

/* let slider = document.getElementById("myRange");
let output = document.getElementById("places");
output.innerHTML = slider.value;

slider.oninput = function () {
    output.innerHTML = this.value;
} */

document.querySelectorAll(".slider").forEach((slider) => {
    slider.oninput = function () {
        document.querySelector(`[data-ref="${this.id}"]`).innerHTML =
            this.value;
    };
});

document.querySelector(".profile").addEventListener("dblclick", () => {
    document.location.href = "/admin/auth";
});

document.querySelectorAll(".tag").forEach((tag) => {
    tag.addEventListener("click", () => {
        tag.classList.toggle("selected");
    });
});

if (
    window.matchMedia("(display-mode: standalone)").matches ||
    localStorage.getItem("installed") == "true"
) {
    if (!isFromSelect) {
        document.querySelector('.loader').style.display = 'none';
    }
    document.querySelector(".version").innerHTML = "BETA";

} else {
    document.querySelector(".version").innerHTML = "Installer";
}

let defferedPrompt;
const addbtn = document.querySelector(".version");

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    defferedPrompt = event;
    addbtn.style.display = "block";
});

addbtn.addEventListener("click", (event) => {
    if (defferedPrompt) {
        defferedPrompt
            .prompt()
            .then((result) => {
                if (result.outcome === "accepted") {
                    openModal("successInstall");
                    localStorage.setItem("installed", true);
                } else {
                    console.log("User dismissed the PWA installation prompt");
                }
                defferedPrompt = null; // Reset the deferredPrompt variable
            })
            .catch((error) => {
                console.error("Error during PWA installation prompt:", error);
            });
    } else if (!window.matchMedia("(display-mode: standalone)").matches) {
        const userAgent =
            navigator.userAgent || navigator.vendor || window.opera;

        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            if (
                userAgent.indexOf("CriOS") !== -1 ||
                userAgent.indexOf("FxiOS") !== -1
            ) {
                // Chrome on iOS
                document.querySelectorAll(".iosMobile").forEach((el) => {
                    el.style.display = "flex";
                });
                openModal("install");
            } else if (userAgent.indexOf("Safari") !== -1) {
                // Safari on iOS
                openModal("safariInstall");
            } else {
                // Other browsers on iOS
                document.querySelectorAll(".iosMobile").forEach((el) => {
                    el.style.display = "flex";
                });
                openModal("install");
            }
        } else if (/android/i.test(userAgent)) {
            // Android failed
            document.querySelectorAll(".androidMobile").forEach((el) => {
                el.style.display = "flex";
            });
            openModal("install");
        } else {
            // Computer failed
            document.querySelectorAll(".computer").forEach((el) => {
                el.style.display = "flex";
            });
            openModal("install");
        }
    }
});

document.querySelector('.campus_selector').addEventListener('click', (e) => {
    if (!e.target.classList.contains('version')) {
        window.location.href = '/campus';
    }
});