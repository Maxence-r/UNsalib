document.querySelectorAll(".action").forEach((el) => {
    el.addEventListener("click", (e) => {
        let active = document.querySelector(".tab-active");
        let clicked = e.target.dataset.ref;

        if (active) {
            let ref = active.dataset.ref;
            active.classList.remove("tab-active");

            let container = document.querySelector(`.${ref}`);
            if (container) {
                container.classList.remove("displayed");
            }
        }

        e.target.classList.add("tab-active");

        let containerToShow = document.querySelector(`.${clicked}`);
        if (containerToShow) {
            containerToShow.classList.add("displayed");
        }
    });
});

function toggleNav() {
    let nav = document.querySelector(".pannel");
    if (nav.classList.contains("active")) {
        nav.classList.remove("active");

    } else {
        nav.classList.add("active");

    }
}

async function fetchSalles() {
    try {
        let response = await fetch("/api/salles");
        let salles = await response.json();
        afficherSalles(salles, "edt");

    } catch (error) {
        console.error("Erreur lors de la récupération des salles:", error);
    }
}

fetchSalles();


async function afficherSalles(salles, containerHTML) {
    let container = document.querySelector(`.${containerHTML}`);
    document.querySelectorAll(`.${containerHTML} .result`).forEach((el) => el.remove());
    salles.forEach((salle) => {
        // Créer les éléments nécessaires
        let resultDiv = document.createElement("div");
        resultDiv.className = "result";

        resultDiv.onclick = function () {
            afficherSalle(salle, 0);
            toggleNav();
        };

        let p = document.createElement("p");
        p.textContent = salle?.alias ? `${salle.alias.toUpperCase()} ` : `${salle.nom.toUpperCase()} `;

        let span = document.createElement("span");
        span.className = "bat";
        span.textContent = salle.batiment;

        let badgesDiv = document.createElement("div");
        badgesDiv.className = "badges";

        salle.caracteristiques.forEach((caracteristique) => {
            let img = document.createElement("img");
            img.src =  `../assets/${caracteristique}.svg`;
            img.alt = caracteristique;
            badgesDiv.appendChild(img);
        });
        let pingDiv = document.createElement("div");
        pingDiv.className = salle.disponible ? "ping blue" : "ping red";

        // Assembler les éléments
        p.appendChild(span);
        
        badgesDiv.appendChild(pingDiv);
        resultDiv.appendChild(p);
        resultDiv.appendChild(badgesDiv);

        // Ajouter le résultat au conteneur
        container.appendChild(resultDiv);
    });
}

const inputs = document.querySelectorAll('.setDate input.time');
document.querySelector('.search-button').addEventListener('click', () => {
    searchAvailable();
});
async function searchAvailable() {
    // Extract values and parse as integers
    const startHour = parseInt(inputs[0].value, 10);
    const startMinute = parseInt(inputs[1].value, 10);
    const endHour = parseInt(inputs[2].value, 10);
    const endMinute = parseInt(inputs[3].value, 10);
    const day = parseInt(inputs[4].value, 10);
    const month = parseInt(inputs[5].value, 10);

    // Validate inputs
    const errors = [];
    if (isNaN(startHour) || startHour < 0 || startHour > 23) errors.push('Heure de départ invalide.');
    if (isNaN(startMinute) || startMinute < 0 || startMinute > 59) errors.push('Minute de départ invalide.');
    if (isNaN(endHour) || endHour < 0 || endHour > 23) errors.push('Heure de fin invalide.');
    if (isNaN(endMinute) || endMinute < 0 || endMinute > 59) errors.push('Minute de fin invalide.');
    if (isNaN(day) || day < 1 || day > 31) errors.push('Jour invalide.');
    if (isNaN(month) || month < 1 || month > 12) errors.push('Mois invalide.');

    // Check that start time is not after end time
    const year = new Date().getFullYear();
    const startDateTime = new Date(year, month - 1, day, startHour, startMinute);
    const endDateTime = new Date(year, month - 1, day, endHour, endMinute);

    if (startDateTime > endDateTime) errors.push('L\'heure de fin doit être après l\'heure de début.');

    if (errors.length > 0) {
        document.querySelector('.search-button').classList.remove('button--loading')
        displayNotification(errors.join(' '))
        return;
    }

    // Format numbers with leading zeros
    const pad = (num) => num.toString().padStart(2, '0');

    const dateString = `${year}-${pad(month)}-${pad(day)}`;
    const startTime = `${pad(startHour)}:${pad(startMinute)}:00+01:00`;
    const endTime = `${pad(endHour)}:${pad(endMinute)}:00+01:00`;
    const debut = `${dateString}T${startTime}`;
    const fin = `${dateString}T${endTime}`;

    // Construct URL
    const url = `/api/salles/disponibles?debut=${encodeURIComponent(debut)}&fin=${encodeURIComponent(fin)}`;
    const response = await fetch(url);
    const salles = await response.json();
    closeModal();
    afficherSalles(salles, "available");
    document.querySelector('.available > .no-results').style.display = salles.length > 0 ? "none" : "block";
    document.querySelector('.search-button').classList.remove('button--loading')
}
document.querySelectorAll(".search").forEach((el) => {
    el.addEventListener("input", (e) => {
        let resultContainer = e.target.dataset.search;
        let search = e.target.value
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f\s]/g, "");
        let results = document.querySelectorAll(`.${resultContainer} .result`);
        let resultsNumber = 0;
        results.forEach((result) => {
            let salle = result
                .querySelector("p")
                .textContent.toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f\s]/g, "");
            let batiment = result
                .querySelector(".bat")
                .textContent.toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f\s]/g, "");
            if (!salle.includes(search) && !batiment.includes(search)) {
                result.style.display = "none";
            } else {
                resultsNumber++;
                result.style.display = "flex";
            }
        });
        document.querySelector(`.${resultContainer} .no-results`).style.display = resultsNumber > 0 ? "none" : "block";
    })
});

