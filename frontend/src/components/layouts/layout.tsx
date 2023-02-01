import React, { useMemo, useRef } from 'react';
import { Route, Switch } from 'react-router-dom';
import './layout.scss'
import { Main } from '../main/Main';
import { UiRoutes } from '../../lib/UiRoutes';
import { TopNav } from '../topNav/TopNav';
import { Modals } from '../modals';
import { FooterNav } from '../topNav/FooterNav';
import { IDimension } from '../../lib';

interface ILayoutProps extends IDimension{

}

function LayoutComponent(props:ILayoutProps) {
    const data = useRef({topHeighPercent:7,bottomNavHeightPercent:3});

    const topNavHeight = useMemo(()=>{
        const height = props.height * (data.current.topHeighPercent/100);
        if(height > 40) return 40;
        return height;
    },[props.height]);

    const footerHeight = useMemo(()=>{
        const height = props.height * (data.current.bottomNavHeightPercent/100);
        if(height > 20) return 20;
        return height;
    },[props.height])

    const mainPanelHeight = useMemo(()=>{
        return props.height - topNavHeight - footerHeight;
    },[topNavHeight,footerHeight])

    return (
        <div className="" style={{height:props.height+"px", width:props.width+"px"}}>
            <div id="layout" className="d-flex flex-column overflow-auto">
                <div className="d-flex" style={{height:`${topNavHeight}px`}}>
                    <TopNav />
                </div>
                <div className="" style={{height:`${mainPanelHeight}px`}}>
                    <Switch>
                        <Route path={UiRoutes.Root} render={()=><Main height={mainPanelHeight} />} />
                    </Switch>
                </div>
                <div style={{height:`${footerHeight}px`}}>
                    <FooterNav />
                </div>
                <Modals/>
            </div>
        </div>
    )

}

export const Layout = React.memo(LayoutComponent);