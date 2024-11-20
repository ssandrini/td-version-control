import React, { useCallback, useEffect, useState } from 'react';
import {
    addEdge,
    Background,
    BackgroundVariant,
    Controls,
    Edge,
    ReactFlow,
    ReactFlowInstance,
    useEdgesState,
    useNodesState
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { TDState } from '../../../../../../main/models/TDState';
import OperatorNode from './OperatorNode/OperatorNode';
import { cn } from '../../../../lib/utils';
import { nodeState } from '../../../../models/OperatorNodeVariant';

interface NodeGraphProps {
    current?: TDState | undefined;
    compare?: TDState | undefined;
    hidden?: boolean;
}

const compareProperties = (map1?: Map<string, string>, map2?: Map<string, string>): boolean => {
    if (map1 === map2) {
        return true;
    }

    if (!map1 || !map2 || map1.size !== map2.size) {
        return false;
    }

    for (const [key, value] of map1) {
        if (map2.get(key) !== value) {
            return false;
        }
    }

    return true;
};

const NodeGraph: React.FC<NodeGraphProps> = ({ current, hidden, compare }) => {
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | undefined>(
        undefined
    );

    const createNodesAndEdgesFromState = (
        currentState?: TDState,
        compare?: TDState
    ): {
        nodes: Node[];
        edges: Edge[];
    } => {
        if (!currentState) return { nodes: [], edges: [] };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const nodes: Node[] = currentState.nodes.map((currentNode) => {
            if (!compare) {
                return {
                    id: currentNode.name,
                    type: 'operator',
                    position: {
                        x: currentNode.properties?.get('tileX') ?? Math.random() * 400,
                        y:
                            -1 *
                            ((currentNode.properties?.get('tileY') ??
                                Math.random() * 400) as number)
                    },
                    data: {
                        label: currentNode.name,
                        operator: currentNode
                    }
                };
            }

            // Node remains equal in both versions.
            if (
                compare?.nodes.find(
                    (compareNode) =>
                        currentNode.name === compareNode.name &&
                        currentNode.type === compareNode.type &&
                        currentNode.subtype === compareNode.subtype &&
                        compareProperties(currentNode.properties, compareNode.properties)
                )
            ) {
                return {
                    id: currentNode.name,
                    type: 'operator',
                    position: {
                        x: currentNode.properties?.get('tileX') ?? Math.random() * 400,
                        y:
                            -1 *
                            ((currentNode.properties?.get('tileY') ??
                                Math.random() * 400) as number)
                    },
                    data: {
                        label: currentNode.name,
                        operator: currentNode
                    }
                };
            }

            // Node has changes in properties.
            if (compare?.nodes.find((compareNode) => compareNode.name == currentNode.name)) {
                return {
                    id: currentNode.name,
                    type: 'operator',
                    position: {
                        x: currentNode.properties?.get('tileX') ?? Math.random() * 400,
                        y:
                            -1 *
                            ((currentNode.properties?.get('tileY') ??
                                Math.random() * 400) as number)
                    },
                    data: {
                        label: currentNode.name,
                        operator: currentNode,
                        variant: nodeState.modified,
                        compare: compare?.nodes.find(
                            (compareNode) => compareNode.name == currentNode.name
                        )
                    }
                };
            }

            // Node is only in currentVersion.
            return {
                id: currentNode.name,
                type: 'operator',
                position: {
                    x: currentNode.properties?.get('tileX') ?? Math.random() * 400,
                    y:
                        -1 *
                        ((currentNode.properties?.get('tileY') ?? Math.random() * 400) as number)
                },
                data: {
                    label: currentNode.name,
                    operator: currentNode,
                    variant: nodeState.new
                }
            };
        });

        compare?.nodes.map((compareNode) => {
            // Node in compare version is not present in current version.
            if (!current?.nodes.find((currentNode) => compareNode.name == currentNode.name)) {
                nodes.push({
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    id: compareNode.name,
                    type: 'operator',
                    position: {
                        x: compareNode.properties?.get('tileX') ?? Math.random() * 400,
                        y:
                            -1 *
                            ((compareNode.properties?.get('tileY') ??
                                Math.random() * 400) as number)
                    },
                    data: {
                        label: compareNode.name,
                        operator: compareNode,
                        variant: nodeState.deleted
                    }
                });
            }
        });

        const edges: Edge[] = [];
        currentState.inputs.forEach((value, key) => {
            value.map((input) => {
                // Nothing to compare to or edge exists in both versions.
                if (
                    !compare ||
                    compare.inputs
                        .get(key)
                        ?.find((compareInput) => input.destination == compareInput.destination)
                ) {
                    edges.push({
                        id: `e${key}-${input.destination}`,
                        source: input.destination,
                        target: key,
                        type: input.parm ? 'straight' : undefined
                    });
                    return;
                }

                // Edge does not exist in compare version. New edge.
                if (
                    !compare.inputs
                        .get(key)
                        ?.find((compareInput) => input.destination == compareInput.destination)
                ) {
                    edges.push({
                        id: `e${key}-${input.destination}`,
                        source: input.destination,
                        target: key,
                        animated: true,
                        style: { stroke: 'green' }
                    });
                    return;
                }
            });
        });

        compare?.inputs.forEach((compareValue, key) => {
            compareValue.map((compareInput) => {
                // Edge exists only in current version. Edge was deleted.
                if (
                    !currentState.inputs
                        .get(key)
                        ?.find((input) => input.destination == compareInput.destination)
                ) {
                    edges.push({
                        id: `e${key}-${compareInput.destination}`,
                        source: compareInput.destination,
                        target: key,
                        animated: true,
                        style: { stroke: 'red' }
                    });
                    return;
                }
            });
        });

        return { nodes, edges };
    };

    const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdgesFromState(
        current,
        compare
    );

    useEffect(() => {
        if (current != undefined) {
            const { nodes: newNodes, edges: newEdges } = createNodesAndEdgesFromState(
                current,
                compare
            );
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setNodes(newNodes);
            setEdges(newEdges);
            reactFlowInstance?.fitView().then((response) => {
                if (!response) {
                    reactFlowInstance?.fitView().then(async (response) => {
                        if (!response) {
                            // This is some high level coding.
                            await new Promise((f) => setTimeout(f, 10));
                            reactFlowInstance?.fitView().then((response) => {
                                if (!response) {
                                    reactFlowInstance?.fitView().then(async (response) => {
                                        if (!response) {
                                            // This is some SERIOUS high level coding.
                                            await new Promise((f) => setTimeout(f, 10));
                                            reactFlowInstance?.fitView();
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    }, [current, compare]);

    useEffect(() => {
        reactFlowInstance?.fitView();
    }, [reactFlowInstance]);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const nodeTypes = { operator: OperatorNode };

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    return (
        <div className={cn(hidden ? 'hidden' : '', 'border-2 w-full h-full rounded-lg my-5')}>
            <ReactFlow
                maxZoom={2}
                minZoom={0.1}
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
                <Controls className="text-black" />
                <Background variant={BackgroundVariant.Dots} gap={12} size={0.5} />
            </ReactFlow>
        </div>
    );
};

export default NodeGraph;
