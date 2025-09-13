// Checks whether a date is in the format 'yyyy-MM-ddTHH:mm:ss+HH:mm'
function isValidDate(date) {
    const regex =
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\+(\d{2}):(\d{2})$/;
    return regex.test(date);
}

// Returns the start date, end date and number of a week
function getWeekInfos(weekNumber) {
    let year = new Date().getFullYear();
    if (weekNumber > 52) {
        weekNumber -= 52;
        year++;
    }

    const fourJanuaryDate = new Date(year, 0, 4);
    const weekDay = fourJanuaryDate.getDay() || 7; // day of the week (1-7)
    const firstMonday = new Date(fourJanuaryDate);
    firstMonday.setDate(fourJanuaryDate.getDate() - (weekDay - 1));

    // Calculating the Monday of the week requested
    const monday = new Date(firstMonday);
    monday.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);

    // Calculating the Saturday of the week requested
    const dimanche = new Date(monday);
    dimanche.setDate(monday.getDate() + 6);

    // Formatting dates in YYYY-MM-DD format to avoid time zone problems
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const day = ("0" + date.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    };

    const mondayISO = formatDate(monday);
    const saturdayISO = formatDate(dimanche);

    return { start: mondayISO, end: saturdayISO, number: weekNumber };
}

// Returns the number of the current week
function getWeeksNumber() {
    const currentDate = new Date(); // current date
    const startDate = new Date(currentDate.getFullYear(), 0, 1); // start date of the year (1st January)
    const currentDay = currentDate.getDay(); // current day (0 for Sunday, ... , 6 for Saturday)

    // Algorithm from https://perso.univ-lemans.fr/~hainry/articles/semaine.html
    const J = startDate.getDay();
    const N = Math.round((currentDate - startDate) / 1000 / 24 / 60 / 60);

    let weekNumber;
    if (J <= 4) {
        weekNumber = Math.floor((J + N + 5) / 7);
    } else {
        weekNumber = Math.floor((J + N + 5) / 6);
    }

    // If it's Saturday (6) or Sunday (0), incrementing the week number (weekend not displayed in the UI)
    if (currentDay === 6 || currentDay === 0) {
        weekNumber += 1;
    }

    return weekNumber;
}

// Calculates the overflow in percentage of the course for display on the client
function getMinutesOverflow(date) {
    const minutes = date.getMinutes();
    const overflowPercentage = (minutes / 60) * 100;
    return overflowPercentage;
}

// Checks if two dates are equal
function isSameDay(d1, d2) {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

function getDatesRange(start, end) {
    const range = [];
    let current = start;
    while (current < end) {
        range.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
    }
    range.push(current.toISOString().split("T")[0]);
    return range;
}

export {
    isValidDate,
    getWeekInfos,
    getWeeksNumber,
    getMinutesOverflow,
    isSameDay,
    getDatesRange,
};
