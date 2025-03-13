import "./ping.css";

export default function Ping({ error }: { error: boolean }) {
    return (
        <div className={`ping ${error ? "red" : "blue"}`}></div>
    );
}

Ping.defaultProps = { error: false };