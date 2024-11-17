function displayNotification(message) {
    let notification = document.querySelector('.notif')
    notification.querySelector('p').innerText = message
    notification.classList.add('active')
    setTimeout(() => {
        notification.classList.remove('active')
    }, 5000)
}

async function updateFeed() {
    try {
        let response = await fetch("/api/app/dernier-groupe-maj");
        let lastUpdated = await response.json();
        const feed = document.querySelector(".campus_feed_content");
        const feedInfo = document.createElement("p");
        let timeElapsed = new Date() - new Date(lastUpdated.date_maj);
        if (timeElapsed < 60000) {
            timeElapsed = Math.round(timeElapsed / 1000) + (Math.round(timeElapsed / 1000) < 2 ? " SECONDE" : " SECONDES");
        } else if (timeElapsed < 3600000) {
            timeElapsed = Math.round(timeElapsed / 60 / 1000) + (Math.round(timeElapsed / 60 / 1000) < 2 ? " MINUTE" : " MINUTES");
        } else {
            timeElapsed = Math.round(timeElapsed / 60 / 60 / 1000) + (Math.round(timeElapsed / 60 / 60 / 1000) < 2 ? " HEURE" : " HEURES");
        }
        feedInfo.innerText = `GROUPE ${lastUpdated.nom_groupe} MIS A JOUR IL Y A ${timeElapsed}`;
        feed.appendChild(feedInfo);
    } catch {
        return;
    }
}

async function getVersion() {
    let versionBadge = document.querySelector(".campus_selector>.version");
    try {
        let response = await fetch("/api/app/version");
        let version = await response.json();
        versionBadge.innerText = version.version;
    } catch {
        versionBadge.style.display = "None";
        return;
    }
}

getVersion();
updateFeed();