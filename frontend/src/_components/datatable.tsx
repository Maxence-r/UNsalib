"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Search } from "lucide-react";
import "./datatable.css";

export type Column<T> = {
    key: string,
    label: string,
    sortable?: boolean,
    render?: (value: any, row: T) => React.ReactNode
};

type SortConfig = {
    key: string,
    direction: 'asc' | 'desc'
} | null;

export default function DataTable<T extends Record<string, any>>({
    data,
    columns,
    pageSize = 10,
    searchable = true,
    selectable = false,
    onSelectionChange,
    className
}: {
    data: T[],
    columns: Column<T>[],
    pageSize?: number,
    searchable?: boolean,
    selectable?: boolean,
    onSelectionChange?: (selected: T[]) => void,
    className?: string
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        
        return data.filter(row => {
            return columns.some(col => {
                const value = row[col.key];
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        });
    }, [data, searchTerm, columns]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortConfig) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [filteredData, sortConfig]);

    // Paginate data
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return sortedData.slice(start, end);
    }, [sortedData, currentPage, pageSize]);

    // Handle sort
    const handleSort = (key: string) => {
        setSortConfig(current => {
            if (!current || current.key !== key) {
                return { key, direction: 'asc' };
            }
            if (current.direction === 'asc') {
                return { key, direction: 'desc' };
            }
            return null;
        });
    };

    // Handle selection
    const handleSelectAll = () => {
        if (selectedRows.size === paginatedData.length) {
            setSelectedRows(new Set());
            onSelectionChange?.([]);
        } else {
            const allIndices = paginatedData.map((_, index) => (currentPage - 1) * pageSize + index);
            setSelectedRows(new Set(allIndices));
            onSelectionChange?.(paginatedData);
        }
    };

    const handleSelectRow = (index: number) => {
        const globalIndex = (currentPage - 1) * pageSize + index;
        const newSelected = new Set(selectedRows);
        
        if (newSelected.has(globalIndex)) {
            newSelected.delete(globalIndex);
        } else {
            newSelected.add(globalIndex);
        }
        
        setSelectedRows(newSelected);
        
        const selectedData = Array.from(newSelected).map(i => sortedData[i]);
        onSelectionChange?.(selectedData);
    };

    return (
        <div className={`data-table ${className || ''}`}>
            {searchable && (
                <div className="table-controls">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            {selectable && (
                                <th className="checkbox-cell">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                            )}
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    className={col.sortable !== false ? 'sortable' : ''}
                                    onClick={() => col.sortable !== false && handleSort(col.key)}
                                >
                                    <div className="th-content">
                                        <span>{col.label}</span>
                                        {col.sortable !== false && sortConfig?.key === col.key && (
                                            sortConfig.direction === 'asc' ? 
                                                <ChevronUp size={16} /> : 
                                                <ChevronDown size={16} />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0)} className="no-data">
                                    Aucune donnée disponible
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, rowIndex) => {
                                const globalIndex = (currentPage - 1) * pageSize + rowIndex;
                                return (
                                    <tr
                                        key={rowIndex}
                                        className={selectedRows.has(globalIndex) ? 'selected' : ''}
                                    >
                                        {selectable && (
                                            <td className="checkbox-cell">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.has(globalIndex)}
                                                    onChange={() => handleSelectRow(rowIndex)}
                                                />
                                            </td>
                                        )}
                                        {columns.map(col => (
                                            <td key={col.key}>
                                                {col.render ? col.render(row[col.key], row) : row[col.key]}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        Précédent
                    </button>
                    
                    <div className="page-info">
                        Page {currentPage} sur {totalPages}
                    </div>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Suivant
                    </button>
                </div>
            )}

            <div className="table-footer">
                {sortedData.length} résultat{sortedData.length > 1 ? 's' : ''}
                {selectedRows.size > 0 && ` · ${selectedRows.size} sélectionné${selectedRows.size > 1 ? 's' : ''}`}
            </div>
        </div>
    );
}
