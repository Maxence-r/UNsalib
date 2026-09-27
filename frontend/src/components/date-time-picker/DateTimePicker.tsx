import {
    useRef,
    useState,
    type ReactElement,
    type KeyboardEvent,
    type Dispatch,
    type SetStateAction,
    type ChangeEvent,
} from "react";
import {
    DatePicker as ReactDatePicker,
    type ReactDatePickerCustomHeaderProps,
} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "./DateTimePicker.css";
import { IconButton } from "../button/Button";

const months = [
    "Janv.",
    "Févr.",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juill.",
    "Août",
    "Sept.",
    "Oct.",
    "Nov.",
    "Déc.",
];

function CustomHeader({
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
}: ReactDatePickerCustomHeaderProps): ReactElement {
    return (
        <>
            <IconButton
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                icon={<ChevronLeft />}
                secondary
            />

            <span>
                {months[date.getMonth()]} {date.getFullYear()}
            </span>

            <IconButton
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                icon={<ChevronRight />}
                secondary
            />
        </>
    );
}

function DatePicker({
    selectedDate,
    setSelectedDate,
}: {
    selectedDate: Date;
    setSelectedDate: (d: Date) => void;
}): ReactElement {
    return (
        <ReactDatePicker
            selected={selectedDate}
            renderCustomHeader={CustomHeader}
            onChange={(date) => setSelectedDate(date)}
            inline
        />
    );
}

function getDigitsFromDate(date: Date): [string, string, string, string] {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return [h[0], h[1], m[0], m[1]];
}

function TimePicker({
    selectedTime,
    setSelectedTime,
}: {
    selectedTime: Date;
    setSelectedTime: Dispatch<SetStateAction<Date>>;
}): ReactElement {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [digits, setDigits] = useState<[string, string, string, string]>(() =>
        getDigitsFromDate(selectedTime),
    );

    const updateParentDate = (
        newDigits: [string, string, string, string],
    ): void => {
        const hours = parseInt(newDigits[0] + newDigits[1]);
        const minutes = parseInt(newDigits[2] + newDigits[3]);

        // Validate 24h format bounds
        if (hours < 24 && minutes < 60) {
            const nextDate = new Date(selectedTime);
            nextDate.setHours(hours, minutes, 0, 0);
            setSelectedTime(nextDate);
        }
    };

    const updateDigitAt = (index: number, val: string): void => {
        if (!val) return;

        const nextDigits: [string, string, string, string] = [...digits];
        nextDigits[index] = val;
        setDigits(nextDigits);
        updateParentDate(nextDigits);
    };

    const handleChange = (
        index: number,
        e: ChangeEvent<HTMLInputElement>,
    ): void => {
        // Keep last typed character
        const val = e.target.value.replace(digits[index], "");
        if (!/^[0-9]*$/.test(val)) return;

        // intVal > 0 because '-' is not allowed by the regex
        const intVal = parseInt(val);

        if (
            (index === 0 && intVal > 2) ||
            (index === 1 && parseInt(digits[0]) === 2 && intVal > 3) ||
            (index === 2 && intVal > 5)
        ) {
            return;
        }

        updateDigitAt(index, val);

        // Advance focus if a digit was entered
        if (val && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        e: KeyboardEvent<HTMLInputElement>,
    ): void => {
        if (e.key === "Backspace") {
            updateDigitAt(index, "0");
            if (index > 0) inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    return (
        <div className="time-picker">
            {digits.map((digit, idx) => (
                <>
                    {idx === 2 && (
                        <span className="hour-separator" key="separator">
                            h
                        </span>
                    )}
                    <input
                        ref={(el) => {
                            inputRefs.current[idx] = el;
                        }}
                        type="number"
                        className="digit"
                        value={digit}
                        onChange={(e) => handleChange(idx, e)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        onCopy={(e) => e.preventDefault()}
                        onCut={(e) => e.preventDefault()}
                        onPaste={(e) => e.preventDefault()}
                        key={idx}
                        name={`time-char-${idx + 1}`}
                    />
                </>
            ))}
        </div>
    );
}

export { DatePicker, TimePicker };
