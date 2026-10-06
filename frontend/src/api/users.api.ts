import { api } from "./axios";

async function sendNotABot(): Promise<void> {
    await api.post("/users/not-a-bot");
}

export { sendNotABot };
