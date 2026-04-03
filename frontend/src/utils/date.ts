function getCurrentWeekNumber(): number {
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

export { getCurrentWeekNumber };
