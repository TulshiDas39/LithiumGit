import React from 'react';
import { Route, Switch } from 'react-router-dom';
//import './layout.scss'
import { Main } from '../main/Main';
import { UiRoutes } from '../../lib/UiRoutes';
import { TopNav } from '../topNav/TopNav';

function LayoutComponent() {
    return (
        <div className="d-flex flex-column">
            <TopNav />
            <Switch>
                <Route path={UiRoutes.Root} component={Main} />
            </Switch>
        </div>
    )

}

export const Layout = React.memo(LayoutComponent);