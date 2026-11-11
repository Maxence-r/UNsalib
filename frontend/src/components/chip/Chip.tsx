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

function ChipsContainer({
    name,
    options,
    multiSelect,
    selected,
    setSelected,
}: {
    name: string;
    options: {
        id: string;
        name: string;
    }[];
} & (
    | {
          multiSelect?: false;
          selected?: string;
          setSelected?: (option: string) => void;
      }
    | {
          multiSelect: true;
          selected?: string[];
          setSelected?: (options: string[]) => void;
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
