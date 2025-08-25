import {AdminLayout} from '../layouts';
import {LoginAdmin} from '../pages/Admin';
import {HomeAdmin} from '../pages/Admin';

const adminRoutes: any[] = [
    {
        path: '/admin',
        layout: AdminLayout,
        component: HomeAdmin,
        exact: true
    }
];

export default adminRoutes;
