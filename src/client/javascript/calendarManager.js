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
let indicator = document.querySelector(".indicator-hour");
if (heure > heureDebut && heure < heureFin) {
    indicator.style.top = `${
        (100 * (heure - heureDebut)) / dureeJournee +
        (100 / dureeJournee) * (minutes / 60)
    }%`;
    indicator.innerText =
        heure +
        ":" +
        (minutes.toString().length == 2 ? minutes : "0" + minutes);
} else {
    indicator.style.display = "none";
}

function getWeeksInYear() {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

    const diffTime = currentDate - startOfYear;

    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    const weeks = Math.ceil(diffDays / 7);

    return weeks;
}

async function afficherSalle(salle, increment) {
    toggleNav();
    document.getElementById('room-name').innerText = salle?.alias ? salle.alias : salle.nom;
    document.querySelectorAll(".course").forEach((el) => {
        el.remove();
    });
    let response = await fetch(
        "/api/salles/edt/?id=" + salle.id + "&increment=" + increment
    );
    let salleData = await response.json();

    let startDate = salleData.infos_semaine.debut.split("-")[2];

    document.querySelectorAll(".day").forEach((el, i = 0) => {
        el.innerText = " " + (parseInt(startDate) + i);
        i++;
    });

    document.querySelector(".week-number").innerText =
        salleData.infos_semaine.numero;

    salleData.cours.forEach((coursData) => {
        let courseStart = new Date(coursData.debut);

        let column = courseStart.getDay() - 1;
        if (column > 4) {
            return;
        }
        
        let courseEnd = new Date(coursData.end);
        let course_content = document.createElement("div");
        let course_module = document.createElement("h2");
        let teacher_name = document.createElement("div");

        course_module.innerText = coursData.debut + " - " + coursData.fin;
        course_content.appendChild(course_module);
        course_content.style.top= `${coursData.overflow}%`;

        course_content.style.height = `calc(${coursData.duree}% - 16px)`;

        course_content.classList.add("course");
        
        let row = courseStart.getHours() - heureDebut;

        columns[column]
            .querySelectorAll(".content-box")
            [row].appendChild(course_content);
    });
}
