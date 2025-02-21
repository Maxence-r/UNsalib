import "./toast.css";

export default function Toast({ message, error, show }: { message: string, error: boolean, show: boolean }) {
    return (
        <div className={`notif ${show ? "active" : ""}`} style={{ backgroundColor: error ? "red" : "green" }}>
            <p>{message}</p>
        </div>
    )
}

Toast.defaultProps = { message: "", error: false, show: false };