import { showToast } from './admin-utils.js';

function drawChart(container, dataset) {
    container.textContent = '';
    let chartBar, shape, legend, value, gap, shapeHeight;
    let containerHeight = container.clientHeight;
    containerHeight -= parseFloat(getComputedStyle(container).paddingTop) + parseFloat(getComputedStyle(container).paddingBottom);
    let maxValue = Math.max(...dataset.map((item) => {
        return item.value;
    }));
    dataset.forEach((data) => {
        chartBar = document.createElement('div');
        chartBar.classList = 'chart-bar';
        legend = document.createElement('div');
        legend.classList = 'chart-bar-legend';
        legend.innerText = data.legend;
        value = document.createElement('div');
        value.classList = 'chart-bar-value';
        value.innerText = data.value > 0 ? data.value : '';
        shape = document.createElement('div');
        shape.classList = 'chart-bar-shape';
        chartBar.appendChild(value);
        chartBar.appendChild(shape);
        chartBar.appendChild(legend);
        container.appendChild(chartBar);
        gap = parseInt(getComputedStyle(chartBar).gap.replace('px', ''));
        shapeHeight = (containerHeight - legend.clientHeight - value.clientHeight - gap) * data.value / maxValue;
        shape.style.height = shapeHeight <= 0 && data.value > 0 ? '1px' : shapeHeight + 'px';
    });
}

async function getStats() {
    let data = [];
    let date = { month: new Date().getMonth() + 1, year: new Date().getFullYear() }
    statsPage.querySelector('.page-title h2').textContent = `Statistiques ce mois (${new Date().getMonth() + 1}/${new Date().getFullYear()})`;
    try {
        data = await fetch(`/api/admin/stats?month=${date.month}&year=${date.year}`, {
            method: 'GET',
        });
        data = await data.json();
    } catch (error) {
        showToast('Erreur d\'obtention des statistiques : ' + error, true)
        console.error(error);
        return;
    }
    if (data.error) {
        showToast('Erreur d\'obtention des statistiques : ' + data.error, true)
    }

    let roomRequestsCount = 0, roomsListRequestsCount = 0, availableRoomsRequestsCount = 0, internalErrorsCount = 0, uniqueVisitorsCount = 0;
    data.daily_stats.forEach(day => {
        roomRequestsCount += day.room_requests;
        roomsListRequestsCount += day.rooms_list_requests;
        availableRoomsRequestsCount += day.available_rooms_requests;
        internalErrorsCount += day.internal_errors;
        uniqueVisitorsCount += day.unique_visitors;
    });

    roomRequestsSection.querySelector('span').textContent = roomRequestsCount;
    roomsListRequestsSection.querySelector('span').textContent = roomsListRequestsCount;
    availableRoomsRequestsSection.querySelector('span').textContent = availableRoomsRequestsCount;
    internalErrorsSection.querySelector('span').textContent = internalErrorsCount;
    uniqueVisitorsSection.querySelector('span').textContent = uniqueVisitorsCount;

    const roomRequestsDataset = data.daily_stats.map((item) => ({
        legend: new Date(item.date).getDate() > 9 ? new Date(item.date).getDate() : '0' + new Date(item.date).getDate(),
        value: item.room_requests
    }));
    drawChart(roomRequestsSection.querySelector('.chart'), roomRequestsDataset);

    const roomsListRequestsDataset = data.daily_stats.map((item) => ({
        legend: new Date(item.date).getDate() > 9 ? new Date(item.date).getDate() : '0' + new Date(item.date).getDate(),
        value: item.rooms_list_requests
    }));
    drawChart(roomsListRequestsSection.querySelector('.chart'), roomsListRequestsDataset);

    const availableRoomsRequestsDataset = data.daily_stats.map((item) => ({
        legend: new Date(item.date).getDate() > 9 ? new Date(item.date).getDate() : '0' + new Date(item.date).getDate(),
        value: item.available_rooms_requests
    }));
    drawChart(availableRoomsRequestsSection.querySelector('.chart'), availableRoomsRequestsDataset);

    const uniqueVisitorsDataset = data.daily_stats.map((item) => ({
        legend: new Date(item.date).getDate() > 9 ? new Date(item.date).getDate() : '0' + new Date(item.date).getDate(),
        value: item.unique_visitors
    }));
    drawChart(uniqueVisitorsSection.querySelector('.chart'), uniqueVisitorsDataset);

    const internalErrorsDataset = data.daily_stats.map((item) => ({
        legend: new Date(item.date).getDate() > 9 ? new Date(item.date).getDate() : '0' + new Date(item.date).getDate(),
        value: item.internal_errors
    }));
    drawChart(internalErrorsSection.querySelector('.chart'), internalErrorsDataset);
}

const statsPage = document.querySelector('#stats');

const roomRequestsSection = statsPage.querySelector('section.room-requests');
const roomsListRequestsSection = statsPage.querySelector('section.rooms-list-requests');
const availableRoomsRequestsSection = statsPage.querySelector('section.available-rooms-requests');
const internalErrorsSection = statsPage.querySelector('section.internal-errors');
const uniqueVisitorsSection = statsPage.querySelector('section.unique-visitors');

async function initStatsPage() {
    await getStats();
}

export { initStatsPage };