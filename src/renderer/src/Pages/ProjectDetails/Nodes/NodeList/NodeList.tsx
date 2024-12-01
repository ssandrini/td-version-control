import React from 'react';
import { TDState } from '../../../../../../main/models/TDState';
import OperatorCard from '../../../../components/ui/OperatorCard';
import { Skeleton } from '@renderer/components/ui/skeleton';

interface NodeListProps {
    current: TDState | undefined;
}

const NodeList: React.FC<NodeListProps> = ({ current }) => {
    return (
        <div className="flex flex-col mt-4 py-4 rounded-lg h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700">
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
                {current?.nodes.map((node, index) => (
                    <div key={index} className="h-fit w-28">
                        <OperatorCard node={node} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NodeList;
