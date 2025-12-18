import { useRef, useState } from "react";
import type { ReactNode } from "react";

import "../../utils/theme.css";
import "./Modal.css";

function Modal({
    isOpen,
    setIsOpen,
    children,
}: {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    children: ReactNode;
}) {
    const startY = useRef(0);
    const currentY = useRef(0);
    const windowRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState(false);
    const rafId = useRef<number | null>(null);
    const lastTranslateY = useRef(0);
    const startTime = useRef(0);

    // const isMobile = window.matchMedia("(max-width: 1024px)").matches;

    const CLOSE_DISTANCE = 120;
    const CLOSE_VELOCITY = 0.6;
    const CLOSE_ANIMATION_DURATION = 300;

    const onTouchStart = (e: React.TouchEvent) => {
        if (window.innerWidth > 1024) return;

        startY.current = e.touches[0].clientY;
        startTime.current = performance.now();
        lastTranslateY.current = 0;

        if (windowRef.current) {
            windowRef.current.style.transition = "none";
        }

        setDragging(true);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!dragging || !windowRef.current) return;

        currentY.current = e.touches[0].clientY;
        const diff = Math.max(0, currentY.current - startY.current);

        if (rafId.current !== null) return;

        rafId.current = requestAnimationFrame(() => {
            if (!windowRef.current) return;

            lastTranslateY.current = diff;
            windowRef.current.style.transform = `translateY(${diff}px)`;
            rafId.current = null;
        });
    };

    const onTouchEnd = () => {
        if (!windowRef.current) return;

        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
        }

        setDragging(false);

        const duration = performance.now() - startTime.current;
        const velocity = lastTranslateY.current / duration;

        const shouldClose =
            lastTranslateY.current > CLOSE_DISTANCE ||
            velocity > CLOSE_VELOCITY;

        if (shouldClose) {
            windowRef.current.style.transition =
                "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
            windowRef.current.style.transform = "translateY(100%)";

            setTimeout(() => {
                windowRef.current?.style.removeProperty("transform");
                windowRef.current?.style.removeProperty("transition");
                setIsOpen(false);
            }, CLOSE_ANIMATION_DURATION);
        } else {
            windowRef.current.style.transition =
                "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)";
            windowRef.current.style.transform = "translateY(0)";

            setTimeout(() => {
                windowRef.current?.style.removeProperty("transition");
            }, 250);
        }

        startY.current = 0;
        currentY.current = 0;
    };

    return (
        <div tabIndex={-1} className={`modal ${isOpen ? "open" : ""}`}>
            <div
                className="scrim"
                onClick={(event) => {
                    event.stopPropagation();
                    const target = event.target as HTMLElement;
                    if (target.classList.contains("scrim")) {
                        setIsOpen(false);
                    }
                }}
            />

            <div
                ref={windowRef}
                className="window"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div className="handle" />
                {children}
            </div>
        </div>
    );
}

export { Modal };
