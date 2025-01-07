import { showToast, chooseColor } from './admin-utils.js';

const PALETTE_HEX = [
    '#1abc9c',
    '#f1c40f',
    '#2ecc71',
    '#e67e22',
    '#3498db',
    '#e74c3c',
    '#9b59b6',
    '#95a5a6',
    '#16a085',
    '#f39c12',
    '#27ae60',
    '#d35400',
    '#2980b9',
    '#c0392b',
    '#8e44ad',
    '#bdc3c7'
];

function comparePieDatasets(a, b) {
    if (a.value < b.value) {
        return 1;
    } else if (a.value > b.value) {
        return -1;
    } else {
        return 0;
    }
}

function drawPieChart(container, dataset) {
    dataset.sort(comparePieDatasets);
    container.textContent = '';
    let legend = document.createElement('div');
    legend.classList = 'legend';
    let legendItem;
    if (dataset.length > 0) {
        let shape = document.createElement('div');
        shape.classList = 'shape';
        let valueSum = dataset.reduce((a, b) => {
            return a + b.value;
        }, 0);
        let conicGradient = 'conic-gradient(';
        let radius = 0;
        let pickedColors = [];
        let valueRadius, color, legendColor, legendName;
        dataset.forEach((data) => {
            valueRadius = (360 * data.value / valueSum);
            [color, pickedColors] = chooseColor(PALETTE_HEX, pickedColors);
            conicGradient += `${color} ${radius}deg ${radius + valueRadius}deg, `;
            radius += valueRadius;
            legendItem = document.createElement('div');
            legendItem.classList = 'legend-item';
            legendColor = document.createElement('div');
            legendColor.classList = 'legend-color';
            legendColor.style.backgroundColor = color;
            legendName = document.createElement('div');
            legendName.classList = 'legend-name';
            legendName.innerText = `${data.legend} (${Math.round(100 * data.value / valueSum)}%)`;
            legendItem.appendChild(legendColor);
            legendItem.appendChild(legendName);
            legend.appendChild(legendItem);
        });
        conicGradient = conicGradient.slice(0, conicGradient.length - 2) + ')';
        shape.style.background = conicGradient;
        container.appendChild(shape);
        container.appendChild(legend);
    } else {
        legendItem = document.createElement('div');
        legendItem.classList = 'legend-item';
        legendItem.textContent = 'Aucune donnée n\'est disponible.'
        legend.appendChild(legendItem);
        container.appendChild(legend);
    }
}

function drawBarChart(container, dataset) {
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
    
    data.dailyStats.forEach((day) => {
        roomRequestsCount += day.roomRequests;
        roomsListRequestsCount += day.roomsListRequests;
        availableRoomsRequestsCount += day.availableRoomsRequests;
        internalErrorsCount += day.internalErrors;
        uniqueVisitorsCount += day.uniqueVisitors;
    });

    roomRequestsSection.querySelector('span').textContent = roomRequestsCount;
    roomsListRequestsSection.querySelector('span').textContent = roomsListRequestsCount;
    availableRoomsRequestsSection.querySelector('span').textContent = availableRoomsRequestsCount;
    internalErrorsSection.querySelector('span').textContent = internalErrorsCount;
    uniqueVisitorsSection.querySelector('span').textContent = Math.round(uniqueVisitorsCount / new Date().getDate() * 100) / 100 + '/jour';

    const roomRequestsDataset = data.dailyStats.map((item) => ({
        legend: new Date(item.date).getDate() > 9 ? new Date(item.date).getDate() : '0' + new Date(item.date).getDate(),
        value: item.roomRequests
    }));
    drawBarChart(roomRequestsSection.querySelector('.chart'), roomRequestsDataset);

    const roomsListRequestsDataset = data.dailyStats.map((item) => ({
        legend: new Date(item.date).getDate() > 9 ? new Date(item.date).getDate() : '0' + new Date(item.date).getDate(),
        value: item.roomsListRequests
    }));
    drawBarChart(roomsListRequestsSection.querySelector('.chart'), roomsListRequestsDataset);

    const availableRoomsRequestsDataset = data.dailyStats.map((item) => ({
        legend: new Date(item.date).getDate() > 9 ? new Date(item.date).getDate() : '0' + new Date(item.date).getDate(),
        value: item.availableRoomsRequests
    }));
    drawBarChart(availableRoomsRequestsSection.querySelector('.chart'), availableRoomsRequestsDataset);

    const uniqueVisitorsDataset = data.dailyStats.map((item) => ({
        legend: new Date(item.date).getDate() > 9 ? new Date(item.date).getDate() : '0' + new Date(item.date).getDate(),
        value: item.uniqueVisitors
    }));
    drawBarChart(uniqueVisitorsSection.querySelector('.chart'), uniqueVisitorsDataset);

    const internalErrorsDataset = data.dailyStats.map((item) => ({
        legend: new Date(item.date).getDate() > 9 ? new Date(item.date).getDate() : '0' + new Date(item.date).getDate(),
        value: item.internalErrors
    }));
    drawBarChart(internalErrorsSection.querySelector('.chart'), internalErrorsDataset);

    const clientOSDataset = Object.keys(data.monthlyStats.os).map((item) => ({
        legend: item,
        value: data.monthlyStats.os[item]
    }));
    drawPieChart(clientOSSection.querySelector('.chart.pie-chart'), clientOSDataset);

    const clientBrowsersDataset = Object.keys(data.monthlyStats.browsers).map((item) => ({
        legend: item,
        value: data.monthlyStats.browsers[item]
    }));
    drawPieChart(clientBrowsersSection.querySelector('.chart.pie-chart'), clientBrowsersDataset);
}

const statsPage = document.querySelector('#stats');

const roomRequestsSection = statsPage.querySelector('section.room-requests');
const roomsListRequestsSection = statsPage.querySelector('section.rooms-list-requests');
const availableRoomsRequestsSection = statsPage.querySelector('section.available-rooms-requests');
const internalErrorsSection = statsPage.querySelector('section.internal-errors');
const uniqueVisitorsSection = statsPage.querySelector('section.unique-visitors');
const clientOSSection = statsPage.querySelector('section.client-os');
const clientBrowsersSection = statsPage.querySelector('section.client-browsers');

async function initStatsPage() {
    await getStats();

    socket.on('connect', () => {
        console.log('Connected to Socket.IO server');
    });
    
    socket.on('statsUpdated', async (data) => {
        await getStats();
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
    });
    
    socket.on('error', (error) => {
        console.error('Socket.IO error:', error);
    });
}

export { initStatsPage };