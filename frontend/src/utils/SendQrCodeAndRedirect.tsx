import { type ReactElement } from "react";
import { Navigate } from "react-router";

import { SendFromQrCode } from "../api/users.api.js";
import { useApi } from "../utils/hooks/api.hook.js";

function SendQrCodeAndRedirect(): ReactElement {
    const { isLoading, error } = useApi(new SendFromQrCode(), []);

    return !isLoading || error ? <Navigate to="/app" replace /> : <></>;
}

export { SendQrCodeAndRedirect };
