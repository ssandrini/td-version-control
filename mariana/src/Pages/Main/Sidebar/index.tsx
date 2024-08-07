import React from 'react'
import HistoryItem from "./HistoryItem";

const SideBar: React.FC = () => {
    const data = ["commit1", "commit2", "commit3", "commit4", "commit5", "commit6", "commit7", "commit8"];

    return (
        <div>
            {data.map((item, index) => (
                <HistoryItem key={index} commit={item}/>
            ))}
        </div>
    )
}

export default SideBar
