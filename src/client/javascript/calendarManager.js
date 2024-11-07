let heureDebut = 8;
let heureFin = 19;
let dureeJournee = heureFin - heureDebut;
const date = new Date();
const heure = date.getHours();
const minutes = date.getMinutes();

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

if (heure > heureDebut && heure < heureFin) {
    console.log(dureeJournee, heure, heureDebut);
    document.querySelector(".indicator-hour").style.top = `${
        (100 * (heure - heureDebut)) / dureeJournee +
        (100 / dureeJournee) * (minutes / 60)
    }%`;
}

function afficherSalle(salle) {
    console.log(salle);
}
