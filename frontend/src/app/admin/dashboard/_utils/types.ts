export interface ApiUserAccount {
    icon: string,
    lastname: string,
    name: string,
    username: string
};

export interface ApiRoom {
    id: string;
    name: string;
    building: string;
    banned: boolean;
    type: string;
}

export interface ApiRoomDetails {
    id: string;
    name: string;
    alias: string;
    seats: number;
    building: string;
    boards: {
        black?: number;
        white?: number;
        display?: number;
    };
    type: string;
    features: string[];
    banned: boolean;
}

export interface ApiRoomUpdate {
    alias: string;
    seats: number;
    boards: {
        black: number;
        white: number;
        display: number;
    };
    features: string[];
    banned: boolean;
    type: string;
}