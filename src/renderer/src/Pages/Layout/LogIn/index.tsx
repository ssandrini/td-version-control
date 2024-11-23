import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useVariableContext } from '../../../hooks/Variables/useVariableContext';
import { useNavigate } from 'react-router-dom';
import { localPaths } from '../../../const';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';
import MarianaHelper from '../../../components/ui/MarianaHelper';
import Spinner from '../../../components/ui/Spinner';
import { ApiResponse } from '../../../../../main/errors/ApiResponse';
import { User } from 'src/main/models/api/User';

interface LogInProps {}

const LogIn: React.FC<LogInProps> = () => {
    const { isLoggedIn, setUser } = useVariableContext();
    const navigate = useNavigate();

    const [username, setUsername] = useState<string>('');
    const [isUsernameValid, setIsUsernameValid] = useState<boolean>(false);
    const [password, setPassword] = useState<string>('');
    const [userError, setUserError] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [type, setType] = useState('password');

    const [isLoadingLogin, setIsLoadingLogin] = useState<boolean>(false);

    useEffect(() => {
        setIsUsernameValid(username.length >= 4);
    }, [username]);

    if (isLoggedIn()) {
        navigate(localPaths.HOME);
        return;
    }

    const handleToggle = () => {
        if (type === 'password') {
            setType('text');
        } else {
            setType('password');
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoadingLogin(true);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.authenticate(username, password).then((apiResponse: ApiResponse<void>) => {
            setSubmitted(true);
            if (apiResponse.errorCode) {
                setUserError(true);
                setIsLoadingLogin(false);
            } else {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                window.api
                    .getUser()
                    .then((apiResponse: ApiResponse<User>) => {
                        if (apiResponse.result) {
                            setUser(apiResponse.result);
                        } else {
                            setSubmitted(true);
                            setUserError(true);
                        }
                    })
                    .finally(() => {
                        setIsLoadingLogin(false);
                    });
            }
        });
    };

    const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setUsername(value);
        if (submitted) {
            setSubmitted(false);
        }
        setUserError(false);
    };

    const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setPassword(value);
        if (submitted) {
            setSubmitted(false);
        }
        setUserError(false);
    };

    const isFormValid = isUsernameValid && password.trim().length >= 8;

    return (
        <div className="flex pb-[50px] flex-col items-center justify-evenly pt-10 h-full bg-gray-800 text-white overflow-y-auto">
            <MarianaHelper />
            <div className="flex justify-center items-center md:w-[30rem] w-[25rem] max-w-[90%] md:mt-0 text-gray-700">
                <div className="w-full bg-white drop-shadow-lg rounded-3xl md:px-20 px-10 py-16 my-3 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="w-full space-y-1 h-20">
                            <label htmlFor="username" className="text-left">
                                Username*
                            </label>
                            <Input
                                type="text"
                                id="username"
                                className={`w-full border ${submitted && (!username || userError) ? 'border-red-500' : 'border-input'} rounded-md shadow-sm focus:ring-blue-600`}
                                value={username}
                                placeholder="Username"
                                onChange={handleUsernameChange}
                            />
                        </div>

                        <div className="space-y-1 h-30">
                            <label htmlFor="password" className="text-left">
                                Password*
                            </label>
                            <div className="relative">
                                <Input
                                    type={type}
                                    id="password"
                                    placeholder="Password"
                                    className={`w-full border rounded-md shadow-sm focus:ring-blue-600 pr-10 ${submitted && userError ? 'border-red-500' : 'border-input'}`}
                                    value={password}
                                    onChange={handlePasswordChange}
                                />
                                <div onClick={handleToggle}>
                                    {type === 'password' ? (
                                        <MdOutlineVisibilityOff className="absolute inset-y-0 right-0 flex items-center pr-4 pt-0.5 h-10 w-10 cursor-pointer" />
                                    ) : (
                                        <MdOutlineVisibility className="absolute inset-y-0 right-0 flex items-center pr-4 pt-0.5 h-10 w-10 cursor-pointer" />
                                    )}
                                </div>
                            </div>
                            {submitted && userError && (
                                <p className="text-red-500 text-sm">Credenciales inválidas.</p>
                            )}
                        </div>

                        <div className="flex flex-col justify-center content-center pt-4">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={!isFormValid || isLoadingLogin}
                            >
                                {!isLoadingLogin ? 'Iniciar Sesión' : <Spinner />}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LogIn;
