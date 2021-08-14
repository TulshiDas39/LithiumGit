import React from 'react';
import { Route, Switch } from 'react-router-dom';
import './layout.scss'
import { Main } from '../main/Main';
import { UiRoutes } from '../../lib/UiRoutes';
import { TopNav } from '../topNav/TopNav';

function LayoutComponent() {
    return (
        <div id="layout" className="d-flex flex-column">
            <TopNav />
            <div className="flex-grow-1">
                <Switch>
                    <Route path={UiRoutes.Root} component={Main} />
                </Switch>
            </div>
            
        </div>
    )

}

export const Layout = React.memo(LayoutComponent);