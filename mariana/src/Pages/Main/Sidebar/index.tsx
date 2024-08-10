import React, { useEffect, useState } from 'react';
import HistoryItem from "./HistoryItem";

const SideBar: React.FC = () => {
    const [versions, setVersions] = useState<string[]>([]);

    useEffect(() => {
        const fetchVersions = async () => {
            const versions = await window.api.listVersions();
            console.log(versions);
            setVersions(versions);
        };
        fetchVersions();
    }, []);

    return (
        <div>
            {versions.length === 0
                ? <p>No versions found.</p>
                : versions.map((version, index) => (
                    <HistoryItem key={index} commit={version} />
                ))
            }
        </div>
    );
}

export default SideBar;
