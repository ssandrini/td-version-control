import React, {useEffect, useState} from 'react';
import HistoryItem from "./HistoryItem"
import {Button} from "../../../components/ui/button.tsx";

const SideBar: React.FC = () => {
    const [versions, setVersions] = useState<string[]>([]);
    const [path, setPath] = useState<string>("");

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.listVersions(path).then((versions) => {
            setVersions(versions);
        }).catch(() => {
            setVersions([]);
        })
    }, [path]);

    const handleFilePick = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.filePicker().then((files) => {
            console.log(files);
            setPath(files.filePaths[0]);
        })
    }

    return (<div>
        {versions.length === 0 ? <p>No versions found.</p> : versions.map((version, index) => (
            <HistoryItem key={index} commit={version}/>))}
        <Button onClick={handleFilePick}>Elegi el path</Button>
    </div>);
}

export default SideBar;
