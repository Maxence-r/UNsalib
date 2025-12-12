import { Navigate, Route, Routes } from "react-router";

function AuthRouter() {
    return (
        <Routes>
            {/* <Route element={<AuthRoute />}> */}
            <Route index element={<Navigate to="/auth/login" replace />} />
            <Route path="login" element={<></>} />
            {/* </Route> */}
        </Routes>
    );
}

export { AuthRouter };
