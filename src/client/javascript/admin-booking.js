import { showToast } from "./admin-utils.js";

function sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

async function createCourse(roomId, startAt, endAt, courseName = "Non renseigné") {
    let success = '';
    try {
        success = await fetch('/api/admin/add-course', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                startAt: startAt.toISOString().split('.')[0] + '+01:00',
                endAt: endAt.toISOString().split('.')[0] + '+01:00',
                roomId: roomId,
                courseName: courseName
            })
        });
        success = await success.json();
    } catch (error) {
        console.error(error);
        showToast('Erreur lors de l\'ajout du cours : ' + error, true);
        return;
    }
    if (!success.error) {
        showToast('Le cours a été ajouté avec succès.', false);
    } else {
        showToast('Erreur lors de l\'ajout du cours : ' + success.error, true);
    }
}

async function getRoom(id) {
    let data = [];
    try {
        data = await fetch('/api/admin/room?id=' + id, {
            method: 'GET',
        });
        data = await data.json();
    } catch (error) {
        console.error(error);
        return;
    }
    idSection.textContent = data.id;
    nameSection.textContent = data.name;
    buildingSection.textContent = data.building;
}

async function getRooms() {
    const roomsList = bookingPage.querySelector('.rooms-list-container');
    let data = [];
    try {
        data = await fetch('/api/admin/rooms', {
            method: 'GET',
        });
        data = await data.json();
    } catch (error) {
        console.error(error);
        return;
    }
    bookingPage.querySelectorAll('.rooms-list-container .room-item').forEach((item) => {
        roomsList.removeChild(item);
    });
    let roomElement, roomName, actionsDiv;
    data.forEach((room) => {
        if (!room.banned) {
            roomElement = document.createElement('div');
            roomElement.setAttribute('data-id', room.id);
            roomElement.setAttribute('data-building', room.building);
            roomElement.setAttribute('data-name', room.name);
            roomElement.classList = 'room-item';
            roomName = document.createElement('span');
            roomName.innerText = room.name;
            actionsDiv = document.createElement('div');
            actionsDiv.classList = 'item-actions';
            roomElement.appendChild(roomName);
            roomElement.appendChild(actionsDiv);
            roomsList.appendChild(roomElement);

            roomElement.addEventListener('click', (event) => {
                getRoom(event.currentTarget.getAttribute('data-id'));
                document.querySelector('#room-booking-editor').classList.add('swipe-left');
                bookingPage.querySelector('.rooms-list').classList.add('swipe-left');
            });
        }
    });
    getRoom(bookingPage.querySelector('.room-item').getAttribute('data-id'));
    document.querySelector('#room-booking-editor').style.display = 'flex';
}

const bookingPage = document.querySelector('#booking');

const idSection = bookingPage.querySelector('section.id>span');
const nameSection = bookingPage.querySelector('section.name>span');
const buildingSection = bookingPage.querySelector('section.building>span');
const startDateSection = bookingPage.querySelector('section.start-date>input');
const endDateSection = bookingPage.querySelector('section.end-date>input');
const courseNameSection = bookingPage.querySelector('section.course-name>input');

const saveBtn = bookingPage.querySelector('.save-button');

const MIN_COURSE_DURATION = 10; // in minutes

async function initBookingPage() {
    await getRooms();

    saveBtn.addEventListener('click', () => {
        if (startDateSection.value && endDateSection.value) {
            if ((new Date(endDateSection.value) - new Date(startDateSection.value)) / 1000 / 60 >= MIN_COURSE_DURATION) {
                if (sameDay(new Date(startDateSection.value), new Date(endDateSection.value))) {
                    createCourse(idSection.textContent, new Date(startDateSection.value), new Date(endDateSection.value), courseNameSection.value);
                } else {
                    showToast('Les champs de dates doivent utiliser le même jour.', true);
                }
            } else {
                showToast(`Les dates spécifiées ne délimitent pas un cours de plus de ${MIN_COURSE_DURATION} minutes.`, true);
            }
        } else {
            showToast('Les champs de dates sont invalides.', true);
        }
    });

    bookingPage.querySelector('.back-button').addEventListener('click', () => {
        document.querySelector('#room-booking-editor').classList.remove('swipe-left');
        bookingPage.querySelector('.rooms-list').classList.remove('swipe-left');
    });

    bookingPage.querySelector('.search input[type="text"]').addEventListener('input', (e) => {
        let search = e.target.value
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f\s]/g, "");
        let results = bookingPage.querySelectorAll('.room-item');
        let resultsNumber = 0;
        results.forEach((result) => {
            let roomName = result.getAttribute('data-name').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\s]/g, "");
            let buildingName = result.getAttribute('data-building').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\s]/g, "");
            if (!roomName.includes(search) && !buildingName.includes(search)) {
                result.classList.add('hidden');
            } else {
                resultsNumber++;
                result.classList.remove('hidden');
            }
        });
        bookingPage.querySelector('.no-result').style.display = resultsNumber > 0 ? "none" : "block";
    });
}

export { initBookingPage };