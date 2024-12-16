import { initRoomsManagerPage } from './admin-manager.js';
import { initBookingPage } from './admin-booking.js';
import { initStatsPage } from './admin-stats.js';
import { showToast } from './admin-utils.js';

async function getAccount() {
    let data = [];
    try {
        data = await fetch('/api/admin/account-infos', {
            method: 'GET',
        });
        data = await data.json();
    } catch (error) {
        console.error(error);
        showToast('Impossible d\'obtenir le compte utilisateur : ' + error, true);
        return;
    }
    document.querySelector('#account-button>span').textContent = data.name + ' ' + data.lastname;
    document.querySelectorAll('.account-icon').forEach((node) => {
        node.src = 'data:image/png;base64,' + data.icon;
    });
    document.querySelectorAll('.account-infos h2').forEach((node) => {
        node.textContent = data.name + ' ' + data.lastname;
    });
    document.querySelectorAll('.account-infos span').forEach((node) => {
        node.textContent = '@' + data.username;
    });
    document.querySelectorAll('.account-infos img').forEach((node) => {
        node.src = 'data:image/png;base64,' + data.icon;
    });
}

async function showRoomsManagerPage() {
    loadingPage.classList.add('ready');
    manageLinks.forEach((link) => {
        link.classList.add('selected');
    });
    bookLinks.forEach((link) => {
        link.classList.remove('selected');
    });
    statsLinks.forEach((link) => {
        link.classList.remove('selected');
    });
    mobilePageName.innerText = 'Gérer';
    roomsManagerPage.classList.add('showed');
    bookingPage.classList.remove('showed', 'ready');
    statsPage.classList.remove('showed', 'ready');
    await initRoomsManagerPage();
    loadingPage.classList.remove('ready');
    roomsManagerPage.classList.add('ready');
    localStorage.setItem('selectedPage', 'roomsManager');
}

async function showBookingPage() {
    loadingPage.classList.add('ready');
    bookLinks.forEach((link) => {
        link.classList.add('selected');
    });
    manageLinks.forEach((link) => {
        link.classList.remove('selected');
    });
    statsLinks.forEach((link) => {
        link.classList.remove('selected');
    });
    mobilePageName.innerText = 'Réserver';
    bookingPage.classList.add('showed');
    roomsManagerPage.classList.remove('showed', 'ready');
    statsPage.classList.remove('showed', 'ready');
    await initBookingPage();
    loadingPage.classList.remove('ready');
    bookingPage.classList.add('ready');
    localStorage.setItem('selectedPage', 'booking');
}

async function showStatsPage() {
    loadingPage.classList.add('ready');
    statsLinks.forEach((link) => {
        link.classList.add('selected');
    });
    manageLinks.forEach((link) => {
        link.classList.remove('selected');
    });
    bookLinks.forEach((link) => {
        link.classList.remove('selected');
    });
    mobilePageName.innerText = 'Statistiques';
    statsPage.classList.add('showed');
    roomsManagerPage.classList.remove('showed', 'ready');
    bookingPage.classList.remove('showed', 'ready');
    await initStatsPage();
    loadingPage.classList.remove('ready');
    statsPage.classList.add('ready');
    localStorage.setItem('selectedPage', 'stats');
}

const accountButton = document.querySelector('#account-button');
const accountMenu = document.querySelector('#account-menu');

const mobileMenu = document.querySelector('#mobile-menu');
const mobilePageName = document.querySelector('.branding h1.page-name');

const manageLinks = document.querySelectorAll('.navlink.manage');
const bookLinks = document.querySelectorAll('.navlink.book');
const statsLinks = document.querySelectorAll('.navlink.stats');

const roomsManagerPage = document.querySelector('main#rooms-manager');
const bookingPage = document.querySelector('main#booking');
const statsPage = document.querySelector('main#stats');
const loadingPage = document.querySelector('main#loading');

async function initApp() {
    getAccount();

    accountButton.addEventListener('click', (event) => {
        event.stopPropagation();
        accountMenu.classList.add('opened');
    });

    accountMenu.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    document.querySelectorAll('.logout').forEach((button) => {
        button.addEventListener('click', () => {
            window.location = '/api/admin/auth/logout';
        });
    });

    window.addEventListener('click', () => {
        if (accountMenu.classList.contains('opened')) {
            accountMenu.classList.remove('opened');
        }
    });

    document.querySelector('#navbar .branding button').addEventListener('click', () => {
        mobileMenu.classList.add('opened');
    });

    mobileMenu.addEventListener('click', function (event) {
        if (!mobileMenu.querySelector('#mobile-menu-window').contains(event.target)) {
            mobileMenu.classList.remove('opened');
        }
    });

    manageLinks.forEach((link) => {
        link.addEventListener('click', async () => {
            mobileMenu.classList.remove('opened');
            await showRoomsManagerPage();
        });
    });

    bookLinks.forEach((link) => {
        link.addEventListener('click', async () => {
            mobileMenu.classList.remove('opened');
            await showBookingPage();
        });
    });

    statsLinks.forEach((link) => {
        link.addEventListener('click', async () => {
            mobileMenu.classList.remove('opened');
            await showStatsPage();
        });
    });

    let font = new FontFace('Material Symbols Rounded', `url(https://fonts.gstatic.com/s/materialsymbolsrounded/v222/sykg-zNym6YjUruM-QrEh7-nyTnjDwKNJ_190Fjzag.woff2) format('woff2')`, {
        style: 'normal',
        weight: '100 700'
    });
    document.fonts.add(font);
    await font.load();

    document.body.classList.add('ready');
    let selectedPage = localStorage.getItem('selectedPage');
    if (selectedPage == 'roomsManager') {
        showRoomsManagerPage();
    } else if (selectedPage == 'booking') {
        showBookingPage();
    } else if (selectedPage == 'stats') {
        showStatsPage();
    } else {
        showRoomsManagerPage();
    }
}

initApp();