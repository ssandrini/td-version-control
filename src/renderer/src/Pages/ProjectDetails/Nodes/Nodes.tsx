import React, { useState } from 'react';
import { TDState } from '../../../../../main/models/TDState';
import NodeList from './NodeList/NodeList';
import { FaCircleNodes, FaDiagramProject } from 'react-icons/fa6';
import NodeGraph from './NodeGraph/NodeGraph';
import { GiSpawnNode } from 'react-icons/gi';
import { Version } from '../../../../../main/models/Version';
import { FaUserCircle } from 'react-icons/fa';
import { MdDescription } from 'react-icons/md';
import { motion } from 'framer-motion';

interface NodesProps {
    selectedVersion?: Version;
    current: TDState | undefined;
    compare: TDState | undefined;
}

const Viz: {
    GRAPH: string;
    NODELIST: string;
    CONFLICTS: string;
} = {
    GRAPH: 'GRAPH',
    NODELIST: 'NODELIST',
    CONFLICTS: 'CONFLICTS'
};

const Nodes: React.FC<NodesProps> = ({
    current,
    compare,
    selectedVersion,
}) => {
    const [graphViz, setGraphViz] = useState<string>(Viz.GRAPH);

    return (
        <div className="flex flex-col py-4 rounded-lg h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700 mx-2">
            <div className="flex flex-row items-center justify-between w-full h-fit">
                <div className="flex flex-row items-center w-[80%] h-fit gap-3">
                    <div className="flex flex-row items-center w-fit h-fit p-2 bg-gray-600 rounded-lg gap-2">
                        {/* GRAPH Tab */}
                        <motion.div
                            layout
                            initial={false}
                            animate={{
                                backgroundColor: graphViz === Viz.GRAPH ? '#1E40AF' : '#4B5563',
                                color: graphViz === Viz.GRAPH ? '#FFFFFF' : '#9CA3AF'
                            }}
                            transition={{ duration: 0.3 }}
                            className="flex gap-2 flex-row items-center p-2 rounded-lg cursor-pointer"
                            onClick={() => {
                                setGraphViz(Viz.GRAPH);
                            }}
                        >
                            <FaCircleNodes />
                            Graph
                        </motion.div>

                        {/* NODELIST Tab */}
                        <motion.div
                            layout
                            initial={false}
                            animate={{
                                backgroundColor: graphViz === Viz.NODELIST ? '#1E40AF' : '#4B5563',
                                color: graphViz === Viz.NODELIST ? '#FFFFFF' : '#9CA3AF'
                            }}
                            transition={{ duration: 0.3 }}
                            className="flex gap-2 flex-row items-center p-2 rounded-lg cursor-pointer"
                            onClick={() => {
                                setGraphViz(Viz.NODELIST);
                            }}
                        >
                            <GiSpawnNode />
                            Nodes
                        </motion.div>
                    </div>
                    <div className="flex flex-col w-full text-lg text-white">
                        <div className="flex w-full flex-row truncate items-center gap-3">
                            <FaDiagramProject />
                            <div className="truncate whitespace-pre-wrap break-words overflow-wrap break-word max-w-[90%] max-h-[5rem] overflow-hidden">
                                {selectedVersion?.name ?? ''}
                            </div>
                        </div>
                        <div className="flex max-w-[70%] text-gray-400 text-[1rem] flex-row h-full items-center truncate gap-3">
                            <MdDescription />
                            <div className="truncate whitespace-pre-wrap break-words overflow-wrap break-word max-w-full max-h-[5rem] overflow-hidden">
                                {selectedVersion?.description ?? '---------'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row max-w-[20%] h-full text-lg justify-between items-center gap-3 text-white">
                    <div className="flex w-full flex-row-reverse truncate items-center gap-3">
                        <div className="w-16 h-16 p-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                            <FaUserCircle className="h-full w-full" />
                        </div>
                        <div className="flex flex-col max-w-[80%] items-end justify-center">
                            <div className="truncate overflow-hidden">
                                {selectedVersion?.author.name}
                            </div>
                            <div className="w-full flex flex-row items-center gap-10">
                                <div className="truncate text-gray-400 text-[1rem] w-fit overflow-hidden">
                                    {selectedVersion?.date.toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'numeric',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                    }) ?? '-------'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Hidden instead of not rendered to avoid re-rendering the ReactFlow diagram each time */}
            <NodeGraph hidden={graphViz != Viz.GRAPH} current={current} compare={compare} />
            {graphViz != Viz.NODELIST ? <></> : <NodeList current={current} />}
        </div>
    );
};

export default Nodes;
