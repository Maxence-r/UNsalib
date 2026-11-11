import { Login } from "./login/Login";
import { Logout } from "./logout/Logout";

const AUTH_VIEWS = [
    { id: "login", Component: Login },
    { id: "logout", Component: Logout },
];

export { AUTH_VIEWS };
