"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, Ban, CheckCircle } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/_components/card";
import Button from "@/_components/button";
import Input from "@/_components/input";
import { showToast, setToastMessage } from "@/_components/toast";
import {
    getRooms,
    getRoom,
    updateRoom,
    batchUpdateRooms,
} from "../../_utils/client-actions";
import { ApiRoom, ApiRoomDetails, ApiRoomUpdate } from "../../_utils/types";

export default function ManagePage() {
    const [rooms, setRooms] = useState<ApiRoom[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<ApiRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ApiRoomDetails | null>(null);
    const [selectedRoomIds, setSelectedRoomIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showBanned, setShowBanned] = useState<boolean>(true);
    const [showOnlyNoType, setShowOnlyNoType] = useState<boolean>(false);

    // Form state
    const [alias, setAlias] = useState<string>("");
    const [seats, setSeats] = useState<number>(0);
    const [banned, setBanned] = useState<boolean>(false);
    const [boardBlack, setBoardBlack] = useState<number>(0);
    const [boardWhite, setBoardWhite] = useState<number>(0);
    const [boardDisplay, setBoardDisplay] = useState<number>(0);
    const [features, setFeatures] = useState<string[]>([]);
    const [featureInput, setFeatureInput] = useState<string>("");
    const [roomType, setRoomType] = useState<string>("");

    const selectRoom = useCallback(async (roomId: string) => {
        try {
            const roomDetails = await getRoom(roomId);
            setSelectedRoom(roomDetails);
            
            // Update form state
            setAlias(roomDetails.alias || "");
            setSeats(roomDetails.seats || 0);
            setBanned(roomDetails.banned || false);
            setBoardBlack(roomDetails.boards.black || 0);
            setBoardWhite(roomDetails.boards.white || 0);
            setBoardDisplay(roomDetails.boards.display || 0);
            setFeatures(roomDetails.features || []);
            setRoomType(roomDetails.type || "");
        } catch (error) {
            console.error("Error fetching room details:", error);
            setToastMessage("Erreur lors du chargement des détails de la salle", true);
            showToast();
        }
    }, []);

    const fetchRooms = useCallback(async () => {
        try {
            const roomsData = await getRooms();
            setRooms(roomsData);
            if (roomsData.length > 0 && !selectedRoom) {
                await selectRoom(roomsData[0].id);
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
            setToastMessage("Erreur lors du chargement des salles", true);
            showToast();
        }
    }, [selectedRoom, selectRoom]);

    const filterRooms = useCallback(() => {
        let filtered = [...rooms];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\s]/g, "");
            filtered = filtered.filter(
                (room) =>
                    room.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\s]/g, "").includes(query) ||
                    room.building.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\s]/g, "").includes(query)
            );
        }

        // Apply banned filter
        if (!showBanned) {
            filtered = filtered.filter((room) => !room.banned);
        }

        // Apply type filter
        if (showOnlyNoType) {
            filtered = filtered.filter((room) => !room.type || room.type === "");
        }

        setFilteredRooms(filtered);
    }, [rooms, searchQuery, showBanned, showOnlyNoType]);

    useEffect(() => {
        fetchRooms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        filterRooms();
    }, [filterRooms]);

    const handleRoomClick = (roomId: string) => {
        if (selectedRoom?.id !== roomId) {
            selectRoom(roomId);
            setSelectedRoomIds(new Set()); // Clear selection when switching rooms
        }
    };

    const handleCheckboxChange = (roomId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        const newSelection = new Set(selectedRoomIds);
        if (event.target.checked) {
            newSelection.add(roomId);
        } else {
            newSelection.delete(roomId);
        }
        setSelectedRoomIds(newSelection);
    };

    const handleAddFeature = () => {
        if (featureInput.trim() && !features.includes(featureInput.trim())) {
            setFeatures([...features, featureInput.trim()]);
            setFeatureInput("");
        } else if (features.includes(featureInput.trim())) {
            setToastMessage("Cette caractéristique existe déjà", true);
            showToast();
        }
    };

    const handleRemoveFeature = (featureToRemove: string) => {
        setFeatures(features.filter((f) => f !== featureToRemove));
    };

    const handleSave = async () => {
        if (!selectedRoom) return;

        const data: ApiRoomUpdate = {
            alias,
            seats,
            boards: {
                black: boardBlack,
                white: boardWhite,
                display: boardDisplay,
            },
            features,
            banned,
            type: roomType,
        };

        try {
            const result = await updateRoom(selectedRoom.id, data);
            if (result.success) {
                setToastMessage("Les informations ont été mises à jour avec succès", false);
                showToast();
                await fetchRooms(); // Refresh the list
                await selectRoom(selectedRoom.id); // Refresh current room
            } else {
                setToastMessage(`Erreur lors de la mise à jour : ${result.error}`, true);
                showToast();
            }
        } catch (error) {
            console.error("Error updating room:", error);
            setToastMessage("Erreur lors de la mise à jour des informations", true);
            showToast();
        }
    };

    const handleBatchBan = async (shouldBan: boolean) => {
        if (selectedRoomIds.size === 0) return;

        try {
            const result = await batchUpdateRooms(
                Array.from(selectedRoomIds),
                { banned: shouldBan } as Partial<ApiRoomUpdate>
            );
            if (result.success) {
                setToastMessage(
                    `${selectedRoomIds.size} salle(s) ${shouldBan ? "bannie(s)" : "débannie(s)"} avec succès`,
                    false
                );
                showToast();
                setSelectedRoomIds(new Set());
                await fetchRooms();
                if (selectedRoom) {
                    await selectRoom(selectedRoom.id);
                }
            } else {
                setToastMessage(`Erreur lors de la mise à jour : ${result.error}`, true);
                showToast();
            }
        } catch (error) {
            console.error("Error batch updating rooms:", error);
            setToastMessage("Erreur lors de la mise à jour des salles", true);
            showToast();
        }
    };

    return (
        <div className="main dashboard-manage">
            <div className="view">
                <div className="view-title">
                    <h2>Gestion des salles</h2>
                    {selectedRoomIds.size > 0 && (
                        <div className="batch-actions">
                            <span className="selected-count">
                                {selectedRoomIds.size} sélectionnée(s)
                            </span>
                            <Button
                                withIcon
                                icon={<Ban size={16} />}
                                onClick={() => handleBatchBan(true)}
                            >
                                Bannir
                            </Button>
                            <Button
                                withIcon
                                icon={<CheckCircle size={16} />}
                                onClick={() => handleBatchBan(false)}
                            >
                                Débannir
                            </Button>
                        </div>
                    )}
                </div>
                <div className="view-content">
                    {/* Left Panel - Rooms List */}
                    <div className="rooms-panel">
                        <Card>
                            <CardHeader>Liste des salles</CardHeader>
                            <CardContent>
                                <div className="search-container">
                                    <Input
                                        type="text"
                                        placeholder="Filtrer par salle, bâtiment"
                                        value={searchQuery}
                                        onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                                    />
                                    <div className="search-filters">
                                        <label className="filter-option">
                                            <input
                                                type="checkbox"
                                                checked={showBanned}
                                                onChange={(e) => setShowBanned(e.target.checked)}
                                            />
                                            Afficher les salles bannies
                                        </label>
                                        <label className="filter-option">
                                            <input
                                                type="checkbox"
                                                checked={showOnlyNoType}
                                                onChange={(e) => setShowOnlyNoType(e.target.checked)}
                                            />
                                            Afficher uniquement les salles sans type
                                        </label>
                                    </div>
                                </div>
                                <div className="rooms-list-container">
                                    {filteredRooms.length === 0 ? (
                                        <span className="no-result">Aucun résultat.</span>
                                    ) : (
                                        filteredRooms.map((room) => (
                                            <div
                                                key={room.id}
                                                className={`room-item ${
                                                    selectedRoom?.id === room.id ? "selected" : ""
                                                }`}
                                                onClick={() => handleRoomClick(room.id)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="room-checkbox"
                                                    checked={selectedRoomIds.has(room.id)}
                                                    onChange={(e) => handleCheckboxChange(room.id, e)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <div className="room-info">
                                                    <span className="room-name">{room.name}</span>
                                                    <span className="room-building">{room.building}</span>
                                                </div>
                                                <div className="room-badges">
                                                    {room.banned && (
                                                        <span className="room-badge">Bannie</span>
                                                    )}
                                                    {!room.type && (
                                                        <span className="room-badge">Sans type</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel - Room Editor */}
                    <div className="editor-panel">
                        <Card>
                            <CardHeader>
                                {selectedRoom ? `Éditer ${selectedRoom.name}` : "Éditer la salle"}
                            </CardHeader>
                            <CardContent>
                                {selectedRoom ? (
                                    <div className="editor-content">
                                        <div className="editor-section">
                                            <h4>Informations générales</h4>
                                            <div className="editor-section-content">
                                                <div className="editor-field">
                                                    <label>ID</label>
                                                    <span>{selectedRoom.id}</span>
                                                </div>
                                                <div className="editor-field">
                                                    <label>Nom</label>
                                                    <span>{selectedRoom.name}</span>
                                                </div>
                                                <div className="editor-field">
                                                    <label>Bâtiment</label>
                                                    <span>{selectedRoom.building}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="editor-section">
                                            <h4>Configuration</h4>
                                            <div className="editor-section-content">
                                                <div className="editor-field">
                                                    <label htmlFor="alias">Alias</label>
                                                    <input
                                                        id="alias"
                                                        type="text"
                                                        value={alias}
                                                        onChange={(e) => setAlias(e.target.value)}
                                                    />
                                                </div>
                                                <div className="editor-field">
                                                    <label htmlFor="seats">Places assises</label>
                                                    <input
                                                        id="seats"
                                                        type="number"
                                                        value={seats}
                                                        onChange={(e) => setSeats(Number(e.target.value))}
                                                    />
                                                </div>
                                                <div className="editor-field">
                                                    <label htmlFor="type">Type</label>
                                                    <select
                                                        id="type"
                                                        value={roomType}
                                                        onChange={(e) => setRoomType(e.target.value)}
                                                    >
                                                        <option value="">Non défini</option>
                                                        <option value="TP">TP</option>
                                                        <option value="TD">TD</option>
                                                        <option value="INFO">INFO</option>
                                                        <option value="AMPHI">AMPHI</option>
                                                    </select>
                                                </div>
                                                <div className="editor-field">
                                                    <label htmlFor="banned">
                                                        <input
                                                            id="banned"
                                                            type="checkbox"
                                                            checked={banned}
                                                            onChange={(e) => setBanned(e.target.checked)}
                                                        />
                                                        Salle bannie
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="editor-section">
                                            <h4>Tableaux</h4>
                                            <div className="boards-grid">
                                                <div className="board-field">
                                                    <label htmlFor="board-black">Noir</label>
                                                    <input
                                                        id="board-black"
                                                        type="number"
                                                        value={boardBlack}
                                                        onChange={(e) => setBoardBlack(Number(e.target.value))}
                                                    />
                                                </div>
                                                <div className="board-field">
                                                    <label htmlFor="board-white">Blanc</label>
                                                    <input
                                                        id="board-white"
                                                        type="number"
                                                        value={boardWhite}
                                                        onChange={(e) => setBoardWhite(Number(e.target.value))}
                                                    />
                                                </div>
                                                <div className="board-field">
                                                    <label htmlFor="board-display">Écran</label>
                                                    <input
                                                        id="board-display"
                                                        type="number"
                                                        value={boardDisplay}
                                                        onChange={(e) => setBoardDisplay(Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="editor-section">
                                            <h4>Caractéristiques</h4>
                                            <div className="editor-section-content">
                                                <div className="features-input">
                                                    <input
                                                        type="text"
                                                        placeholder="Ajouter une caractéristique"
                                                        value={featureInput}
                                                        onChange={(e) => setFeatureInput(e.target.value)}
                                                        onKeyPress={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                handleAddFeature();
                                                            }
                                                        }}
                                                    />
                                                    <Button onClick={handleAddFeature}>Ajouter</Button>
                                                </div>
                                                <div className="chips-container">
                                                    {features.map((feature) => (
                                                        <div key={feature} className="chip">
                                                            <span>{feature}</span>
                                                            <span
                                                                className="chip-remove"
                                                                onClick={() => handleRemoveFeature(feature)}
                                                            >
                                                                ×
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="editor-actions">
                                            <Button
                                                withIcon
                                                icon={<Save size={16} />}
                                                onClick={handleSave}
                                            >
                                                Enregistrer les modifications
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p>Sélectionnez une salle pour l&apos;éditer</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
