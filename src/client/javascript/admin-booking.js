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
        bookRoomPopup.classList.remove('opened');
    } else {
        showToast('Erreur lors de l\'ajout du cours : ' + success.error, true);
    }
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

            // roomElement.addEventListener('click', (event) => {
            //     getRoom(event.currentTarget.id);
            //     document.querySelector('#room-editor').classList.add('swipe-left');
            //     document.querySelector('#rooms-list').classList.add('swipe-left');
            // });
        }
    });
    // getRoom(document.querySelector('.room-item').id);
    // document.querySelector('#room-editor').style.display = 'flex';
}

// const bookRoomPopup = document.querySelector('#book-room-popup');
// const toast = document.querySelector('#toast');

// const idSection = document.querySelector('#id>span');
// const nameSection = document.querySelector('#name>span');
// const buildingSection = document.querySelector('#building>span');
// const aliasSection = document.querySelector('#alias>input');
// const seatsSection = document.querySelector('#seats>input');
// const bannedSection = document.querySelector('#banned>input');
// const boardsSection = document.querySelector('#boards');
// const detailsSection = document.querySelector('#details');
// const typeSection = document.querySelector('#type>select');


// document.querySelector('#back-button').addEventListener('click', () => {
//     document.querySelector('#room-editor').classList.remove('swipe-left');
//     document.querySelector('#rooms-list').classList.remove('swipe-left');
// });

// document.querySelector('#close-popup-button').addEventListener('click', () => {
//     bookRoomPopup.classList.remove('opened');
// });

// bookRoomPopup.addEventListener('click', function (event) {
//     if (!bookRoomPopup.querySelector('#popup-window').contains(event.target)) {
//         bookRoomPopup.classList.remove('opened');
//     }
// });

// document.querySelector('#add-course-button').addEventListener('click', (event) => {
//     const MIN_COURSE_DURATION = 10; // in minutes
//     const startDate = document.querySelector('#start-date>input').value;
//     const endDate = document.querySelector('#end-date>input').value;
//     const courseName = document.querySelector('#course-name>input').value;
//     const roomId = document.querySelector('#booked-id>span').textContent;
//     if (startDate && endDate) {
//         if ((new Date(endDate) - new Date(startDate)) / 1000 / 60 >= MIN_COURSE_DURATION) {
//             if (sameDay(new Date(startDate), new Date(endDate))) {
//                 createCourse(roomId, new Date(startDate), new Date(endDate), courseName);
//             } else {
//                 showToast('Les champs de dates doivent utiliser le même jour.', true);
//             }
//         } else {
//             showToast(`Les dates spécifiées ne délimitent pas un cours de plus de ${MIN_COURSE_DURATION} minutes.`, true);
//         }
//     } else {
//         showToast('Les champs de dates sont invalides.', true);
//     }
// });

// const searchBannedCheckbox = document.querySelector('#search-actions input[type="checkbox"]');
// searchBannedCheckbox.click();
// searchBannedCheckbox.addEventListener('click', () => {
//     let results = document.querySelectorAll('.room-item[data-banned="true"]');
//     results.forEach((result) => {
//         if (searchBannedCheckbox.checked && !result.classList.contains('hidden')) {
//             result.style.display = 'flex';
//         } else if (!searchBannedCheckbox.checked && !result.classList.contains('hidden')) {
//             result.style.display = 'none';
//         }
//     });
// });

const bookingPage = document.querySelector('#booking');

async function initBookingPage() {
    await getRooms();

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