"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, Save, X, Plus } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/_components/card";
import DataTable, { Column } from "@/_components/datatable";
import Button from "@/_components/button";
import { Modal } from "@/_components/modal";
import { ApiRoom, ApiCourse } from "../../_utils/types";
import { getRooms, getCourses, updateRoom, bulkUpdateRooms, bulkDeleteCourses } from "../../_utils/client-actions";
import "./manage.css";

type ManagementTab = 'rooms' | 'courses';

export default function ManagePage() {
    const [activeTab, setActiveTab] = useState<ManagementTab>('rooms');
    const [rooms, setRooms] = useState<ApiRoom[]>([]);
    const [courses, setCourses] = useState<ApiCourse[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [editingRoom, setEditingRoom] = useState<ApiRoom | null>(null);
    const [showModal, setShowModal] = useState(false);

    const fetchRooms = async () => {
        setLoading(true);
        const result = await getRooms();
        if (result.success) {
            setRooms(result.data);
        }
        setLoading(false);
    };

    const fetchCourses = async () => {
        setLoading(true);
        const result = await getCourses();
        if (result.success) {
            setCourses(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (activeTab === 'rooms') {
            fetchRooms();
        } else {
            fetchCourses();
        }
    }, [activeTab]);

    const handleBulkBan = async (banned: boolean) => {
        const roomIds = selectedItems.map(room => room.id);
        const result = await bulkUpdateRooms(roomIds, { banned });
        if (result.success) {
            fetchRooms();
            setSelectedItems([]);
        }
    };

    const handleBulkDeleteCourses = async () => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedItems.length} cours ?`)) {
            return;
        }
        const courseIds = selectedItems.map(course => course.id);
        const result = await bulkDeleteCourses(courseIds);
        if (result.success) {
            fetchCourses();
            setSelectedItems([]);
        }
    };

    const handleEditRoom = (room: ApiRoom) => {
        setEditingRoom(room);
        setShowModal(true);
    };

    const handleSaveRoom = async () => {
        if (!editingRoom) return;
        
        const { id, ...data } = editingRoom;
        const result = await updateRoom(id, data);
        if (result.success) {
            fetchRooms();
            setShowModal(false);
            setEditingRoom(null);
        }
    };

    const roomColumns: Column<ApiRoom>[] = [
        { key: 'name', label: 'Nom' },
        { key: 'building', label: 'Bâtiment' },
        { key: 'type', label: 'Type' },
        { 
            key: 'seats', 
            label: 'Places',
            render: (value) => value || 'N/A'
        },
        { 
            key: 'banned', 
            label: 'Statut',
            render: (value) => (
                <span className={`status-badge ${value ? 'banned' : 'active'}`}>
                    {value ? 'Banni' : 'Actif'}
                </span>
            )
        },
        {
            key: 'id',
            label: 'Actions',
            sortable: false,
            render: (_value, room) => (
                <div className="table-actions">
                    <button onClick={() => handleEditRoom(room)} className="action-btn edit">
                        <Edit size={16} />
                    </button>
                </div>
            )
        }
    ];

    const courseColumns: Column<ApiCourse>[] = [
        { 
            key: 'modules', 
            label: 'Module',
            render: (value) => value?.[0] || 'N/A'
        },
        { 
            key: 'start', 
            label: 'Début',
            render: (value) => new Date(value).toLocaleString('fr-FR')
        },
        { 
            key: 'end', 
            label: 'Fin',
            render: (value) => new Date(value).toLocaleString('fr-FR')
        },
        { 
            key: 'rooms', 
            label: 'Salles',
            render: (value) => value?.length || 0
        },
        { 
            key: 'teachers', 
            label: 'Enseignants',
            render: (value) => value?.length || 0
        },
        { 
            key: 'groups', 
            label: 'Groupes',
            render: (value) => value?.length || 0
        }
    ];

    return (
        <div className="main dashboard-manage">
            <div className="view">
                <h2 className="view-title">Gestion</h2>

                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'rooms' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rooms')}
                    >
                        Salles ({rooms.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
                        onClick={() => setActiveTab('courses')}
                    >
                        Cours ({courses.length})
                    </button>
                </div>

                <div className="view-content">
                    {activeTab === 'rooms' && (
                        <>
                            {selectedItems.length > 0 && (
                                <div className="bulk-actions">
                                    <span>{selectedItems.length} salle(s) sélectionnée(s)</span>
                                    <div className="actions">
                                        <Button onClick={() => handleBulkBan(true)}>
                                            Bannir
                                        </Button>
                                        <Button onClick={() => handleBulkBan(false)}>
                                            Activer
                                        </Button>
                                    </div>
                                </div>
                            )}
                            <Card>
                                <CardHeader>Liste des salles</CardHeader>
                                <CardContent>
                                    <DataTable
                                        data={rooms}
                                        columns={roomColumns}
                                        selectable
                                        searchable
                                        onSelectionChange={setSelectedItems}
                                    />
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {activeTab === 'courses' && (
                        <>
                            {selectedItems.length > 0 && (
                                <div className="bulk-actions">
                                    <span>{selectedItems.length} cours sélectionné(s)</span>
                                    <div className="actions">
                                        <Button onClick={handleBulkDeleteCourses}>
                                            <Trash2 size={16} />
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                            )}
                            <Card>
                                <CardHeader>Liste des cours</CardHeader>
                                <CardContent>
                                    <DataTable
                                        data={courses}
                                        columns={courseColumns}
                                        selectable
                                        searchable
                                        onSelectionChange={setSelectedItems}
                                        pageSize={20}
                                    />
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>

            {showModal && editingRoom && (
                <Modal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setEditingRoom(null);
                    }}
                    title="Modifier la salle"
                >
                    <div className="edit-form">
                        <div className="form-group">
                            <label>Nom</label>
                            <input
                                type="text"
                                value={editingRoom.name}
                                onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Alias</label>
                            <input
                                type="text"
                                value={editingRoom.alias || ''}
                                onChange={(e) => setEditingRoom({ ...editingRoom, alias: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Bâtiment</label>
                            <input
                                type="text"
                                value={editingRoom.building}
                                onChange={(e) => setEditingRoom({ ...editingRoom, building: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <input
                                type="text"
                                value={editingRoom.type}
                                onChange={(e) => setEditingRoom({ ...editingRoom, type: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Nombre de places</label>
                            <input
                                type="number"
                                value={editingRoom.seats || 0}
                                onChange={(e) => setEditingRoom({ ...editingRoom, seats: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="form-group checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={editingRoom.banned}
                                    onChange={(e) => setEditingRoom({ ...editingRoom, banned: e.target.checked })}
                                />
                                Salle bannie
                            </label>
                        </div>
                        <div className="form-actions">
                            <Button onClick={handleSaveRoom}>
                                <Save size={16} />
                                Enregistrer
                            </Button>
                            <Button onClick={() => {
                                setShowModal(false);
                                setEditingRoom(null);
                            }}>
                                <X size={16} />
                                Annuler
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
