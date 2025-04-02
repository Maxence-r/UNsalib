import { 
    START_DAY_HOUR, 
    END_DAY_HOUR, 
    DAY_DURATION, 
    WEEK_DAYS 
} from "@/_utils/constants";
import { ApiCourseType, ApiCoursesResponseType } from "../../_utils/types";
import CalendarBox from "./box";

function CalendarColumn({ dayName, dayNumber, dayCourses, fullDate }: { dayName: string, dayNumber: string, dayCourses: ApiCourseType[], fullDate: string }) {
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
            <div className={`calendar-top ${new Date().toISOString().split("T")[0] == fullDate ? "selected" : ""}`}>
                <p>
                    {dayName}
                    <span className="day">{" " + dayNumber}</span>
                </p>
            </div>
            <div className="column-content">
                {currentDayHours.map(dayHour => <CalendarBox key={dayHour.hour} hourCourses={dayHour.courses}></CalendarBox>)}
            </div>
        </div>
    )
}

export default function CalendarContainer({ courses, hourIndicatorValue, hourIndicatorTop, displayHourIndicator }: { courses: ApiCoursesResponseType, hourIndicatorValue: string, hourIndicatorTop: string, displayHourIndicator: boolean }) {
    const dayHours = [];
    for (let i = 1; i < DAY_DURATION; i++) {
        dayHours.push(<p key={i}>{START_DAY_HOUR + i + ":00"}</p>)
    }

    interface DayType {
        name: string,
        number: string,
        date: string,
        courses: ApiCourseType[]
    };

    const currentWeekDays: DayType[] = [];
    const currentWeekStartDay: number = new Date(courses.weekInfos.start).getDate() || -1;

    WEEK_DAYS.forEach((dayName, i) => {
        let dayNumber: string = "--";
        let dayDate: string = "";
        if (currentWeekStartDay != -1) {
            const currentWeekDay = new Date(courses.weekInfos.start);
            currentWeekDay.setDate(currentWeekDay.getDate() + i);
            dayNumber = currentWeekDay.getDate().toString();
            dayNumber = dayNumber.length < 2 ? "0" + dayNumber : dayNumber;
            dayDate = currentWeekDay.toISOString().split("T")[0];
        }
        currentWeekDays.push({
            name: dayName,
            number: dayNumber,
            date: dayDate,
            courses: []
        });
    });

    courses.courses.forEach(course => {
        currentWeekDays.forEach((day) => {
            if (course.start.startsWith(day.date)) {
                day.courses.push(course);
                return;
            }
        });
    });

    return (
        <div className="calendar-container">
            <div className="calendar-hours">
                <div className="calendar-top"></div>
                <div className="calendar-hours-display">
                    {dayHours}
                    <div
                        className="indicator-hour"
                        style={{ display: displayHourIndicator ? "flex" : "none", top: hourIndicatorTop + "%" }}
                    >
                        <span className="bubble">{hourIndicatorValue}</span>
                        <div className="bar"></div>
                    </div>
                </div>
            </div>
            <div className="calendar-columns">
                {currentWeekDays.map(currentDay => (
                    <CalendarColumn
                        key={currentDay.name}
                        dayName={currentDay.name}
                        dayNumber={currentDay.number}
                        dayCourses={currentDay.courses}
                        fullDate={currentDay.date}
                    ></CalendarColumn>
                ))}
            </div>
        </div >
    )
}
