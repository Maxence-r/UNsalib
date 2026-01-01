import {
    cloneElement,
    isValidElement,
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
    type ReactElement,
    type TouchEvent,
} from "react";
import { create } from "zustand";

import "./Modal.css";
import { useDeviceType } from "../../utils/hooks/device.hook";

function windowHPercent(percentage: number) {
    return window.innerHeight * (percentage / 100);
}

function windowWPercent(percentage: number) {
    return window.innerWidth * (percentage / 100);
}

function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(val, max));
}

function getOpacity(coord: number, isMobile: boolean) {
    const p1 = { x: isMobile ? SNAP.MOBILE.OPEN : SNAP.DESKTOP.OPEN, y: 1 };
    const p2 = { x: isMobile ? SNAP.MOBILE.CLOSED : SNAP.DESKTOP.CLOSED, y: 0 };
    const a = (p2.y - p1.y) / (p2.x - p1.x);
    const b = p1.y - a * p1.x;
    return a * coord + b;
}

const SNAP = {
    MOBILE: {
        // y = 0 is at the top
        EXPANDED: 0,
        OPEN: windowHPercent(25),
        CLOSED: windowHPercent(100),
        CLOSE_THRESHOLD: windowHPercent(37.5),
        BOUNCE_THRESHOLD: windowHPercent(12.5),
    },
    DESKTOP: {
        // x = 0 is at the left
        OPEN: windowWPercent(100) - 500,
        CLOSED: windowWPercent(100),
        CLOSE_THRESHOLD: windowWPercent(100) - 300,
        BOUNCE_THRESHOLD: 200,
    },
};

const ANIMATION = {
    DURATION: 0.3,
    MIN_DURATION: 0.1,
    BORDER_RADIUS: 24,
    FUNCTION: "cubic-bezier(0.25, 1, 0.5, 1)",
};

const VELOCITY_THRESHOLD = 80;

