let heureDebut = 8;
let heureFin = 19;
let dureeJournee = heureFin - heureDebut;
const date = new Date();
const heure = date.getHours();
const minutes = date.getMinutes();
const columns = document.querySelectorAll(".column-content");

for (let i = 1; i < dureeJournee; i++) {
    let heureEl = document.createElement("p");
    heureEl.innerText = heureDebut + i + ":00";
    document.querySelector(".calendar-hours-display").appendChild(heureEl);
}

for (let k = 0; k < 5; k++) {
    for (let i = 0; i < dureeJournee; i++) {
        let courseCase = document.createElement("div");
        courseCase.className = "content-box";
        document
            .querySelectorAll(".column > .column-content")
        [k].appendChild(courseCase);
    }
}

function setHourIndicator() {
    let dateActuelle = new Date();
    let jourActuel = dateActuelle.getDay();
    let heureActuelle = dateActuelle.getHours();
    let minuteActuelle = dateActuelle.getMinutes();
    if (heureActuelle > heureDebut && heureActuelle < heureFin && jourActuel > 0 && jourActuel < 6) {
        console.log(`[${heureActuelle}:${minuteActuelle}] Updating hour indicator`);
        columns[jourActuel-1].appendChild(indicatorHour);
        indicatorHour.style.display = "block";
        indicator.style.display = "flex";
        let top = (100 * (heureActuelle - heureDebut)) / dureeJournee + (100 / dureeJournee) * (minuteActuelle / 60);
        indicator.style.top = `${top}%`;
        indicatorHour.style.top = `${top}%`;
        indicator.innerText = heureActuelle + ":" + (minuteActuelle.toString().length == 2 ? minuteActuelle : "0" + minuteActuelle);
    } else {
        indicator.style.display = "none";
        indicatorHour.style.display = "none";
    }
}

const indicator = document.querySelector(".indicator-hour");
const indicatorHour = document.createElement("div");
indicatorHour.classList.add("hourBar");
indicatorHour.style.display = "none";
indicator.style.display = "none";
setHourIndicator();
setInterval(setHourIndicator, 10000);

function getWeeksInYear() {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

    const diffTime = currentDate - startOfYear;

    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    const weeks = Math.ceil(diffDays / 7);

    return weeks;
}

let increment = 0;
let currentSalle = null;

async function afficherSalle(salle, delta) {
    const newIncrement = (delta == 0) ? 0 : increment + delta;

    toggleLoading()

    const response = await fetch(
        `/api/salles/edt/?id=${salle.id}&increment=${newIncrement}`
    );

    if (!response.ok) {
        console.log("Error fetching data");
        toggleLoading("disable");
        displayNotification("Impossible d'afficher l'edt pour cette semaine !");
        return;
    }

    document.getElementById("room-name").innerText = salle?.alias || salle.nom;
    document.querySelector(".avaibility-box>p").innerText = salle?.alias || salle.nom;
    document.querySelector('.avaibility-box .ping').className = salle.disponible ? "ping blue" : "ping red";
    document.querySelector('.avaibility-box .ping').style.display = "block";

    document.querySelectorAll(".course").forEach((el) => el.remove());

    const salleData = await response.json();

    // Update increment and currentSalle only if the request succeeds
    increment =  newIncrement;
    currentSalle = salle;

    const startDate = salleData.infos_semaine.debut.split("-")[2];

    document.querySelectorAll(".day").forEach((el, i = 0) => {
        el.innerText = " " + (parseInt(startDate) + i);
        i++;
    });

    document.querySelector(".week-number").innerText = salleData.infos_semaine.numero;

    salleData.cours.forEach((coursData) => {
        const courseStart = new Date(coursData.debut);
        const column = courseStart.getDay() - 1;
        if (column > 4) return;

        const course_content = document.createElement("div");
        const course_module = document.createElement("h2");
        const course_prof = document.createElement("p");

        course_module.innerText = coursData?.module.split(" - ")[1] || "Module inconnu";
        course_prof.innerText = coursData.professeur;

        course_content.appendChild(course_module);
        course_content.appendChild(course_prof);

        course_content.style.top = `${coursData.overflow}%`;
        course_content.style.backgroundColor = coursData.couleur;
       
        course_content.style.height = `calc(${coursData.duree}% - 16px + ${(coursData.duree > 100 ? Math.floor(coursData.duree / 100) * 2 : 0)}px)`;
        course_content.classList.add("course");

        const row = courseStart.getHours() - heureDebut;

        columns[column]
            .querySelectorAll(".content-box")[row]
            .appendChild(course_content);
    });
    toggleLoading("disable");
}

document.querySelectorAll(".week-switcher img").forEach((el) => {
    el.addEventListener("click", () => {
        if (!currentSalle) return;
        const delta = el.getAttribute('alt') === "next" ? 1 : -1;
        afficherSalle(currentSalle, delta);
    });
});