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

let currentWeekNumber = "--";
function setHourIndicator() {
    let dateActuelle = new Date();
    let jourActuel = dateActuelle.getDay();
    let heureActuelle = dateActuelle.getHours();
    let minuteActuelle = dateActuelle.getMinutes();
    if (heureActuelle >= heureDebut && heureActuelle < heureFin && jourActuel > 0 && jourActuel < 6 && currentWeekNumber == document.querySelector(".week-number").innerText) {
        console.log(`[${heureActuelle}:${minuteActuelle}] Updating hour indicator`);
        columns[jourActuel - 1].appendChild(indicatorHour);
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

function joinArrayElements(array, separator, splitter, chooseBeforeSplit = false) {
    let string = '';
    array.forEach((element) => {
        if (splitter) {
            string += element.split(splitter)[chooseBeforeSplit ? 0 : 1] + ' ' + separator + ' ';
        } else {
            string += element + separator + ' ';
        }
    });
    string = string.substring(0, string.length - separator.length - 1);
    return string;
}

function areCoursesOverlapping(course1, course2) {
    const start1 = new Date(course1.start);
    const end1 = new Date(course1.end);
    const start2 = new Date(course2.start);
    const end2 = new Date(course2.end);

    return (start1 <= end2 && start2 <= end1);
}

function groupOverlappingCourses(coursesArray) {
    const groupedCourses = [];
    const visited = new Set();

    for (let i = 0; i < coursesArray.length; i++) {
        if (visited.has(coursesArray[i].courseId)) continue;

        const overlappingGroup = [coursesArray[i]];
        visited.add(coursesArray[i].courseId);

        for (let j = i + 1; j < coursesArray.length; j++) {
            if (visited.has(coursesArray[j].courseId)) continue;

            if (areCoursesOverlapping(coursesArray[i], coursesArray[j])) {
                overlappingGroup.push(coursesArray[j]);
                visited.add(coursesArray[j].courseId);
            }
        }

        groupedCourses.push(overlappingGroup);
    }

    return groupedCourses;
}

let increment = 0;
let currentSalle = null;

async function afficherSalle(salle, delta) {

    const canVibrate = window.navigator.vibrate
    if (canVibrate) window.navigator.vibrate(10)

    const newIncrement = (delta == 0) ? 0 : increment + delta;

    toggleLoading()

    const response = await fetch(
        `/api/rooms/timetable/?id=${salle.id}&increment=${newIncrement}`
    );

    if (!response.ok) {
        console.log("Error fetching data");
        toggleLoading("disable");
        displayNotification("Les données n'ont pas été enregistrées au-delà !");
        return;
    }

    document.getElementById("room-name").innerText = salle?.alias || salle.name;
    document.querySelector(".avaibility-box>p").innerText = salle?.alias || salle.name;
    document.querySelector('.avaibility-box .ping').className = salle.available ? "ping blue" : "ping red";
    document.querySelector('.avaibility-box .ping').style.display = "block";

    document.querySelectorAll(".course").forEach((el) => el.remove());

    const salleData = await response.json();

    // Update increment and currentSalle only if the request succeeds
    increment = newIncrement;
    currentSalle = salle;

    const startDate = salleData.weekInfos.start.split("-")[2];

    document.querySelectorAll(".day").forEach((el, i = 0) => {
        el.innerText = " " + (parseInt(startDate) + i);
        i++;
    });

    document.querySelector(".week-number").innerText = salleData.weekInfos.number;

    if (currentWeekNumber == "--") {
        currentWeekNumber = salleData.weekInfos.number;
    }
    setHourIndicator();

    const parsedCourses = groupOverlappingCourses(salleData.courses);
    parsedCourses.forEach((coursesArray) => {
        coursesArray.forEach((coursData, index) => {
            const courseStart = new Date(coursData.start);
            const column = courseStart.getDay() - 1;
            if (column > 4) return;

            const course_content = document.createElement("div");
            const course_module = document.createElement("h2");
            const course_prof = document.createElement("p");

            course_content.onclick = () => {
                openModal("course-details");
                displayDetails(coursData);
            };

            if (coursData.modules.length > 0) {
                course_module.innerText = joinArrayElements(coursData.modules, ';', ' - ');
            } else if (coursData.category) {
                course_module.innerText = coursData.category;
            } else {
                course_module.innerText = 'Cours inconnu';
            }
            course_prof.innerText = coursData.teachers.length > 0 ? coursData.teachers.join(' ; ') : '';

            course_content.appendChild(course_module);
            course_content.appendChild(course_prof);

            course_content.style.top = `${coursData.overflow}%`;
            course_content.style.backgroundColor = coursData.color;

            course_content.style.height = `calc(${coursData.duration}% + ${(coursData.duration > 100 ? Math.floor(coursData.duration / 100) * 2 : 0)}px)`;
            course_content.style.width = `${100 / coursesArray.length}%`;
            course_content.style.left = `${100 - (100 / coursesArray.length) * (coursesArray.length - index)}%`;
            course_content.classList.add("course");

            const row = courseStart.getHours() - heureDebut;

            columns[column]
                .querySelectorAll(".content-box")[row]
                .appendChild(course_content);
        });
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


function displayDetails(coursData) {
    let startDate = new Date(coursData.start);
    let endDate = new Date(coursData.end);
    let duree = (endDate - startDate) / 60000;

    document.querySelector('.course-container').style.backgroundColor = coursData.color;
    if (coursData.modules.length > 0) {
        document.querySelector('.course-container > p').innerText = joinArrayElements(coursData.modules, ';', ' - ');
    } else if (coursData.category) {
        document.querySelector('.course-container > p').innerText = coursData.category;
    } else {
        document.querySelector('.course-container > p').innerText = 'Cours inconnu';
    }

    document.getElementById('teacher-name').innerText = coursData.teachers.length > 0 ? coursData.teachers.join(' ; ') : 'Non renseigné';
    document.getElementById('module').innerText = coursData.modules.length > 0 ? joinArrayElements(coursData.modules, ';', ' - ', true) : 'Inconnu';

    let hours = Math.floor(duree / 60);
    let minutes = duree - hours * 60;
    hours = hours > 0 ? hours + 'h' : '';
    minutes = minutes > 0 ? minutes + 'min' : '';
    minutes = hours == '' && minutes == '' ? '0min' : minutes;

    document.getElementById('duration').innerText = hours + minutes;
    document.querySelector('.course-start').innerText = startDate.getHours() + ":" + (startDate.getMinutes().toString().length == 2 ? startDate.getMinutes() : "0" + startDate.getMinutes());
    document.querySelector('.course-end').innerText = endDate.getHours() + ":" + (endDate.getMinutes().toString().length == 2 ? endDate.getMinutes() : "0" + endDate.getMinutes());
    document.getElementById('groupes').innerText = coursData.groups.join(' ; ');
}