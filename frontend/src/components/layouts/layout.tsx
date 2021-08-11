import React from 'react';
import { Route, Switch } from 'react-router-dom';
//import './layout.scss'
import { Main } from '../main/Main';
import { UiRoutes } from '../../lib/UiRoutes';

function LayoutComponent(){    
    return (
        <Switch>            
            <Route path={UiRoutes.Root} component={Main} />
        </Switch>
    )
    
}

export const Layout = React.memo(LayoutComponent);