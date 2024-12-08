function showToast(msg, error=false) {
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
    detailsSection.value = JSON.stringify(data.details);
    typeSection.value = data.type;
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
        });
    });
    getRoom(document.querySelector('.room-item').id);
    document.querySelector('#room-editor').style.display = 'flex';
}

getRooms();

const toast = document.querySelector('#toast');

const idSection = document.querySelector('#id>span');
const nameSection = document.querySelector('#name>span');
const aliasSection = document.querySelector('#alias>input');
const seatsSection = document.querySelector('#seats>input');
const bannedSection = document.querySelector('#banned>input');
const boardsSection = document.querySelector('#boards');
const detailsSection = document.querySelector('#details>textarea');
const typeSection = document.querySelector('#type>select');

const saveBtn = document.querySelector('#save-button');
saveBtn.addEventListener('click', () => {
    const tableauObj = {
        NOIR: boardsSection.querySelector('input[name="noir"]').value,
        BLANC: boardsSection.querySelector('input[name="blanc"]').value,
        ECRAN: boardsSection.querySelector('input[name="ecran"]').value
    };
    const data = {
        alias: aliasSection.value,
        places_assises: seatsSection.value,
        tableau: tableauObj,
        caracteristiques: JSON.parse(detailsSection.value),
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