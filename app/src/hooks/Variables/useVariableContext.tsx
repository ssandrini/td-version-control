import React, {createContext, type ReactNode, useContext, useState} from "react";
import VariableContextType from "../../models/VariableContextType.ts";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const VariableContext: React.Context<VariableContextType> = createContext<VariableContextType>(null!)

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function VariableProvider({children}: { children: ReactNode }): JSX.Element {
    /** TODO: Verificar si alguna de estas variables de entorno es util: https://derivative.ca/UserGuide/Variables
     * https://www.electronjs.org/docs/latest/api/environment-variables process.env.....
     */
    const [touchDesignerLocation, setTouchDesignerLocation] = useState<string>("");

    const hasTDL = (): boolean => {
        return touchDesignerLocation.length != 0;
    }

    return <VariableContext.Provider value={{
        touchDesignerLocation,
        setTouchDesignerLocation,
        hasTDL
    }}>
        {children}
    </VariableContext.Provider>
}

export function useVariableContext(): VariableContextType {
    return useContext(VariableContext)
}