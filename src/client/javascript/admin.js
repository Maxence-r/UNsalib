function showToast(msg, error = false) {
    toast.innerText = msg;
    if (error) {
        toast.style.backgroundColor = '#e64242';
        toast.style.color = '#ffffff';
    } else {
        toast.style.backgroundColor = '#44c235';
        toast.style.color = '#ffffff';
    }
    toast.classList.add('displayed');
    setTimeout(() => {
        toast.classList.remove('displayed');
    }, 4000);
}

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
    let success = "";
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
    showToast('Les informations ont été mises à jour avec succès.', false);
}

async function getAccount() {
    let data = [];
    try {
        data = await fetch('/api/admin/account-infos', {
            method: 'GET',
        });
        data = await data.json();
    } catch (error) {
        console.error(error);
        showToast('Impossible d\'obtenir le compte utilisateur. Essayze de vous déconnecter : ' + error, true);
        return;
    }
    document.querySelector('#account-button>span').textContent = data.name + ' ' + data.lastname;
    document.querySelector('#account-button>img').src = 'data:image/png;base64,' + data.icon;
    document.querySelector('#account-infos h2').textContent = data.name + ' ' + data.lastname;
    document.querySelector('#account-infos span').textContent = '@' + data.username;
    document.querySelector('#account-infos img').src = 'data:image/png;base64,' + data.icon;
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
    aliasSection.value = data.alias;
    seatsSection.value = data.seats;
    bannedSection.checked = data.banned;
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
    const roomsList = document.querySelector('#rooms-list__container');
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
    data.forEach((room) => {
        let roomElement = document.createElement('div');
        roomElement.innerText = room.name;
        roomElement.id = room.id;
        roomElement.classList = 'room-item';
        roomsList.appendChild(roomElement);

        roomElement.addEventListener('click', () => {
            getRoom(roomElement.id);
            document.querySelector('#room-editor').classList.add('swipe-left');
            document.querySelector('#rooms-list').classList.add('swipe-left');
        });
    });
    getRoom(document.querySelector('.room-item').id);
    document.querySelector('#room-editor').style.display = 'flex';
}

getAccount();

const accountButton = document.querySelector('#account-button');
const accountMenu = document.querySelector('#account-menu');

accountButton.addEventListener('click', (event) => {
    event.stopPropagation();
    accountMenu.classList.add('opened');
});

window.addEventListener('click', () => {
    if (accountMenu.style.display !== 'none') {7
        accountMenu.classList.remove('opened');
    }
});

accountMenu.addEventListener('click', (event) => {
    event.stopPropagation();
});

document.querySelector('#account-menu button').addEventListener('click', (event) => {
    window.location = '/api/admin/auth/logout';
});

getRooms();

const toast = document.querySelector('#toast');

const idSection = document.querySelector('#id>span');
const nameSection = document.querySelector('#name>span');
const aliasSection = document.querySelector('#alias>input');
const seatsSection = document.querySelector('#seats>input');
const bannedSection = document.querySelector('#banned>input');
const boardsSection = document.querySelector('#boards');
const detailsSection = document.querySelector('#details');
const typeSection = document.querySelector('#type>select');
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

document.querySelector("#search").addEventListener("input", (e) => {
    let search = e.target.value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f\s]/g, "");
    let results = document.querySelectorAll(`.room-item`);
    let resultsNumber = 0;
    results.forEach((result) => {
        let roomName = result.textContent.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f\s]/g, "");
        if (!roomName.includes(search)) {
            result.style.display = "none";
        } else {
            resultsNumber++;
            result.style.display = "block";
        }
    });
    // document.querySelector(`.${resultContainer} .no-results`).style.display = resultsNumber > 0 ? "none" : "block";
});

document.querySelector('#back-button').addEventListener('click', () => {
    document.querySelector('#room-editor').classList.remove('swipe-left');
    document.querySelector('#rooms-list').classList.remove('swipe-left');
});