import React from 'react'
import Sidebar from "./Sidebar";

const Main: React.FC = () => {
    return (
        <div className="w-full h-full">
            <div className="w-56 h-screen">
                <Sidebar/>
            </div>
        </div>
    )
}

export default Main
