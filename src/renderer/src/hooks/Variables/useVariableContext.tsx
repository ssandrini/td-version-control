import React, { createContext, type ReactNode, useContext, useState } from 'react';
import VariableContextType from '../../models/VariableContextType';
import { User } from '../../../../main/models/api/User';
import { ProjectDependencies } from '@renderer/models/ProjectDependencies';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const VariableContext: React.Context<VariableContextType> =
    createContext<VariableContextType>(null!);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function VariableProvider({ children }: { children: ReactNode }): JSX.Element {
    const [missingDependencies, setMissingDependencies] = useState<ProjectDependencies[]>([]);
    const [user, setUser] = useState<User | undefined>(undefined);

    const isLoggedIn = (): boolean => {
        return user != undefined;
    };

    const hasMissingDependencies = (): boolean => {
        return missingDependencies.length !== 0;
    };

    return (
        <VariableContext.Provider
            value={{
                missingDependencies,
                setMissingDependencies,
                hasMissingDependencies,
                isLoggedIn,
                user,
                setUser
            }}
        >
            {children}
        </VariableContext.Provider>
    );
}

export function useVariableContext(): VariableContextType {
    return useContext(VariableContext);
}
