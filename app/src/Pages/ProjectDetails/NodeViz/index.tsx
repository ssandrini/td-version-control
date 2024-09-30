import React, { useCallback, useEffect } from 'react';
import {
    addEdge, Background, BackgroundVariant, Controls, ReactFlow, useEdgesState, useNodesState,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

interface NodeVizProps {
    matrix: boolean[][];
}

const NodeViz: React.FC<NodeVizProps> = ({ matrix }) => {
    const createNodesAndEdgesFromMatrix = (matrix: boolean[][]) => {
        const nodes = matrix.map((_, index) => ({
            id: `${index + 1}`,
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

    const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdgesFromMatrix(matrix);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    useEffect(() => {
        const { nodes, edges } = createNodesAndEdgesFromMatrix(matrix);
        setNodes(nodes);
        setEdges(edges);
    }, [matrix, setNodes, setEdges]);

    return (
        <div style={{ width: '50vw', height: '50vh' }}>
            <ReactFlow
                className="text-black"
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
            >
                <Controls className="text-black" />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}

export default NodeViz;
