export function CalendarColumn({ dayName, dayNumber, dayCourses }: { dayName: string, dayNumber: string, dayCourses: ApiCourseType[] }) {
    interface HourType {
        hour: string,
        courses: ApiCourseType[]
    };

    const currentDayHours: HourType[] = [];
    for (let i = START_DAY_HOUR; i < END_DAY_HOUR; i++) {
        currentDayHours.push({
            hour: (i < 10 ? "0" + i : i).toString(),
            courses: []
        })
    }

    dayCourses.forEach(course => {
        currentDayHours.forEach((hour) => {
            if (course.start.split("T")[1].startsWith(hour.hour)) {
                hour.courses.push(course);
                return;
            }
        });
    });

    return (
        <div className="column">
            <div className={`calendar-top ${new Date().getDate() == parseInt(dayNumber) ? "selected" : ""}`}>
                <p>
                    {dayName}
                    <span className="day">{" " + dayNumber}</span>
                </p>
            </div>
            <div className="column-content">
                {/* {currentDayHours.map(dayHour => <CalendarBox key={dayHour.hour} hourCourses={dayHour.courses}></CalendarBox>)} */}
            </div>
        </div>
    )
}