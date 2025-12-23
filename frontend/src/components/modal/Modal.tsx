import {
    useCallback,
    useEffect,
    useEffectEvent,
    useRef,
    useState,
    type JSX,
    type TouchEvent,
} from "react";

import "./Modal.css";

function windowPercent(percentage: number) {
    return window.innerHeight * (percentage / 100);
}

function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(val, max));
}

function Modal({
    children,
    isOpen,
    close,
}: {
    children: JSX.Element;
    isOpen: boolean;
    close: () => void;
}) {
    // Bottom sheet elements
    const modal = useRef<null | HTMLDivElement>(null);
    const scrim = useRef<null | HTMLDivElement>(null);
    const sheet = useRef<null | HTMLDivElement>(null);
    const contentContainer = useRef<null | HTMLDivElement>(null);

    const [y, setY] = useState<number>(
        isOpen ? windowPercent(25) : windowPercent(100),
    );
    const [sheetRadius, setSheetRadius] = useState<number>(24);
    const [sheetOverflow, setSheetOverflow] = useState<"auto" | "hidden">(
        "hidden",
    );
    const [scrimOpacity, setScrimOpacity] = useState<number>(isOpen ? 1 : 0);

    const yMove = useRef({
        start: 0,
        startTime: 0,
        up: true,
    });

    const touchStartY = useRef<number>(0);

    const initialY = useRef<number>(y);
    const distanceDelta = useRef<number>(0);
    const timeDelta = useRef<number>(0);
    const velocity = useRef<number>(0);
    const isScrolling = useRef<boolean>(false);

    const removeTransitions = () => {
        if (!sheet.current || !scrim.current) return;
        sheet.current.style.transition = "none";
        scrim.current.style.transition = "none";
    };

    const setTransitions = (duration: number) => {
        if (!sheet.current || !scrim.current) return;
        sheet.current.style.transition = `top ${duration}s, border-radius ${duration}s, height ${duration}s`;
        scrim.current.style.transition = `opacity ${duration}s`;
    };

    const handleManualClose = useCallback(() => {
        setTransitions(0.3);
        setScrimOpacity(0);
        setSheetRadius(24);
        setY(windowPercent(100));
        if (isOpen) close();
    }, [close, isOpen]);

    const handleManualMiddleSnap = useCallback(() => {
        setTransitions(0.3);
        setScrimOpacity(1);
        setSheetRadius(24);
        setY(windowPercent(25));
    }, []);

    const handleManualTopSnap = () => {
        setTransitions(0.3);
        setY(windowPercent(0));
        setSheetRadius(0);
    };

    const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
        if (!sheet.current || !scrim.current || !contentContainer.current)
            return;

        // Init values
        touchStartY.current = e.touches[0].clientY;
        initialY.current = y;
        yMove.current.startTime = performance.now();
        yMove.current.start = touchStartY.current;
        removeTransitions();
    };

    const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
        if (
            contentContainer.current &&
            contentContainer.current.scrollTop === 0
        ) {
            isScrolling.current = false;

            const touchY = e.touches[0].clientY;
            const delta = touchY - touchStartY.current;
            const newY = initialY.current + delta;

            if (
                (newY > y && yMove.current.up) ||
                (y > newY && !yMove.current.up)
            ) {
                // Move direction change
                yMove.current.up = !yMove.current.up;
                yMove.current.start = touchY;
                yMove.current.startTime = performance.now();
            }

            if (!yMove.current.up) {
                // Swipe down, disable scroll
                setSheetOverflow("hidden");
            }

            distanceDelta.current = touchY - yMove.current.start;
            timeDelta.current =
                (performance.now() - yMove.current.startTime) / 1000;
            velocity.current = distanceDelta.current / timeDelta.current; // px/s

            setY(clamp(newY, 0, windowPercent(100)));
            setSheetRadius(clamp((24 * y) / windowPercent(25), 0, 24));
            if (y > windowPercent(25)) {
                setScrimOpacity(
                    1 - clamp((1 / windowPercent(75)) * newY - 1 / 3, 0, 1),
                );
            }
        } else if (contentContainer.current && sheetOverflow === "auto") {
            isScrolling.current = true;
        }
    };

    const handleTouchEnd = () => {
        if (!contentContainer.current) return;

        // If the transition duration is too small, we set it to 0.1s to avoid a brutal animation
        const transitionDuration = Math.max(timeDelta.current, 0.1);
        if (velocity.current < -100) {
            // Swipe up
            setTransitions(transitionDuration);
            setY(0);
            setSheetRadius(0);
            setSheetOverflow("auto");
        } else if (velocity.current > 100) {
            // Swipe down
            setTransitions(transitionDuration);
            setY(windowPercent(100));
            setSheetRadius(24);
            setScrimOpacity(0);
            close();
        } else if (y < windowPercent(12.5)) {
            // Bounce effect near the top
            handleManualTopSnap();
        } else if (y > windowPercent(12.5) && y < windowPercent(60)) {
            // Bounce effect around the middle snap
            handleManualMiddleSnap();
        } else if (y > windowPercent(60)) {
            // The sheet is near the bottom
            handleManualClose();
        }
    };

    const triggerClose = useEffectEvent(handleManualClose);
    const triggerOpen = useEffectEvent(handleManualMiddleSnap);
    useEffect(() => {
        if (!isOpen && y < windowPercent(100)) {
            // Should close
            triggerClose();
        } else if (isOpen && y == windowPercent(100)) {
            // Should open
            triggerOpen();
        }
    }, [handleManualClose, handleManualMiddleSnap, isOpen, y]);

    return (
        <div
            ref={modal}
            className="modal"
            style={{ pointerEvents: isOpen ? "auto" : "none" }}
        >
            <div
                className="scrim"
                style={{ opacity: scrimOpacity }}
                ref={scrim}
                onClick={handleManualClose}
            />
            <div
                className="sheet"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                ref={sheet}
                style={{
                    top: y,
                    height: windowPercent(100) - y,
                    borderRadius: `${sheetRadius}px ${sheetRadius}px 0 0`,
                }}
            >
                <div className="handle" />
                <div
                    ref={contentContainer}
                    className="content-container"
                    style={{ overflowY: sheetOverflow }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

export { Modal };
