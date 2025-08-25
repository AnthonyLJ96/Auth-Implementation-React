import adminRoutes from "./admin.routes";
import clientRoutes from "./client.routes";
import {BasicLayout} from "../layouts";
import {Error404} from "../pages/Errors";

const routes = [
    ...adminRoutes,
    ...clientRoutes,
    {
        path: '*',
        layout: BasicLayout,
        component: Error404,
    }
];

export default routes;
