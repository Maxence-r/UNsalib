import { showToast } from "./admin-utils.js";

function addChip(text, container) {
    let chip = document.createElement('div');
    chip.classList = 'chip';
    let chipDesc = document.createElement('span');
    chipDesc.textContent = text;
    let icon = document.createElement('i');
    icon.textContent = 'close';
    icon.classList = 'material-symbols-rounded';
    chip.appendChild(chipDesc);
    chip.appendChild(icon);
    container.appendChild(chip);
    chip.addEventListener('click', () => {
        container.removeChild(chip);
    });
}

async function updateRoom(id, data) {
    let success = '';
    try {
        success = await fetch('/api/admin/update-room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                roomId: id,
                data: data,
            })
        });
        success = await success.json();
    } catch (error) {
        console.error(error);
        showToast('Erreur lors de la mise à jour des informations : ' + error, true);
        return;
    }
    if (!success.error) {
        showToast('Les informations ont été mises à jour avec succès.', false);
    } else {
        showToast('Erreur lors de la mise à jour des informations : ' + success.error, true);
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
    aliasSection.value = data.alias;
    seatsSection.value = data.seats;
    bannedSection.checked = data.banned;
    boardsSection.querySelectorAll('input').forEach((input) => {
        input.value = 0;
    });
    Object.keys(data.board).forEach((type) => {
        if (type == 'BLANC') {
            boardsSection.querySelector('input[name="blanc"]').value = data.board[type];
        } else if (type == 'NOIR') {
            boardsSection.querySelector('input[name="noir"]').value = data.board[type];
        } if (type == 'ECRAN') {
            boardsSection.querySelector('input[name="ecran"]').value = data.board[type];
        }
    });
    detailsSection.querySelectorAll('.chip').forEach((chip) => {
        detailsSection.querySelector('.chips-container').removeChild(chip);
    });
    data.details.forEach((detail) => {
        addChip(detail, detailsSection.querySelector('.chips-container'));
    });
    typeSection.value = data.type ? data.type : "";
}

async function getRooms() {
    const roomsList = roomsManagerPage.querySelector('.rooms-list-container');
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
    let roomElement, roomName, bookRoomButton, icon, banIcon, actionsDiv;
    data.forEach((room) => {
        roomElement = document.createElement('div');
        roomElement.setAttribute('data-id', room.id);
        roomElement.setAttribute('data-building', room.building);
        roomElement.setAttribute('data-name', room.name);
        roomElement.setAttribute('data-banned', room.banned);
        roomElement.classList = 'room-item';
        roomName = document.createElement('span');
        roomName.innerText = room.name;
        actionsDiv = document.createElement('div');
        actionsDiv.classList = 'item-actions';
        // bookRoomButton = document.createElement('button');
        // bookRoomButton.classList = 'button icon-button';
        // icon = document.createElement('i');
        // icon.innerText = 'add';
        // icon.classList = 'material-symbols-rounded';
        // bookRoomButton.appendChild(icon);
        roomElement.appendChild(roomName);
        if (room.banned) {
            banIcon = document.createElement('i');
            banIcon.innerText = 'visibility_off';
            banIcon.classList = 'material-symbols-rounded';
            banIcon.style.fontSize = '16px';
            actionsDiv.appendChild(banIcon);
        }
        // actionsDiv.appendChild(bookRoomButton);
        roomElement.appendChild(actionsDiv);
        roomsList.appendChild(roomElement);

        // bookRoomButton.addEventListener('click', (event) => {
        //     event.stopPropagation();
        //     document.querySelector('#booked-id>span').textContent = event.currentTarget.parentNode.parentNode.id;
        //     document.querySelector('#start-date>input').value = '';
        //     document.querySelector('#end-date>input').value = '';
        //     document.querySelector('#course-name>input').value = '';
        //     bookRoomPopup.classList.add('opened');
        // });
        roomElement.addEventListener('click', (event) => {
            getRoom(event.currentTarget.getAttribute('data-id'));
            document.querySelector('#room-editor').classList.add('swipe-left');
            roomsManagerPage.querySelector('.rooms-list').classList.add('swipe-left');
        });
    });
    await getRoom(document.querySelector('.room-item').getAttribute('data-id'));
    document.querySelector('#room-editor').style.display = 'flex';
}

const roomsManagerPage = document.querySelector('#rooms-manager');

const bookRoomPopup = document.querySelector('#book-room-popup');

