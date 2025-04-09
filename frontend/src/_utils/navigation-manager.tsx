"use client";

import { ReactNode, useEffect } from "react";
import { create } from "zustand";

interface HistoryState {
    stack: { id: string, backFunction: () => void }[]
};

const useHistoryStore = create<HistoryState>()(() => ({
    stack: []
}));

function unstackHistory() {
    useHistoryStore.setState(state => {
        const newStack = state.stack;
        newStack.pop();
        return { stack: newStack };
    });
}

export function pushToHistory(id: string, backFunction: () => void) {
    window.history.pushState({ id: id }, "");
    useHistoryStore.setState(state => {
        const newStack = state.stack;
        newStack.push({id: id, backFunction: backFunction});
        return { stack: newStack };
    });
}

export function goBack() {
    window.history.back();
}

export default function NavigationManager({ children }: { children: ReactNode }) {
    const stack = useHistoryStore(state => state.stack);

    useEffect(() => {
        const handlePopState = () => {
            stack[stack.length-1].backFunction();
            unstackHistory();
        };

        window.addEventListener("popstate", handlePopState);
        return () => {
            window.removeEventListener("popstate", handlePopState);
        }
    }, []);

    return <>{children}</>;
}