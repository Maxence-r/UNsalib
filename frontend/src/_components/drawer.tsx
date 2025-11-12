"use client";

import { ReactNode } from "react";
import { create } from "zustand";

import "./drawer.css";
import { pushToHistory, goBack } from "@/_utils/navigation-manager";

interface DrawerState {
    isOpen: boolean,
    content: ReactNode
};

const useDrawerStore = create<DrawerState>()(() => ({
    isOpen: false,
    content: <></>
}));

export function openDrawer() {
    pushToHistory("drawer", onlyCloseDrawer);
    useDrawerStore.setState(() => {
        return { isOpen: true };
    });
}

function onlyCloseDrawer() {
    useDrawerStore.setState(() => {
        return { isOpen: false };
    });
}

export function closeDrawer() {
    goBack();
}

export function setDrawerContent(newContent: ReactNode) {
    useDrawerStore.setState(() => {
        return { content: newContent };
    });
}

export default function Drawer() {
    const isDrawerOpen = useDrawerStore(state => state.isOpen);
    const drawerContent = useDrawerStore(state => state.content);

    return (
        <div
            tabIndex={-1}
            className={`drawer ${isDrawerOpen ? "active" : ""}`}
            onClick={(event) => {
                const target = event.target as HTMLInputElement;
                if (target.classList.contains("drawer")) {
                    closeDrawer();
                }
            }}
        >
            <div className="drawer-content">
                {drawerContent}
            </div>
        </div>
    );
}
