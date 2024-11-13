document.querySelectorAll(".action").forEach((el) => {
    el.addEventListener("click", (e) => {
        let active = document.querySelector(".active");
        let clicked = e.target.dataset.ref;
        let ref = active.dataset.ref;

        active.classList.remove("active");
        e.target.classList.add("active");
        let container = document.querySelector(`.${ref}`);
        container.classList.remove("displayed");

        let containerToShow = document.querySelector(`.${clicked}`);
        containerToShow.classList.add("displayed");
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

        salles.forEach((salle) => {
            let container = document.querySelector(".results");

            // Créer les éléments nécessaires
            let resultDiv = document.createElement("div");
            resultDiv.className = "result";

            resultDiv.onclick = function () {
                afficherSalle(salle, 0);
            };

            let p = document.createElement("p");
            p.textContent = salle?.alias ?  `${salle.alias.toUpperCase()} `: `${salle.nom.toUpperCase()} `;

            let span = document.createElement("span");
            span.className = "bat";
            span.textContent = salle.batiment;

            let badgesDiv = document.createElement("div");
            badgesDiv.className = "badges";

            /*  let img = document.createElement("img");
            img.src = "../assets/lock.svg"; */

            let pingDiv = document.createElement("div");
            pingDiv.className = salle.disponible ? "ping blue" : "ping red";

            // Assembler les éléments
            p.appendChild(span);
            /*  badgesDiv.appendChild(img); */
            badgesDiv.appendChild(pingDiv);
            resultDiv.appendChild(p);
            resultDiv.appendChild(badgesDiv);

            // Ajouter le résultat au conteneur
            container.appendChild(resultDiv);
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des salles:", error);
    }
}

fetchSalles();
document.querySelector(".search").addEventListener("input", (e) => {
    let search = e.target.value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f\s]/g, "");
    let results = document.querySelectorAll(".result");
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
    document.querySelector(".edt-finder p.no-results").style.display = resultsNumber > 0 ? "none" : "block";
});
