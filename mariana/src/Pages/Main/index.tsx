import React, {useState} from 'react'
import History from "./History";
import Sidebar from "../Sidebar";

const Main: React.FC = () => {
    const [path, setPath] = useState<string>("");

    return (
        <div className="flex flex-row w-full h-full">
            <div className="w-56 h-screen">
                <Sidebar setPath={setPath}/>
            </div>
            <div className="w-56 h-screen">
                <History path={path}/>
            </div>
        </div>
    )
}

export default Main
