import React, { useState } from 'react';
import Fuse from 'fuse.js'; // Add this library to your project
import { motion, AnimatePresence } from 'framer-motion';
import { TDState } from '../../../../../../main/models/TDState';
import OperatorCard from '../../../../components/ui/OperatorCard';
import { Skeleton } from '@renderer/components/ui/skeleton';
import { Input } from '@renderer/components/ui/input';

interface NodeListProps {
    current: TDState | undefined;
}

const NodeList: React.FC<NodeListProps> = ({ current }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredNodes, setFilteredNodes] = useState(current?.nodes || []);

    const fuse = new Fuse(current?.nodes || [], {
        keys: [
            'name',
            'type',
            'subtype',
            {
                name: 'properties',
                getFn: (node) =>
                    node.properties
                        ? Array.from(node.properties.entries())
                              .map(([key, value]) => `${key}:${value}`)
                              .join(' ')
                        : ''
            }
        ],
        threshold: 0.3
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (!query.trim()) {
            setFilteredNodes(current?.nodes || []);
        } else {
            const results = fuse.search(query);
            setFilteredNodes(results.map((result) => result.item));
        }
    };

    const nodeAnimationVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 }
    };

    return (
        <div className="flex flex-col mt-4 py-4 rounded-lg h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700">
            <div className="px-4 max-w-[40rem] bg-[#1b1d23]">
                <Input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search nodes by name, type, or properties..."
                    className="mb-4 p-2 border border-gray-400 rounded-md bg-[#1b1d23] text-white"
                />
            </div>

            <div className="flex px-4 flex-row gap-3 py-4 flex-wrap">
                {current == undefined && (
                    <>
                        <Skeleton className="rounded-lg h-[6rem] w-28" />
                        <Skeleton className="rounded-lg h-[5rem] w-28" />
                        <Skeleton className="rounded-lg h-[6rem] w-28" />
                        <Skeleton className="rounded-lg h-[4rem] w-28" />
                        <Skeleton className="rounded-lg h-[4.5rem] w-28" />
                        <Skeleton className="rounded-lg h-[7rem] w-28" />
                        <Skeleton className="rounded-lg h-[6rem] w-28" />
                    </>
                )}

                <AnimatePresence>
                    {filteredNodes.map((node, index) => (
                        <motion.div
                            key={index}
                            className="h-fit w-28"
                            variants={nodeAnimationVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                        >
                            <OperatorCard node={node} />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredNodes.length === 0 && searchQuery && (
                    <motion.div
                        className="text-gray-300"
                        variants={nodeAnimationVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        No nodes match your search.
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default NodeList;
