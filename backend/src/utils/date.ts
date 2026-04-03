// Checks whether a date is in the format 'yyyy-MM-ddTHH:mm:ss+HH:mm'
function isValidDate(date: string): boolean {
    const regex =
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\+(\d{2}):(\d{2})$/;
    return regex.test(date);
}

// Returns the start date, end date and number of a week
function getWeekInfos(weekNumber: number): {
    start: Date;
    end: Date;
    number: number;
} {
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
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 6);
    saturday.setHours(23);
    saturday.setMinutes(59);
    saturday.setSeconds(59);

    return { start: monday, end: saturday, number: weekNumber };
}

// Returns the number of the current week
function getWeeksNumber(): number {
    const currentDate = new Date(); // current date
    const startDate = new Date(currentDate.getFullYear(), 0, 1); // start date of the year (1st January)
    const currentDay = currentDate.getDay(); // current day (0 for Sunday, ... , 6 for Saturday)

    // Algorithm from https://perso.univ-lemans.fr/~hainry/articles/semaine.html
    const J = startDate.getDay();
    const N = Math.round(
        (currentDate.getTime() - startDate.getTime()) / 1000 / 24 / 60 / 60,
    );

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
function getMinutesOverflow(date: Date): number {
    const minutes = date.getMinutes();
    const overflowPercentage = (minutes / 60) * 100;
    return overflowPercentage;
}

// Checks if two dates are equal
function isSameDay(d1: Date, d2: Date): boolean {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

function getDatesRange(start: Date, end: Date): string[] {
    const range = [];
    const current = start;
    while (current < end) {
        range.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
    }
    range.push(current.toISOString().split("T")[0]);
    return range;
}

// Return the start and end dates from now to now + increment
function getBoundDates(increment: number): {
    start: Date;
    end: Date;
} {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + increment);
    endDate.setHours(23);
    endDate.setMinutes(59);

    return {
        start: startDate,
        end: endDate,
    };
}

function getISODate(d: Date) {
    return d.toISOString().split("T")[0]
}

function scheduleRun(triggerDate: Date, fn: () => void): void {
    setTimeout(function () {
        if (new Date() >= triggerDate) {
            fn();
        } else {
            scheduleRun(triggerDate, fn);
        }
    }, 1000);
}

function setDateTimeFromTimeString(date: Date, timeString: string): Date {
    const splittedTime = timeString.split(":");
    date.setHours(parseInt(splittedTime[0]));
    date.setMinutes(parseInt(splittedTime[1]));
    return date;
}

function getDateFromFrenchDateString(dateString: string): Date {
    const splittedDate = dateString.split("/");
    return new Date(
        parseInt(splittedDate[2]),
        parseInt(splittedDate[1]) - 1,
        parseInt(splittedDate[0]),
    );
}

export {
    isValidDate,
    getWeekInfos,
    getWeeksNumber,
    getMinutesOverflow,
    isSameDay,
    getDatesRange,
    getBoundDates,
    getISODate,
    scheduleRun,
    setDateTimeFromTimeString,
    getDateFromFrenchDateString,
};
