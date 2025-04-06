export async function logout(): Promise<{ success: boolean, error: string }> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/auth/logout`,
            { credentials: "include" }
        );
        const jsonResponse = await response.json();
        if (jsonResponse.message === "LOGOUT_SUCCESSFUL") {
            return { success: true, error: "" };
        }
        throw new Error("Unknown error");
    } catch (error) {
        return { success: false, error: (error as Error).toString() };
    }
}