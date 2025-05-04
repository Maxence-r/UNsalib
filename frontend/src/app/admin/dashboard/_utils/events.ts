export function subscribe(eventName: string, listener: EventListenerOrEventListenerObject) {
    document.addEventListener(eventName, listener);
}

export function unsubscribe(eventName: string, listener: EventListenerOrEventListenerObject) {
    document.removeEventListener(eventName, listener);
}

export function publish(eventName: string) {
    const event = new CustomEvent(eventName);
    document.dispatchEvent(event);
}