function getWeeksInYear() {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

    const diffTime = currentDate - startOfYear;

    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    const weeks = Math.ceil(diffDays / 7);

    return weeks;
}

function joinArrayElements(array, separator, splitter, chooseBeforeSplit = false) {
    let string = '';
    array.forEach((element) => {
        if (splitter) {
            string += element.split(splitter)[chooseBeforeSplit ? 0 : 1] + ' ' + separator + ' ';
        } else {
            string += element + separator + ' ';
        }
    });
    string = string.substring(0, string.length - separator.length - 1);
    return string;
}

function areCoursesOverlapping(course1, course2) {
    const start1 = new Date(course1.start);
    const end1 = new Date(course1.end);
    const start2 = new Date(course2.start);
    const end2 = new Date(course2.end);

    return (start1 <= end2 && start2 <= end1);
}

function groupOverlappingCourses(coursesArray) {
    const groupedCourses = [];
    const visited = new Set();

    for (let i = 0; i < coursesArray.length; i++) {
        if (visited.has(coursesArray[i].courseId)) continue;

        const overlappingGroup = [coursesArray[i]];
        visited.add(coursesArray[i].courseId);

        for (let j = i + 1; j < coursesArray.length; j++) {
            if (visited.has(coursesArray[j].courseId)) continue;

            if (areCoursesOverlapping(coursesArray[i], coursesArray[j])) {
                overlappingGroup.push(coursesArray[j]);
                visited.add(coursesArray[j].courseId);
            }
        }

        groupedCourses.push(overlappingGroup);
    }

    return groupedCourses;
}



async function afficherSalle(salle, delta) {
    const parsedCourses = groupOverlappingCourses(salleData.courses);
}