import { Dispatch, SetStateAction } from 'react';
import { User } from '../../../main/models/api/User';
import { ProjectDependencies } from '@renderer/models/ProjectDependencies';

export default interface VariableContextType {
    missingDependencies: ProjectDependencies[];
    setMissingDependencies: Dispatch<SetStateAction<ProjectDependencies[]>>;
    hasMissingDependencies: () => boolean;
    isLoggedIn: () => boolean;
    user: User | undefined;
    setUser: Dispatch<SetStateAction<User | undefined>>;
    defaultProjectLocation: string;
    setDefaultProjectLocation: Dispatch<SetStateAction<string>>;
    hasDefaultProjectLocation: () => boolean;
}
