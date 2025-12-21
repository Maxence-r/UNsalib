import {
    useRef,
    useState,
    useEffect,
    useCallback,
    useEffectEvent,
} from "react";
import type { ReactNode } from "react";

import "../../utils/theme.css";
import "./Modal.css";

// Constants
const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 0.6;
const MIN_HEIGHT = 75;
const MAX_HEIGHT = 100;
const SNAP_THRESHOLD = 15;
const MAX_BORDER_RADIUS = 24;
const MIN_ANIMATION_DURATION = 150;
const MAX_ANIMATION_DURATION = 400;
const HEIGHT_RANGE = MAX_HEIGHT - MIN_HEIGHT;
const RUBBER_BAND_FACTOR = 0.2;
const MOBILE_QUERY = "(max-width: 1024px)";

function calculateAnimationDuration(
    velocity: number,
    remainingDistance: number,
): number {
    if (velocity > 0.1) {
        return Math.max(
            MIN_ANIMATION_DURATION,
            Math.min(MAX_ANIMATION_DURATION, remainingDistance / velocity),
        );
    }
    return MAX_ANIMATION_DURATION;
}

function calculateBorderRadius(heightPercent: number): number {
    const progress = (heightPercent - MIN_HEIGHT) / HEIGHT_RANGE;
    return MAX_BORDER_RADIUS * (1 - progress);
}

