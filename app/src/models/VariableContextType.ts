import {Dispatch, SetStateAction} from "react";

export default interface VariableContextType {
    touchDesignerLocation: string,
    setTouchDesignerLocation: Dispatch<SetStateAction<string>>,
    hasTDL: () => boolean
}