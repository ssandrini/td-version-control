import React from 'react';
import { cn } from '@renderer/lib/utils';

interface Props {
    white?: boolean;
}

const Spinner: React.FC<Props> = ({ white }) => {
    return (
        <div className="flex justify-center items-center">
            <div
                className={cn(
                    'animate-spin rounded-full h-8 w-8 border-t-4 border-solid',
                    white ? '' : 'border-blue-500'
                )}
            ></div>
        </div>
    );
};

export default Spinner;
