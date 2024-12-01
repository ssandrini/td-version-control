import { cn } from '@renderer/lib/utils';
import React from 'react';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('custom-animate-pulse rounded-md bg-gray-600', className)} {...props} />
    );
}

export { Skeleton };
