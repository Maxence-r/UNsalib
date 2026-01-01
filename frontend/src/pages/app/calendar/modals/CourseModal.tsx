function CourseModal({
    startDate,
    endDate,
    color,
    groups,
    modules,
    moduleNamesString,
    teachers,
}: {
    startDate: string;
    endDate: string;
    color: string;
    groups: string[];
    modules: string[];
    moduleNamesString: string;
    teachers: string[];
}) {
    const start: Date = new Date(startDate);
    const end: Date = new Date(endDate);
    const durationHours =
        end.getHours() - start.getHours() > 0
            ? end.getHours() - start.getHours() + "h"
            : "";
    let durationMinutes =
        end.getMinutes() - start.getMinutes() > 0
            ? end.getMinutes() - start.getMinutes() + "min"
            : "";
    durationMinutes =
        durationHours == "" && durationMinutes == "" ? "0min" : durationMinutes;

    return (
        <div className="course-details">
            <div className="course-box">
                <p className="course-start">
                    {start.getHours() +
                        ":" +
                        (start.getMinutes().toString().length == 2
                            ? start.getMinutes()
                            : "0" + start.getMinutes())}
                </p>
                <div
                    className="course-container"
                    style={{
                        backgroundColor: color,
                    }}
                >
                    <p>{moduleNamesString}</p>
                </div>
                <p className="course-end">
                    {end.getHours() +
                        ":" +
                        (end.getMinutes().toString().length == 2
                            ? end.getMinutes()
                            : "0" + end.getMinutes())}
                </p>
            </div>
            <div className="detail">
                <h2>Enseignant·e·s :</h2>
                <p id="teacher-name">
                    {teachers.length > 0
                        ? teachers.join(" ; ")
                        : "Non renseigné"}
                </p>
            </div>
            <div className="detail">
                <h2>Module·s :</h2>
                <p id="module">
                    {modules.length > 0 ? modules.join(" ; ") : "Non renseigné"}
                </p>
            </div>
            <div className="detail">
                <h2>Durée :</h2>
                <p id="duration">{durationHours + durationMinutes}</p>
            </div>
            <div className="detail">
                <h2>Groupe·s :</h2>
                <p id="groupes">
                    {groups.length > 0 ? groups.join(" ; ") : "Non renseigné"}
                </p>
            </div>
        </div>
    );
}

export { CourseModal };
