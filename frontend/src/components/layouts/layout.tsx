import React from 'react';
import { Route, Switch } from 'react-router-dom';
//import './layout.scss'
import { Main } from '../main/main';
import { UiRoutes } from '../../lib/UiRoutes';

function LayoutComponent(){
    console.log('rendering');
    return (
        <Switch>            
            <Route path={UiRoutes.Root} component={Main} />
        </Switch>
    )
    
}

export const Layout = React.memo(LayoutComponent);