import React, {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {useVariableContext} from "../../../hooks/Variables/useVariableContext";
import {useNavigate} from "react-router-dom";
import {localPaths} from "../../../const";
import {Button} from "../../../components/ui/button";
import {Input} from "../../../components/ui/input";
import {MdOutlineVisibility, MdOutlineVisibilityOff} from "react-icons/md";
import {APIError} from "../../../../electron/errors/APIError";


interface LogInProps {
}

const LogIn: React.FC<LogInProps> = () => {
    const {isLoggedIn, setUser} = useVariableContext();
    const navigate = useNavigate();

    const [showMiddleDiv, setShowMiddleDiv] = useState(false);
    const [username, setUsername] = useState<string>('');
    const [isUsernameValid, setIsUsernameValid] = useState<boolean>(false);
    const [password, setPassword] = useState<string>('');
    const [userError, setUserError] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [type, setType] = useState('password');

    useEffect(() => {
        setIsUsernameValid(username.length >= 4);
    }, [username]);

    if (isLoggedIn()) {
        navigate(localPaths.HOME)
        return;
    }

    const handleToggle = () => {
        if (type === 'password') {
            setType('text')
        } else {
            setType('password')
        }
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.authenticate(username, password).then(() => {
            setSubmitted(true);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            window.api.getUser().then((user) => {
                setUser(user);
            });
        }).catch((e : APIError) => {
            console.log("error status:" + e.statusCode);
            setSubmitted(true);
            setUserError(true)
        });

    };

    const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target;
        setUsername(value);
        if (submitted) {
            setSubmitted(false);
        }
        setUserError(false);
    };

    const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target;
        setPassword(value);
        if (submitted) {
            setSubmitted(false);
        }
        setUserError(false);
    };

    const isFormValid = isUsernameValid && password.trim().length >= 8;

    return (<div
        className="flex flex-col items-center justify-evenly pt-10 h-screen bg-gradient-to-r from-blue-950 to-blue-900 text-white overflow-y-auto">
        <div
            className="flex flex-col bg-gradient-to-r from-blue-900 to-blue-950 border border-white p-10 rounded-[2rem] gap-4 justify-between shadow-lg">
            <div className="text-center cursor-pointer" onClick={() => setShowMiddleDiv(!showMiddleDiv)}>
                <div className="flex flex-row w-full items-center justify-center gap-3 mb-4">
                    <img src="public/img.png" alt="" className="w-14 h-14 rounded-lg"/>
                    <h1 className="text-6xl font-bold">Mariana</h1>
                </div>
                <div className="max-w-lg mx-auto">
                    <p className="text-xl text-gray-300">
                        A version control system designed specifically for TouchDesigner projects.
                    </p>
                </div>
            </div>

            {showMiddleDiv && (<div className="flex justify-center space-x-16">
                <div className="text-center animate-fade-in-up delay-300">
                    <div className="flex justify-center mb-4">
                        <img src="public/capture.png" alt="Capture icon" className="w-16 h-16"/>
                    </div>
                    <h3 className="text-3xl font-bold">Capture</h3>
                    <p className="text-sm mt-2 text-gray-300">every step of your creative process.</p>
                </div>
                <div className="text-center animate-fade-in-up delay-600">
                    <div className="flex justify-center mb-4">
                        <img src="public/recover.png" alt="Recover icon" className="w-16 h-16"/>
                    </div>
                    <h3 className="text-3xl font-bold">Recover</h3>
                    <p className="text-sm mt-2 text-gray-300">any previous version</p>
                </div>
                <div className="text-center animate-fade-in-up delay-900">
                    <div className="flex justify-center mb-4">
                        <img src="public/refine.png" alt="Refine icon" className="w-16 h-16"/>
                    </div>
                    <h3 className="text-3xl font-bold">Refine</h3>
                    <p className="text-sm mt-2 text-gray-300">and improve with confidence.</p>
                </div>
            </div>)}
        </div>
        <div className="flex justify-center items-center md:w-[30rem] w-[25rem] max-w-[90%] md:mt-0 text-gray-700">
            <div className="w-full bg-white drop-shadow-lg rounded-3xl md:px-20 px-10 py-16 my-3 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="w-full space-y-1 h-20">
                        <label htmlFor="username"
                               className="text-left">Username*</label>
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
                        <label htmlFor="password"
                               className="text-left">Password*</label>
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
                                {type === "password" ? (<MdOutlineVisibilityOff
                                    className="absolute inset-y-0 right-0 flex items-center pr-4 pt-0.5 h-10 w-10 cursor-pointer"/>) : (
                                    <MdOutlineVisibility
                                        className="absolute inset-y-0 right-0 flex items-center pr-4 pt-0.5 h-10 w-10 cursor-pointer"/>)}
                            </div>
                        </div>
                        {submitted && userError && <p className="text-red-500 text-sm">Credenciales inválidas.</p>}
                    </div>

                    <div className="flex flex-col justify-center content-center pt-4">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={!isFormValid}>Iniciar Sesión</Button>
                    </div>
                </form>
            </div>
        </div>
    </div>)
}

export default LogIn;