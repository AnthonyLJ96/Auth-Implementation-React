import {ClientLayout} from '../layouts';
import {Home} from '../pages/Client';

const clientRoutes: any[] = [
    {
        path: '/',
        layout: ClientLayout,
        component: Home,
        exact: true
    }
];

export default clientRoutes;
