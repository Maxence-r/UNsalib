import type { ReactElement } from "react";

import "./Chip.css";

function Chip({
    type,
    name,
    text,
    checked,
    onChange,
}: {
    type: "radio" | "checkbox";
    name: string;
    text: string;
    checked?: boolean;
    onChange?: () => void;
}): ReactElement {
    return (
        <label className="chip">
            <input
                type={type}
                name={name}
                checked={checked}
                onChange={onChange}
            />
            <span>{text}</span>
        </label>
    );
}

function ChipsContainer<
    O extends {
        id: string;
        name: string;
    }[],
>({
    name,
    options,
    multiSelect,
    selected,
    setSelected,
}: {
    name: string;
    options: O;
} & (
    | {
          multiSelect?: false;
          selected?: O[number]["id"];
          setSelected?: (option: O[number]["id"]) => void;
      }
    | {
          multiSelect: true;
          selected?: O[number]["id"][];
          setSelected?: (options: O[number]["id"][]) => void;
      }
)): ReactElement {
    const selectedOptions = multiSelect
        ? (selected ?? [])
        : selected
          ? [selected]
          : [];

    return (
        <div className="chips-container">
            {options.map((o) => (
                <Chip
                    type={multiSelect ? "checkbox" : "radio"}
                    name={name}
                    text={o.name}
                    key={o.id}
                    checked={
                        selected !== undefined && selectedOptions.includes(o.id)
                    }
                    onChange={() => {
                        if (multiSelect) {
                            const nextOptions = selectedOptions.includes(o.id)
                                ? selectedOptions.filter(
                                      (option) => option !== o.id,
                                  )
                                : [...selectedOptions, o.id];
                            setSelected?.(nextOptions);
                        } else {
                            setSelected?.(o.id);
                        }
                    }}
                />
            ))}
        </div>
    );
}

export { ChipsContainer };
