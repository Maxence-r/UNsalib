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
        showToast('Erreur lors de l\'obtention de la salle : ' + data.error, true);
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
        showToast('Erreur lors de l\'obtention de la liste des salles : ' + data.error, true);
        return;
    }
    roomsManagerPage.querySelectorAll('.rooms-list-container .room-item').forEach((item) => {
        roomsList.removeChild(item);
    });
    let roomElement, roomName, banIcon, badges;
    data.forEach((room) => {
        roomElement = document.createElement('div');
        roomElement.setAttribute('data-id', room.id);
        roomElement.setAttribute('data-building', room.building);
        roomElement.setAttribute('data-name', room.name);
        roomElement.setAttribute('data-banned', room.banned);
        roomElement.setAttribute('data-type', room.type);
        roomElement.classList = 'room-item';
        roomName = document.createElement('span');
        roomName.innerText = room.name;
        badges = document.createElement('div');
        badges.classList = 'badges';
        roomElement.appendChild(roomName);
        if (room.banned) {
            banIcon = document.createElement('i');
            banIcon.innerText = 'visibility_off';
            banIcon.classList = 'material-symbols-rounded';
            badges.appendChild(banIcon);
        }
        roomElement.appendChild(badges);
        roomsList.appendChild(roomElement);
        roomElement.addEventListener('click', (event) => {
            roomsManagerPage.querySelector('.room-item.selected').classList.remove('selected')
            event.currentTarget.classList.add('selected');
            getRoom(event.currentTarget.getAttribute('data-id'));
            document.querySelector('#room-editor').classList.add('swipe-left');
            roomsManagerPage.querySelector('.rooms-list').classList.add('swipe-left');
        });
    });
    await getRoom(roomsManagerPage.querySelector('.room-item').getAttribute('data-id'));
    roomsManagerPage.querySelector('.room-item').classList.add('selected');
    document.querySelector('#room-editor').style.display = 'flex';
}

function refreshRoomsList() {
    let search = roomsManagerPage.querySelector('.search input[type="text"]').value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\s]/g, "");
    let results = roomsManagerPage.querySelectorAll('.room-item');
    let resultsNumber = 0;
    results.forEach((result) => {
        let roomName = result.getAttribute('data-name').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\s]/g, "");
        let buildingName = result.getAttribute('data-building').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\s]/g, "");
        if (!roomName.includes(search) && !buildingName.includes(search)) {
            result.classList.add('hidden');
        } else {
            if (result.getAttribute('data-type') == "") {
                if (result.getAttribute('data-banned') == "false") {
                    result.classList.remove('hidden');
                    resultsNumber++;
                } else {
                    if (searchBannedCheckbox.checked) {
                        result.classList.remove('hidden');
                        resultsNumber++;
                    } else {
                        result.classList.add('hidden');
                    }
                }
            } else {
                if (!searchTypeCheckbox.checked) {
                    if (result.getAttribute('data-banned') == "false") {
                        result.classList.remove('hidden');
                        resultsNumber++;
                    } else {
                        if (searchBannedCheckbox.checked) {
                            result.classList.remove('hidden');
                            resultsNumber++;
                        } else {
                            result.classList.add('hidden');
                        }
                    }
                } else {
                    result.classList.add('hidden');
                }
            }
        }
    });
    roomsManagerPage.querySelector('.no-result').style.display = resultsNumber > 0 ? "none" : "block";
}

const roomsManagerPage = document.querySelector('#rooms-manager');

const idSection = roomsManagerPage.querySelector('section.id>span');
const nameSection = roomsManagerPage.querySelector('section.name>span');
const buildingSection = roomsManagerPage.querySelector('section.building>span');
const aliasSection = roomsManagerPage.querySelector('section.alias>input');
const seatsSection = roomsManagerPage.querySelector('section.seats>input');
const bannedSection = roomsManagerPage.querySelector('section.banned>input');
const boardsSection = roomsManagerPage.querySelector('section.boards');
const detailsSection = roomsManagerPage.querySelector('section.details');
const typeSection = roomsManagerPage.querySelector('section.type>select');

const searchBannedCheckbox = roomsManagerPage.querySelector('.search-actions input[data-id="banned"]');
const searchTypeCheckbox = roomsManagerPage.querySelector('.search-actions input[data-id="type"]');

searchBannedCheckbox.checked = true;

async function initRoomsManagerPage() {
    await getRooms();
    refreshRoomsList();

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

    const saveBtn = roomsManagerPage.querySelector('.save-button');
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

    roomsManagerPage.querySelector('.search input[type="text"]').addEventListener("input", () => {
        refreshRoomsList();
    });

    roomsManagerPage.querySelector('.back-button').addEventListener('click', () => {
        document.querySelector('#room-editor').classList.remove('swipe-left');
        roomsManagerPage.querySelector('.rooms-list').classList.remove('swipe-left');
    });

    searchBannedCheckbox.addEventListener('click', () => {
        refreshRoomsList();
    });
    searchTypeCheckbox.addEventListener('click', () => {
        refreshRoomsList();
    });
}

export { initRoomsManagerPage };