let authorized = ["st"]
function selectCampus(campus) {
    if (!authorized.includes(campus)) {
        alert("Nous travaillons sur l'ajout de nouveaux campus. Veuillez réessayer plus tard.");
        return;
    }
    localStorage.setItem("campus", campus);
    document.querySelector(".loader").classList.add("active");
    setTimeout(() => {
        window.location.href = window.location.origin + "?fromSelector=true";
    }, 300);
}