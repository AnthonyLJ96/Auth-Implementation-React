import React from 'react';
import {LoginAdmin} from '../../pages/Admin';
import './AdminLayout.scss';
import {useAuth} from '../../hooks';

export function AdminLayout(props: any) {
    const {children} = props;
    const {isAuthenticated} = useAuth();
    if (!isAuthenticated) return <LoginAdmin/>;
    return (
        <div>
            <p>AdminLayout</p>
            {children}
        </div>
    );
}
