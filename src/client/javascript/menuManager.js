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

async function fetchSalles() {
    try {
        let response = await fetch("/salles");
        let salles = await response.json();

        salles.forEach((salle) => {
            let container = document.querySelector(".results");

            // Créer les éléments nécessaires
            let resultDiv = document.createElement("div");
            resultDiv.className = "result";

            resultDiv.onclick = function () {
                afficherSalle(salle);
            };

            let p = document.createElement("p");
            p.textContent = `${salle.nom_salle.toUpperCase()} `;

            let span = document.createElement("span");
            span.className = "bat";
            span.textContent = salle.batiment;

            let badgesDiv = document.createElement("div");
            badgesDiv.className = "badges";

            /*  let img = document.createElement("img");
            img.src = "../assets/lock.svg"; */

            let pingDiv = document.createElement("div");
            pingDiv.className = "ping blue";

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
            result.style.display = "flex";
        }
    });
});

