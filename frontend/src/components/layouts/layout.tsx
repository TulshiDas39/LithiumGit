import React, { useRef } from 'react';
import { Route, Switch } from 'react-router-dom';
import './layout.scss'
import { Main } from '../main/Main';
import { UiRoutes } from '../../lib/UiRoutes';
import { TopNav } from '../topNav/TopNav';
import { Modals } from '../modals';
import { FooterNav } from '../topNav/FooterNav';

function LayoutComponent() {
    const data = useRef({topHeighPercent:7,bottomNavHeightPercent:3});
    return (
        <div id="layout" className="d-flex flex-column">
            <div className="d-flex" style={{height:`${data.current.topHeighPercent}%`}}>
                <TopNav />
            </div>
            <div className="" style={{height:`${100 - data.current.topHeighPercent - data.current.bottomNavHeightPercent}%`}}>
                <Switch>
                    <Route path={UiRoutes.Root} component={Main} />
                </Switch>
            </div>
            <div style={{height:`3%`}}>
                <FooterNav />
            </div>
            <Modals/>
        </div>
    )

}

export const Layout = React.memo(LayoutComponent);