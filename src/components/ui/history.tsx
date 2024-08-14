import React, {useEffect, useState} from 'react';
import HistoryItem from "../../Elements/HistoryItem"
import { Version } from '../../../electron/td-mgr/td-mgr';

interface HistoryProps {
    path: string;
}

const History: React.FC<HistoryProps> = ({path}) => {
    const [versions, setVersions] = useState<string[]>([]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.listVersions(path).then((versions: Version[]) => {
            // TO DO: JERO, ACÁ ESTAN LAS VERSIONES CON LOS DATOS QUE USARÍAMOS POR AHORA
            const names = versions.map((version: Version) => version.name);
            setVersions(names);
        }).catch(() => {
            setVersions([]);
        });
    }, [path]);

    return (<div>
        {versions.length === 0 ? <p>No versions found.</p> : versions.map((version, index) => (
            <HistoryItem key={index} commit={version}/>))}
    </div>);
}

export default History;
