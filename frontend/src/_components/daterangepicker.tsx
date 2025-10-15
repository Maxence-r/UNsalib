"use client";

import { useState } from "react";
import "./daterangepicker.css";

export type DateRange = {
    start: string,
    end: string
};

type DateRangePreset = {
    label: string,
    getValue: () => DateRange
};

const presets: DateRangePreset[] = [
    {
        label: "Aujourd'hui",
        getValue: () => {
            const today = new Date().toISOString().split('T')[0];
            return { start: today, end: today };
        }
    },
    {
        label: "7 derniers jours",
        getValue: () => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 6);
            return {
                start: start.toISOString().split('T')[0],
                end: end.toISOString().split('T')[0]
            };
        }
    },
    {
        label: "30 derniers jours",
        getValue: () => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 29);
            return {
                start: start.toISOString().split('T')[0],
                end: end.toISOString().split('T')[0]
            };
        }
    },
    {
        label: "Ce mois",
        getValue: () => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return {
                start: start.toISOString().split('T')[0],
                end: end.toISOString().split('T')[0]
            };
        }
    },
    {
        label: "Mois dernier",
        getValue: () => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0);
            return {
                start: start.toISOString().split('T')[0],
                end: end.toISOString().split('T')[0]
            };
        }
    }
];

export default function DateRangePicker({
    value,
    onChange,
    className
}: {
    value: DateRange,
    onChange: (range: DateRange) => void,
    className?: string
}) {
    const [customMode, setCustomMode] = useState(false);

    const handlePresetClick = (preset: DateRangePreset) => {
        setCustomMode(false);
        onChange(preset.getValue());
    };

    const handleCustomChange = (field: 'start' | 'end', newValue: string) => {
        const currentRange = { ...value };
        currentRange[field] = newValue;
        onChange(currentRange);
    };

    return (
        <div className={`date-range-picker ${className || ''}`}>
            <div className="presets">
                {presets.map((preset, index) => (
                    <button
                        key={index}
                        className="preset-button"
                        onClick={() => handlePresetClick(preset)}
                    >
                        {preset.label}
                    </button>
                ))}
                <button
                    className={`preset-button ${customMode ? 'active' : ''}`}
                    onClick={() => setCustomMode(true)}
                >
                    Personnalisé
                </button>
            </div>
            {customMode && (
                <div className="custom-range">
                    <div className="input-group">
                        <label>Début</label>
                        <input
                            type="date"
                            value={value.start}
                            onChange={(e) => handleCustomChange('start', e.target.value)}
                            max={value.end}
                        />
                    </div>
                    <div className="input-group">
                        <label>Fin</label>
                        <input
                            type="date"
                            value={value.end}
                            onChange={(e) => handleCustomChange('end', e.target.value)}
                            min={value.start}
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>
            )}
            <div className="selected-range">
                <span>Du {new Date(value.start).toLocaleDateString('fr-FR')} au {new Date(value.end).toLocaleDateString('fr-FR')}</span>
            </div>
        </div>
    );
}
