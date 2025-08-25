import React from 'react';
import {Routes, Route} from 'react-router-dom';
import {map} from 'lodash';
import routes from './routes';

export function Navigation() {
    return (
        <Routes>
            {map(routes, (route, index) => (
                <Route
                    key={index}
                    path={route.path}
                    element={
                        <route.layout>
                            <route.component/>
                        </route.layout>
                    }
                />
            ))}
        </Routes>
    )
}
