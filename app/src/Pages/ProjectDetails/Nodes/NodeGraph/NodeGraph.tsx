import React, {useCallback, useEffect, useState} from 'react';
import {
    addEdge, Background, BackgroundVariant, Controls, Edge, ReactFlow, ReactFlowInstance, useEdgesState, useNodesState,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import {TDState} from "../../../../../electron/models/TDState";
import OperatorNode from "./OperatorNode/OperatorNode";

interface NodeGraphProps {
    current: TDState | undefined
}

const NodeGraph: React.FC<NodeGraphProps> = ({current}) => {
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | undefined>(undefined);

    const createNodesAndEdgesFromState = (currentState: TDState | undefined): { nodes: Node[], edges: Edge[] } => {
        if (!currentState) return {nodes: [], edges: []}

        const nodes: Node[] = currentState.nodes.map((currentNode) => ({
            id: currentNode.name, type: "operator", position: {
                x: currentNode.properties?.get('tileX') ?? Math.random() * 400,
                y: -1 * (currentNode.properties?.get('tileY') ?? Math.random() * 400)
            }, data: {label: currentNode.name, operator: currentNode},
        }));

        console.log(currentState.inputs);
        console.log(currentState.nodes);

        const edges: Edge[] = []
        currentState.inputs.forEach((value, key) => {
            value.map((input) => {
                edges.push({
                    id: `e${key}-${input}`, source: input, target: key
                })
            })
        })
        // const edges = currentState.inputs.((row, sourceIndex) =>
        //     row.map((cell, targetIndex) => {
        //         if (cell) {
        //             return {
        //                 id: `e${sourceIndex + 1}-${targetIndex + 1}`,
        //                 source: `${sourceIndex + 1}`,
        //                 target: `${targetIndex + 1}`,
        //             };
        //         }
        //         return null;
        //     })
        // ).filter(edge => edge !== null);

        return {nodes, edges};
    };

    const {nodes: initialNodes, edges: initialEdges} = createNodesAndEdgesFromState(current);

    useEffect(() => {
        if (current != undefined) {
            const {nodes: newNodes, edges: newEdges} = createNodesAndEdgesFromState(current);
            setNodes(newNodes)
            setEdges(newEdges)
            reactFlowInstance?.fitView()
        }
    }, [current]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const nodeTypes = {operator: OperatorNode};

    const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges],);

    return (<div className="w-full h-full rounded-lg my-5">
        <ReactFlow
            className="text-black"
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onInit={(instance) => {
                setReactFlowInstance(instance);
                instance.fitView();
            }}
            onConnect={onConnect}
        >
            <Controls className="text-black"/>
            <Background variant={BackgroundVariant.Dots} gap={12} size={0.5}/>
        </ReactFlow>
    </div>);
}

export default NodeGraph;
