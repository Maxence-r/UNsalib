import {
    addDays,
    addWeeks,
    format,
    getISOWeeksInYear,
    isValid,
    parse,
    startOfISOWeekYear,
    set,
} from "date-fns";

class InvalidDateError extends Error {
    constructor(date: string | Date | number) {
        super(`'${String(date)}' is not a valid existing date.`);
    }
}

class TimestringFormatError extends Error {
    constructor(timestring: string) {
        super(`'${timestring}' is not in the HH:mm format.`);
    }
}

class TimestringError extends Error {
    constructor(timestring: string) {
        super(`'${timestring}' does not represent a valid time.`);
    }
}

class FrenchDatestringFormatError extends Error {
    constructor(datestring: string) {
        super(`'${datestring}' is not in the dd/MM/yyyy format.`);
    }
}

class TimestampFormatError extends Error {
    constructor(ts: string) {
        super(`'${ts}' is not a valid milliseconds timestamp format.`);
    }
}

// function getDatesRange(start: Date, end: Date): string[] {
//     const range = [];
//     const current = start;
//     while (current < end) {
//         range.push(current.toISOString().split("T")[0]);
//         current.setDate(current.getDate() + 1);
//     }
//     range.push(current.toISOString().split("T")[0]);
//     return range;
// }

function getDateFromTimestampString(ts: string): Date {
    if (!/^[0-9]{13}$/.test(ts)) {
        throw new TimestampFormatError(ts);
    }

    const intTs = parseInt(ts);
    if (!isValid(intTs)) throw new InvalidDateError(ts);

    return new Date(intTs);
}

function getDateFromFrenchDatestring(datestring: string): Date {
    if (!/^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/.test(datestring)) {
        throw new FrenchDatestringFormatError(datestring);
    }

    const parsed = parse(datestring, "dd/MM/yyyy", new Date());
    if (!isValid(parsed)) throw new InvalidDateError(datestring);

    return parsed;
}

function setDateTimeFromTimestring(date: Date, timestring: string): Date {
    if (!isValid(date)) {
        throw new InvalidDateError(date);
    }
    if (!/^[0-9]{2}:[0-9]{2}$/.test(timestring)) {
        throw new TimestringFormatError(timestring);
    }
    if (!/^[0-9][0-3]:[0-5][0-9]$/.test(timestring)) {
        throw new TimestringError(timestring);
    }

    return parse(timestring, "HH:mm", date);
}

function scheduleRun(triggerDate: Date, fn: () => void): void {
    setTimeout(() => {
        if (new Date() >= triggerDate) {
            fn();
        } else {
            scheduleRun(triggerDate, fn);
        }
    }, 1000);
}

/**
 * Return the start and end dates from now to now + increment
 */
function getBoundDates(increment: number): {
    start: Date;
    end: Date;
} {
    const startDate = set(new Date(), {
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const endDate = set(new Date(startDate), {
        date: startDate.getDate() + increment,
        hours: 23,
        minutes: 59,
        seconds: 59,
    });

    return {
        start: startDate,
        end: endDate,
    };
}

function getISODateString(date: Date): string {
    if (!isValid(date)) {
        throw new InvalidDateError(date);
    }

    return format(date, "yyyy-MM-dd");
}

/**
 * Return the index of a week (current by default), or the next week
 * if the current day is part of the weekend
 *
 * Note: We cannot use date-fns getWeek() function because it returns
 * false values (see https://github.com/date-fns/date-fns/issues/3485).
 * Instead, our function works very well and is based on the algorithm presented by
 * Gilles HAINRY at https://perso.univ-lemans.fr/~hainry/articles/semaine.html.
 */
function getWeekIndex(
    date: Date = new Date(),
    skipWeekend: boolean = true,
): number {
    if (skipWeekend) {
        if (date.getDay() === 6) {
            // Change Saturday to the next Monday
            date.setDate(date.getDate() + 2);
        } else if (date.getDay() === 0) {
            // Change Sunday to the next Monday
            date.setDate(date.getDate() + 1);
        }
    }

    // 1st January of the year
    const startDate = new Date(date.getFullYear(), 0, 1);

    const J = startDate.getDay();
    const N = Math.round(
        (date.getTime() - startDate.getTime()) / 1000 / 24 / 60 / 60,
    );

    let weekNumber;
    if (J <= 4) {
        weekNumber = Math.floor((J + N + 5) / 7);
    } else {
        weekNumber = Math.floor((J + N + 5) / 6);
    }

    return weekNumber;
}

/**
 * Return the start and end date of a week based on its index in the specified year
 */
function getWeekInfos(
    weekIndex: number,
    year = new Date().getFullYear(),
): {
    start: Date;
    end: Date;
    number: number;
} {
    // Increasing the specified year if weekIndex > max weeks of this year
    // ISO years can contain either 52 or 53 weeks, so we determine each year
    // dynamically instead of assuming that every year has 52 weeks
    while (weekIndex > getISOWeeksInYear(new Date(year, 0, 20))) {
        weekIndex -= getISOWeeksInYear(new Date(year, 0, 20));
        year++;
    }

    // We use January 20 as we are sure it is always in the requested ISO year
    const firstMonday = startOfISOWeekYear(new Date(year, 0, 20));
    const monday = addWeeks(firstMonday, weekIndex - 1);
    const sunday = set(addDays(monday, 6), {
        hours: 23,
        minutes: 59,
        seconds: 59,
    });

    return { start: monday, end: sunday, number: weekIndex };
}

export {
    getWeekInfos,
    getWeekIndex,
    // getDatesRange,
    getBoundDates,
    getISODateString,
    scheduleRun,
    setDateTimeFromTimestring,
    getDateFromFrenchDatestring,
    getDateFromTimestampString,
};
