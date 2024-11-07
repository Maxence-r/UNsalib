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
    let indicator = document.querySelector(".indicator-hour");
    indicator.style.top = `${
        (100 * (heure - heureDebut)) / dureeJournee +
        (100 / dureeJournee) * (minutes / 60)
    }%`;
    indicator.innerText =
        heure +
        ":" +
        (minutes.toString().length == 2 ? minutes : "0" + minutes);
}

function getWeeksInYear() {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

    const diffTime = currentDate - startOfYear;

    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    const weeks = Math.ceil(diffDays / 7);

    return weeks;
}

async function afficherSalle(salle) {
    let response = await fetch(
        "/salles/edt/?id=" + salle.id + "&increment=" + 0
    );
    let salleData = await response.json();

    let startDate = salleData.dates.debut.split("-")[2];
    console.log(startDate);
    document.querySelectorAll(".day").forEach((el, i = 0) => {
        el.innerText = " " + (parseInt(startDate) + i);
        i++;
    });
}