function Modal({
    children,
    isOpen,
    close,
    depth,
}: {
    children: ReactNode;
    isOpen: boolean;
    close: () => void;
    depth: number;
}) {
    const sheetRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const [y, setY] = useState<number>(SNAP.MOBILE.CLOSED);
    const [x, setX] = useState<number>(SNAP.DESKTOP.CLOSED);
    const [transitionEnabled, setTransitionEnabled] = useState<boolean>(false);
    const [transitionDuration, setTransitionDuration] = useState(
        ANIMATION.DURATION,
    );
    const [scrimOpacity, setScrimOpacity] = useState(0);
    const [borderRadius, setBorderRadius] = useState(ANIMATION.BORDER_RADIUS);
    const [contentOverflow, setContentOverflow] = useState<"auto" | "hidden">(
        "hidden",
    );

    // Touch tracking
    const touchStart = useRef({ x: 0, y: 0 });
    const initialCoord = useRef({ x: x, y: y });
    const move = useRef({
        startX: 0,
        startY: 0,
        startTime: 0,
        up: true,
        left: true,
    });
    const distanceDelta = useRef(0);
    const timeDelta = useRef(0);
    const velocity = useRef(0);

    const isMobile = useDeviceType() === "mobile";

    const snapToState = useCallback(
        (
            state: "expanded" | "open" | "closed",
            duration = ANIMATION.DURATION,
        ) => {
            setTransitionEnabled(true);
            setTransitionDuration(duration);

            if (isMobile) {
                switch (state) {
                    case "expanded":
                        setY(SNAP.MOBILE.EXPANDED);
                        setBorderRadius(0);
                        setScrimOpacity(1);
                        setContentOverflow("auto");
                        break;
                    case "open":
                        setY(SNAP.MOBILE.OPEN);
                        setBorderRadius(ANIMATION.BORDER_RADIUS);
                        setScrimOpacity(1);
                        break;
                    case "closed":
                        setY(SNAP.MOBILE.CLOSED);
                        setBorderRadius(ANIMATION.BORDER_RADIUS);
                        setScrimOpacity(0);
                        break;
                }
            } else {
                switch (state) {
                    case "open":
                        setX(SNAP.DESKTOP.OPEN);
                        setScrimOpacity(1);
                        break;
                    case "closed":
                        setX(SNAP.DESKTOP.CLOSED);
                        setScrimOpacity(0);
                        break;
                }
            }
        },
        [isMobile],
    );

    const handleClose = useCallback(() => {
        snapToState("closed");
        if (isOpen) close();
    }, [close, isOpen, snapToState]);

    useEffect(() => {
        // Handle closing with the escape key
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                handleClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, handleClose]);

    const handleTouchStart = useCallback(
        (e: TouchEvent<HTMLDivElement>) => {
            // Initialize movement and position values
            touchStart.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            };
            initialCoord.current = { x: x, y: y };
            move.current = {
                startY: touchStart.current.y,
                startX: touchStart.current.x,
                startTime: performance.now(),
                up: true,
                left: true,
            };
            // Disable transitions to follow the user finger
            setTransitionEnabled(false);
        },
        [x, y],
    );

    const handleTouchMove = useCallback(
        (e: TouchEvent<HTMLDivElement>) => {
            // Do nothing when the user is scrolling the content
            if (!contentRef.current || contentRef.current.scrollTop !== 0)
                return;

            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            let delta = touchX - touchStart.current.x;
            let newCoord = initialCoord.current.x + delta;

            if (isMobile) {
                delta = touchY - touchStart.current.y;
                newCoord = initialCoord.current.y + delta;
            }

            if (
                (isMobile &&
                    ((newCoord > y && move.current.up) ||
                        (y > newCoord && !move.current.up))) ||
                (!isMobile &&
                    ((newCoord > x && move.current.left) ||
                        (x > newCoord && !move.current.left)))
            ) {
                // Move direction change
                move.current = {
                    startY: isMobile ? touchY : move.current.startY,
                    startX: isMobile ? move.current.startX : touchX,
                    startTime: performance.now(),
                    up: isMobile ? !move.current.up : move.current.up,
                    left: isMobile ? move.current.left : !move.current.left,
                };
            }

            if (isMobile && !move.current.up) {
                // Swipe down
                setContentOverflow("hidden");
            }

            // Velocity calculation
            distanceDelta.current = touchX - move.current.startX;
            if (isMobile) {
                distanceDelta.current = touchY - move.current.startY;
            }
            timeDelta.current =
                (performance.now() - move.current.startTime) / 1000;
            velocity.current = distanceDelta.current / timeDelta.current;

            if (isMobile) {
                // Update y and sheet shape
                const clampedY = clamp(newCoord, 0, SNAP.MOBILE.CLOSED);
                setY(clampedY);
                setBorderRadius(
                    clamp(
                        (ANIMATION.BORDER_RADIUS * clampedY) / SNAP.MOBILE.OPEN,
                        0,
                        ANIMATION.BORDER_RADIUS,
                    ),
                );
                if (clampedY > SNAP.MOBILE.OPEN) {
                    // Opacity can change only if transitionning from open to closed state
                    setScrimOpacity(clamp(getOpacity(clampedY, true), 0, 1));
                }
            } else {
                // Update x
                const clampedX = clamp(
                    newCoord,
                    SNAP.DESKTOP.OPEN,
                    SNAP.DESKTOP.CLOSED,
                );
                setX(clampedX);
                if (clampedX > SNAP.DESKTOP.OPEN) {
                    // Opacity can change only if transitionning from open to closed state
                    setScrimOpacity(clamp(getOpacity(clampedX, false), 0, 1));
                }
            }
        },
        [isMobile, x, y],
    );

    const handleTouchEnd = useCallback(() => {
        const duration = Math.max(timeDelta.current, ANIMATION.MIN_DURATION);

        if (isMobile && velocity.current < -VELOCITY_THRESHOLD) {
            // Swipe up on mobile
            snapToState("expanded", duration);
        } else if (
            velocity.current > VELOCITY_THRESHOLD &&
            // Prevent closing if the user click inside the modal (e.g. to input something)
            timeDelta.current > 0.08
        ) {
            // Swipe down on mobile / Swipe right on desktop
            snapToState("closed", duration);
            close();
        } else if (y < SNAP.MOBILE.BOUNCE_THRESHOLD) {
            snapToState("expanded");
        } else if (
            (y > SNAP.MOBILE.BOUNCE_THRESHOLD &&
                y < SNAP.MOBILE.CLOSE_THRESHOLD) ||
            x < SNAP.DESKTOP.CLOSE_THRESHOLD
        ) {
            snapToState("open");
        } else if (y > SNAP.MOBILE.CLOSE_THRESHOLD) {
            handleClose();
        }
    }, [isMobile, y, x, snapToState, close, handleClose]);

    useEffect(() => {
        // Handle external open state change
        const frameId = requestAnimationFrame(() => {
            if (!isOpen) {
                snapToState("closed");
            } else {
                snapToState("open");
            }
        });

        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [isOpen, snapToState]);

    return (
        <div
            className="modal"
            style={{ pointerEvents: isOpen ? "auto" : "none", zIndex: depth }}
        >
            <div
                className="scrim"
                style={{
                    opacity: scrimOpacity,
                    transition: transitionEnabled
                        ? `opacity ${transitionDuration}s ${ANIMATION.FUNCTION}`
                        : "none",
                }}
                onClick={handleClose}
            />
            <div
                ref={sheetRef}
                className="sheet"
                style={{
                    // Only translate is used on desktop with a constant width to avoid wrap effects
                    // On mobile, we adjust only the height
                    transform: isMobile
                        ? "none"
                        : `translateX(${x - SNAP.DESKTOP.OPEN}px)`,
                    height: isMobile ? windowHPercent(100) - y : "100%",
                    width: isMobile
                        ? "100%"
                        : windowWPercent(100) - SNAP.DESKTOP.OPEN,
                    borderRadius: isMobile
                        ? `${borderRadius}px ${borderRadius}px 0 0`
                        : "0px",
                    transition: transitionEnabled
                        ? `transform ${transitionDuration}s ${ANIMATION.FUNCTION}, ` +
                          `border-radius ${transitionDuration}s ${ANIMATION.FUNCTION}, ` +
                          `height ${transitionDuration}s ${ANIMATION.FUNCTION}, ` +
                          `width ${transitionDuration}s ${ANIMATION.FUNCTION}`
                        : "none",
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                tabIndex={-1}
            >
                {isMobile && <div className="handle" />}
                <div
                    ref={contentRef}
                    className="content"
                    style={{ overflowY: isMobile ? contentOverflow : "auto" }}
                >
                    {isValidElement(children)
                        ? cloneElement(
                              children as ReactElement<{ close?: () => void }>,
                              { close },
                          )
                        : children}
                </div>
            </div>
        </div>
    );
}

interface ModalStore {
    modals: { [id: string]: { contentRef: React.RefObject<ReactNode> } };
    openModals: string[];
    register: (id: string, contentRef: React.RefObject<ReactNode>) => void;
    unregister: (id: string) => void;
    open: (id: string) => void;
    close: (id: string) => void;
}

const useModalStore = create<ModalStore>()((set) => ({
    modals: {},
    openModals: [],

    register: (id, contentRef) =>
        set((state) => {
            if (Object.keys(state.modals).includes(id))
                console.warn(`Duplicate modal ids found: ${id}`);

            return {
                modals: { [id]: { contentRef }, ...state.modals },
            };
        }),
    unregister: (id) =>
        set((state) => {
            delete state.modals[id];
            return {
                modals: state.modals,
            };
        }),
    open: (id) => set((state) => ({ openModals: [id, ...state.openModals] })),
    close: (id) =>
        set((state) => ({
            openModals: state.openModals.filter((modalId) => modalId != id),
        })),
}));

function ModalProvider({ zIndex }: { zIndex: number }) {
    const modals = useModalStore((s) => s.modals);
    const openModals = useModalStore((s) => s.openModals);
    const close = useModalStore((s) => s.close);

    return (
        <div className="modals" style={{ zIndex: zIndex }}>
            {Object.keys(modals).map((id) => (
                <Modal
                    isOpen={openModals.includes(id)}
                    key={id}
                    close={() => close(id)}
                    depth={
                        openModals.length > 0
                            ? openModals.length - openModals.indexOf(id) + 1
                            : 0
                    }
                >
                    {modals[id].contentRef.current}
                </Modal>
            ))}
        </div>
    );
}

function useModal(id: string, content: ReactNode) {
    const register = useModalStore((s) => s.register);
    const unregister = useModalStore((s) => s.unregister);
    const open = useModalStore((s) => s.open);

    // Avoid loop re-renders when content use useModal
    const contentRef = useRef<ReactNode>(content);

    useEffect(() => {
        register(id, contentRef);

        return () => unregister(id);
    }, [id, register, unregister]);

    return { open: () => open(id) };
}

// eslint-disable-next-line react-refresh/only-export-components
export { ModalProvider, useModal };
