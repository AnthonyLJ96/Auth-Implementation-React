import React from 'react';
import './ClientLayout.scss';

export function ClientLayout(props: any) {
    const {children} = props;
    return (
        <div>
            <p>ClientLayout</p>
            {children}
        </div>
    );
}