const idSection = document.querySelector('#id>span');
const nameSection = document.querySelector('#name>span');
const buildingSection = document.querySelector('#building>span');
const aliasSection = document.querySelector('#alias>input');
const seatsSection = document.querySelector('#seats>input');
const bannedSection = document.querySelector('#banned>input');
const boardsSection = document.querySelector('#boards');
const detailsSection = document.querySelector('#details');
const typeSection = document.querySelector('#type>select');

async function initRoomsManagerPage() {
    await getRooms();

    detailsSection.querySelector('input').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            detailsSection.querySelector('button').click();
        }
    });
    detailsSection.querySelector('button').addEventListener('click', () => {
        let chipsValues = [...detailsSection.querySelectorAll('.chip>span')].map((chip) => {
            return chip.textContent;
        });
        let inputValue = detailsSection.querySelector('input').value;
        if (inputValue !== "" && !chipsValues.includes(inputValue)) {
            addChip(inputValue, detailsSection.querySelector('.chips-container'));
            detailsSection.querySelector('input').value = '';
        } else {
            showToast('Le champ est vide ou la valeur existe déjà.', true);
        }
    });

    const saveBtn = document.querySelector('#save-button');
    saveBtn.addEventListener('click', () => {
        const boardObj = {
            NOIR: boardsSection.querySelector('input[name="noir"]').value,
            BLANC: boardsSection.querySelector('input[name="blanc"]').value,
            ECRAN: boardsSection.querySelector('input[name="ecran"]').value
        };
        const detailsArray = [...detailsSection.querySelectorAll('.chip>span')].map((chip) => {
            return chip.textContent;
        });
        const data = {
            alias: aliasSection.value,
            places_assises: seatsSection.value,
            tableau: boardObj,
            caracteristiques: detailsArray,
            banned: bannedSection.checked,
            type: typeSection.value
        }
        const id = idSection.textContent;
        updateRoom(id, data);
    });

    roomsManagerPage.querySelector('.search input[type="text"]').addEventListener("input", (e) => {
        let search = e.target.value
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f\s]/g, "");
        let results = document.querySelectorAll('.room-item');
        let resultsNumber = 0;
        results.forEach((result) => {
            console.log(!searchBannedCheckbox.checked && result.getAttribute('data-banned') == "true")
            let roomName = result.getAttribute('data-name').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\s]/g, "");
            let buildingName = result.getAttribute('data-building').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\s]/g, "");
            if (!roomName.includes(search) && !buildingName.includes(search)) {
                result.classList.add('hidden');
            } else {
                result.classList.remove('hidden');
                // if (!searchBannedCheckbox.checked && result.getAttribute('data-banned') == "true") {
                //     resultsNumber++;
                //     result.style.display = "flex";
                // }
            }
        });
        roomsManagerPage.querySelector('.no-result').style.display = resultsNumber > 0 ? "none" : "block";
    });

    roomsManagerPage.querySelector('.back-button').addEventListener('click', () => {
        document.querySelector('#room-editor').classList.remove('swipe-left');
        roomsManagerPage.querySelector('.rooms-list').classList.remove('swipe-left');
    });

    document.querySelector('#close-popup-button').addEventListener('click', () => {
        bookRoomPopup.classList.remove('opened');
    });

    bookRoomPopup.addEventListener('click', function (event) {
        if (!bookRoomPopup.querySelector('#popup-window').contains(event.target)) {
            bookRoomPopup.classList.remove('opened');
        }
    });

    document.querySelector('#add-course-button').addEventListener('click', (event) => {
        const MIN_COURSE_DURATION = 10; // in minutes
        const startDate = document.querySelector('#start-date>input').value;
        const endDate = document.querySelector('#end-date>input').value;
        const courseName = document.querySelector('#course-name>input').value;
        const roomId = document.querySelector('#booked-id>span').textContent;
        if (startDate && endDate) {
            if ((new Date(endDate) - new Date(startDate)) / 1000 / 60 >= MIN_COURSE_DURATION) {
                if (sameDay(new Date(startDate), new Date(endDate))) {
                    createCourse(roomId, new Date(startDate), new Date(endDate), courseName);
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

    const searchBannedCheckbox = roomsManagerPage.querySelector('.search-actions input[type="checkbox"]');
    searchBannedCheckbox.click();
    searchBannedCheckbox.addEventListener('click', () => {
        let results = document.querySelectorAll('.room-item[data-banned="true"]');
        results.forEach((result) => {
            if (searchBannedCheckbox.checked && !result.classList.contains('hidden')) {
                result.style.display = 'flex';
            } else if (!searchBannedCheckbox.checked && !result.classList.contains('hidden')) {
                result.style.display = 'none';
            }
        });
    });
}

export { initRoomsManagerPage };