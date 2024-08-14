import React from 'react'
import {Outlet} from "react-router-dom";
import Sidebar from "../../components/ui/Sidebar.tsx";


const Layout: React.FC = () => {
    return (<div className="flex h-screen">
        <div className="min-w-40 max-w-40 h-full">
            <Sidebar/>
        </div>
        <div className="w-full h-screen">
            <Outlet/>
        </div>
    </div>);
};

export default Layout