function getTransitionStyle(duration: number): string {
    return `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), 
        height ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), 
        max-height ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), 
        border-radius ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
}

function Modal({
    isOpen,
    close,
    children,
}: {
    isOpen: boolean;
    close: () => void;
    children: ReactNode;
}) {
    const windowRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const dragState = useRef({
        startY: 0,
        currentY: 0,
        lastTranslateY: 0,
        startTime: 0,
        isDraggingContent: false,
    });
    const rafId = useRef<number | null>(null);

    const [dragging, setDragging] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const isMobile = window.matchMedia(MOBILE_QUERY).matches;

    // Memoized helper to apply styles
    const applyStyles = useCallback(
        (height: number, translateY = 0) => {
            const win = windowRef.current;
            if (!win) return;
            win.style.height = `${height}%`;
            win.style.maxHeight = `${height}%`;
            win.style.transform = `translateY(${translateY}px)`;
            if (isMobile) {
                const radius = calculateBorderRadius(height);
                win.style.borderRadius = `${radius}px ${radius}px 0 0`;
            }
        },
        [isMobile],
    );

    // Cleanup RAF on unmount
    useEffect(() => {
        return () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, []);

    // Reset state when modal closes
    const updateIsExpanded = useEffectEvent(() => setIsExpanded(false));
    useEffect(() => {
        if (!isOpen) {
            updateIsExpanded();
            const win = windowRef.current;
            if (win) {
                win.style.removeProperty("height");
                win.style.removeProperty("max-height");
                win.style.removeProperty("transform");
                win.style.removeProperty("borderRadius");
            }
        }
    }, [isOpen]);

    // Common function to handle drag end logic
    const finalizeDrag = useCallback(
        (isFromContent = false) => {
            const win = windowRef.current;
            const state = dragState.current;

            if (!win || (isFromContent && !state.isDraggingContent)) {
                state.isDraggingContent = false;
                return;
            }

            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
                rafId.current = null;
            }

            if (!isFromContent) setDragging(false);
            state.isDraggingContent = false;

            const duration = performance.now() - state.startTime;
            const velocity = Math.abs(state.lastTranslateY) / duration;
            const diff = state.lastTranslateY;
            const winHeight = window.innerHeight;
            const animationDuration = calculateAnimationDuration(
                velocity,
                winHeight - diff,
            );

            win.style.transition = getTransitionStyle(animationDuration);

            const shouldClose =
                diff > CLOSE_DISTANCE || velocity > CLOSE_VELOCITY;
            const snapDistance = SNAP_THRESHOLD * (winHeight / 100);

            const resetAfterAnimation = (timeout = 300) => {
                setTimeout(
                    () => win.style.removeProperty("transition"),
                    timeout,
                );
            };

            const closeModal = () => {
                win.style.transform = "translateY(100%)";
                setTimeout(() => {
                    win.style.removeProperty("transform");
                    win.style.removeProperty("transition");
                    win.style.removeProperty("height");
                    win.style.removeProperty("max-height");
                    win.style.removeProperty("borderRadius");
                    setIsExpanded(false);
                    close();
                }, animationDuration);
            };

            if (isExpanded) {
                const shouldCollapse = diff > snapDistance;
                if (shouldClose) {
                    closeModal();
                } else if (shouldCollapse) {
                    applyStyles(MIN_HEIGHT);
                    setIsExpanded(false);
                    resetAfterAnimation();
                } else {
                    applyStyles(MAX_HEIGHT);
                    resetAfterAnimation();
                }
            } else {
                if (diff > 0) {
                    if (shouldClose) {
                        win.style.transform = "translateY(100%)";
                        setTimeout(() => {
                            win.style.removeProperty("transform");
                            win.style.removeProperty("transition");
                            close();
                        }, animationDuration);
                    } else {
                        win.style.transform = "translateY(0)";
                        resetAfterAnimation();
                    }
                } else {
                    const dragDistance = Math.abs(diff);
                    if (
                        dragDistance > snapDistance ||
                        velocity > CLOSE_VELOCITY
                    ) {
                        applyStyles(MAX_HEIGHT);
                        setIsExpanded(true);
                    } else {
                        applyStyles(MIN_HEIGHT);
                    }
                    win.style.transform = "translateY(0)";
                    resetAfterAnimation();
                }
            }

            state.startY = 0;
            state.currentY = 0;
        },
        [isExpanded, close, applyStyles],
    );

    // Common drag move logic
    const handleDragMove = useCallback(
        (diff: number) => {
            const win = windowRef.current;
            if (!win) return;

            const winHeight = window.innerHeight;
            const state = dragState.current;
            state.lastTranslateY = diff;

            if (isExpanded) {
                if (diff > 0) {
                    const newHeightPx = winHeight - diff;
                    const minHeightPx = (winHeight * MIN_HEIGHT) / 100;

                    if (newHeightPx >= minHeightPx) {
                        applyStyles((newHeightPx / winHeight) * 100);
                    } else {
                        const translateY =
                            diff - (winHeight * HEIGHT_RANGE) / 100;
                        applyStyles(MIN_HEIGHT, Math.max(0, translateY));
                    }
                }
            } else {
                if (diff > 0) {
                    win.style.transform = `translateY(${diff}px)`;
                } else {
                    const currentHeightPx = (winHeight * MIN_HEIGHT) / 100;
                    const maxHeightPx = (winHeight * MAX_HEIGHT) / 100;
                    const rawNewHeightPx = currentHeightPx - diff;

                    const newHeightPx =
                        rawNewHeightPx > maxHeightPx
                            ? maxHeightPx +
                              (rawNewHeightPx - maxHeightPx) *
                                  RUBBER_BAND_FACTOR
                            : rawNewHeightPx;
                    const clampedPercent =
                        (Math.min(maxHeightPx, newHeightPx) / winHeight) * 100;
                    applyStyles(clampedPercent);
                }
            }
        },
        [isExpanded, applyStyles],
    );

    // Handle touch handlers
    const onHandleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            if (!isMobile || !windowRef.current) return;

            e.stopPropagation();
            const state = dragState.current;
            state.startY = e.touches[0].clientY;
            state.startTime = performance.now();
            state.lastTranslateY = 0;
            windowRef.current.style.transition = "none";
            setDragging(true);
        },
        [isMobile],
    );

    const onHandleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (!dragging || !windowRef.current) return;

            e.stopPropagation();

            const state = dragState.current;
            state.currentY = e.touches[0].clientY;
            const diff = state.currentY - state.startY;

            if (rafId.current !== null) return;

            rafId.current = requestAnimationFrame(() => {
                handleDragMove(diff);
                rafId.current = null;
            });
        },
        [dragging, handleDragMove],
    );

    const onHandleTouchEnd = useCallback(
        () => finalizeDrag(false),
        [finalizeDrag],
    );

    // Content touch handlers
    const onContentTouchStart = useCallback(
        (e: React.TouchEvent) => {
            if (!isMobile || !windowRef.current) return;

            const state = dragState.current;
            state.startY = e.touches[0].clientY;
            state.startTime = performance.now();
            state.lastTranslateY = 0;

            if (
                isExpanded &&
                contentRef.current &&
                contentRef.current.scrollTop > 0
            ) {
                state.isDraggingContent = false;
                return;
            }

            if (!isExpanded) {
                state.isDraggingContent = true;
            }
        },
        [isMobile, isExpanded],
    );

    const onContentTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (!isMobile || !windowRef.current) return;

            const state = dragState.current;
            const diff = e.touches[0].clientY - state.startY;

            if (isExpanded && contentRef.current) {
                const isAtTop = contentRef.current.scrollTop <= 0;

                if (isAtTop && diff > 0 && !state.isDraggingContent) {
                    state.startY = e.touches[0].clientY;
                    state.startTime = performance.now();
                    state.lastTranslateY = 0;
                    state.isDraggingContent = true;
                    windowRef.current.style.transition = "none";
                }

                if (!state.isDraggingContent) return;

                if (diff < 0 && state.isDraggingContent) {
                    state.isDraggingContent = false;
                    windowRef.current.style.transition = "";
                    return;
                }
            }

            if (!isExpanded) {
                if (!state.isDraggingContent) return;
                windowRef.current.style.transition = "none";
            }

            state.currentY = e.touches[0].clientY;
            const currentDiff = state.currentY - state.startY;

            if (rafId.current !== null) return;

            rafId.current = requestAnimationFrame(() => {
                handleDragMove(currentDiff);
                rafId.current = null;
            });
        },
        [isMobile, isExpanded, handleDragMove],
    );

    const onContentTouchEnd = useCallback(
        () => finalizeDrag(true),
        [finalizeDrag],
    );

    const handleScrimClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if ((e.target as HTMLElement).classList.contains("scrim")) {
            close();
        }
    };

    return (
        <div
            tabIndex={-1}
            className={`modal${isOpen ? " open" : ""}${isExpanded ? " expanded" : ""}`}
        >
            <div className="scrim" onClick={handleScrimClick} />

            <div
                ref={windowRef}
                className={`window${isExpanded ? " expanded" : ""}`}
            >
                {isMobile && (
                    <div
                        className="handle-container"
                        onTouchStart={onHandleTouchStart}
                        onTouchMove={onHandleTouchMove}
                        onTouchEnd={onHandleTouchEnd}
                    >
                        <div className="handle" />
                    </div>
                )}
                <div
                    ref={contentRef}
                    className={`window-content${isExpanded ? " scrollable" : ""}`}
                    onTouchStart={onContentTouchStart}
                    onTouchMove={onContentTouchMove}
                    onTouchEnd={onContentTouchEnd}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

export { Modal };
