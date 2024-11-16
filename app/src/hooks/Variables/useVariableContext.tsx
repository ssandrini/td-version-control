import React, {createContext, type ReactNode, useContext, useState} from "react";
import VariableContextType from "../../models/VariableContextType.ts";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const VariableContext: React.Context<VariableContextType> = createContext<VariableContextType>(null!)

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function VariableProvider({children}: { children: ReactNode }): JSX.Element {
    const [touchDesignerLocation, setTouchDesignerLocation] = useState<string>("");
    const [user, setUser] = useState<{username: string} | undefined>(undefined);

    const isLoggedIn = (): boolean => {
        return user != undefined;
    }

    const hasTDL = (): boolean => {
        return touchDesignerLocation.length != 0;
    }

    return <VariableContext.Provider value={{
        touchDesignerLocation,
        setTouchDesignerLocation,
        hasTDL,
        isLoggedIn,
        user,
        setUser
    }}>
        {children}
    </VariableContext.Provider>
}

export function useVariableContext(): VariableContextType {
    return useContext(VariableContext)
}