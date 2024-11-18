import {Dispatch, SetStateAction} from "react";
import {User} from "../../electron/models/api/User";

export default interface VariableContextType {
    touchDesignerLocation: string,
    setTouchDesignerLocation: Dispatch<SetStateAction<string>>,
    hasTDL: () => boolean
    isLoggedIn: () => boolean,
    user: User | undefined,
    setUser: Dispatch<SetStateAction<User | undefined>>,
}