import React, {useEffect} from 'react'
import HistoryItem from "./HistoryItem";
import {listVersions} from "../../../version-mgr";

const SideBar: React.FC = () => {
    const data = ["commit1", "commit2", "commit3", "commit4", "commit5", "commit6", "commit7", "commit8"];

    useEffect(() => {
        // Path to the directory you want to list files from
        console.log(listVersions());
    }, []);


    return (
        <div>
            {data.map((item, index) => (
                <HistoryItem key={index} commit={item} />
            ))}
        </div>
    )
}

export default SideBar
