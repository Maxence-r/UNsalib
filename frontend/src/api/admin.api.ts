import { api } from "./axios";
import type { ApiDataAdminRoomsNotReviewed } from "../utils/types/api.type";

async function getRoomsToReview(): Promise<ApiDataAdminRoomsNotReviewed[]> {
    const res = await api.get("/admin/rooms/not-reviewed");
    return res.data as ApiDataAdminRoomsNotReviewed[];
}

export { getRoomsToReview };
