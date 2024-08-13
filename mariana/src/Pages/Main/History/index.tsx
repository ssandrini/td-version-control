import React, {useEffect, useState} from 'react';
import HistoryItem from "../../../Elements/HistoryItem"

interface HistoryProps {
    path: string;
}

const History: React.FC<HistoryProps> = ({path}) => {
    const [versions, setVersions] = useState<string[]>([]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.listVersions(path).then((versions) => {
            setVersions(versions);
        }).catch(() => {
            setVersions([]);
        })
    }, [path]);

    return (<div>
        {versions.length === 0 ? <p>No versions found.</p> : versions.map((version, index) => (
            <HistoryItem key={index} commit={version}/>))}
    </div>);
}

export default History;
