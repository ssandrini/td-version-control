import React, { useCallback } from 'react';
import {
    addEdge, Background, BackgroundVariant, Controls, ReactFlow, useEdgesState, useNodesState,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import {TDState} from "../../../../../electron/models/TDState";
import OperatorNode from "./OperatorNode/OperatorNode";

interface NodeGraphProps {
    current: TDState | undefined
}

const NodeGraph: React.FC<NodeGraphProps> = ({current}) => {
    const createNodesAndEdgesFromMatrix = (matrix: boolean[][]) => {
        const nodes = matrix.map((_, index) => ({
            id: `${index + 1}`,
            type: "operator",
            position: { x: Math.random() * 400, y: Math.random() * 400 },  // TODO: poner posiciones despues
            data: { label: `${index + 1}` }, // TODO: poner nombres sigificativos
        }));

        const edges = matrix.flatMap((row, sourceIndex) =>
            row.map((cell, targetIndex) => {
                if (cell) {
                    return {
                        id: `e${sourceIndex + 1}-${targetIndex + 1}`,
                        source: `${sourceIndex + 1}`,
                        target: `${targetIndex + 1}`,
                    };
                }
                return null;
            })
        ).filter(edge => edge !== null);

        return { nodes, edges };
    };

    const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdgesFromMatrix([[false, true, false], [false, false, false], [false, false, false]]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const nodeTypes = { operator: OperatorNode };

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    return (
        <div className="w-full h-full py-5">
            <ReactFlow
                className="text-black"
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                onConnect={onConnect}
            >
                <Controls className="text-black" />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}

export default NodeGraph;
