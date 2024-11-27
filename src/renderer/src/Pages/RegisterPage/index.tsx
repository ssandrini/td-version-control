import React, { ChangeEvent, FormEvent, useState } from 'react';
import { User } from 'src/main/models/api/User';
import { useVariableContext } from '@renderer/hooks/Variables/useVariableContext';
import { useNavigate } from 'react-router-dom';
import { localPaths } from '@renderer/const';
import { ApiResponse } from '../../../../main/errors/ApiResponse';
import { Label } from '@renderer/components/ui/label';
import { Input } from '@renderer/components/ui/input';
import { Button } from '@renderer/components/ui/button';
import Spinner from '@renderer/components/ui/Spinner';
import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';
import { motion } from 'framer-motion';
import { RegisterUserRequest } from '../../../../main/services/UserService';
import { APIErrorCode } from '../../../../main/errors/APIErrorCode';

interface RegisterPageProps {
    goToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ goToLogin }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password2: ''
    });
    const { name, email, password, password2 } = formData;
    const { isLoggedIn, setUser } = useVariableContext();
    const [passwordMatch, setPasswordMatch] = useState(true); // State to track password match status
    const [isPasswordValid, setIsPasswordValid] = useState(true); // State to track password length validity
    const navigate = useNavigate();
    const [passwordType, setPasswordType] = useState('password');
    const [password2Type, setPassword2Type] = useState('password');
    const [isEmailValid, setIsEmailValid] = useState<boolean>(false);

    const [isLoadingRegister, setIsLoadingRegister] = useState<boolean>(false);
    const [_, setUserError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [submitted, setSubmitted] = useState<boolean>(false);

    const buildErrorMessage = (apiErrorCode: APIErrorCode) => {
        switch (apiErrorCode) {
            case APIErrorCode.EntityAlreadyExists:
            case APIErrorCode.UnprocessableEntity:
                setErrorMessage('An account with this username or email already exists.');
                break;
            case APIErrorCode.BadRequest:
                setErrorMessage(
                    'The provided information is invalid. Please check your details and try again.'
                );
                break;
            case APIErrorCode.LocalError:
                setErrorMessage(
                    'Failed to complete the registration. Please check your internet connection and try again.'
                );
                break;
            default:
                setErrorMessage(
                    'Unable to register your account at this time. Please try again later.'
                );
        }
    };
    const validateEmail = (email: string) => {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    const handlePasswordToggle = () => {
        setPasswordType((prevType) => (prevType === 'password' ? 'text' : 'password'));
    };

    const handlePassword2Toggle = () => {
        setPassword2Type((prevType) => (prevType === 'password' ? 'text' : 'password'));
    };

    React.useEffect(() => {
        if (isLoggedIn()) {
            navigate(localPaths.HOME);
        }
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value
        }));
        // Check if passwords match
        if (name === 'password2') {
            setPasswordMatch(value === formData.password);
        }
        if (name === 'password') {
            setPasswordMatch(value === formData.password2);
            setIsPasswordValid(value.length >= 8);
        }
        setErrorMessage('');
    };

    const allowLetters = (value: string) => {
        const hasLetter = /[a-zA-Záéíóúñ´]/.test(value);
        const allowedPattern = hasLetter ? /[^a-zA-Záéíóúñ´0-9 ]/g : /[^a-zA-Záéíóúñ´ ]/g;
        return value.replace(allowedPattern, '');
    };

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const newValue = allowLetters(value);
        setFormData((prevState) => ({
            ...prevState,
            name: newValue
        }));
        setErrorMessage('');
    };

    const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setFormData((prevState) => ({
            ...prevState,
            email: value
        }));
        if (submitted) {
            setSubmitted(false);
        }
        setUserError(false);
        setErrorMessage('');
        setIsEmailValid(validateEmail(value));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoadingRegister(true);

        if (!validateEmail(email)) {
            setUserError(true);
            return;
        }

        const registerUserRequest: RegisterUserRequest = {
            email: email,
            username: name,
            password: password
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.register(registerUserRequest).then((registerResponse: ApiResponse<User>) => {
            setSubmitted(true);
            if (registerResponse.errorCode) {
                setUserError(true);
                buildErrorMessage(registerResponse.errorCode);
                setIsLoadingRegister(false);
            } else {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                window.api
                    .authenticate(name, password)
                    .then((apiResponse: ApiResponse) => {
                        if (!apiResponse.errorCode) {
                            setUser(registerResponse.result!);
                        } else {
                            setSubmitted(true);
                            setUserError(true);
                            setErrorMessage('Auto-login failed, please go to login page.');
                        }
                    })
                    .finally(() => {
                        setIsLoadingRegister(false);
                    });
            }
        });
    };

    const isFormValid = () => {
        // Check if all required fields are filled and passwords match
        return (
            isEmailValid &&
            email.trim() !== '' &&
            name.trim() !== '' &&
            email.trim() !== '' &&
            password.trim() !== '' &&
            password2.trim() !== '' &&
            passwordMatch
        );
    };

    return (
        <motion.div
            exit={{ opacity: 0, scale: 1.1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex pb-[50px] flex-col items-center justify-evenly no-scrollbar h-full text-white overflow-y-auto"
        >
            <div className="flex justify-center items-center md:w-[40rem] w-[35rem] max-w-[90%] md:mt-0 text-gray-700">
                <div className="w-full bg-white drop-shadow-lg rounded-3xl md:px-20 px-10 pb-16 pt-8 my-3 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center justify-center">
                            <img
                                src="icon.png"
                                alt="Logo"
                                className="h-36 mb-5 object-contain spin2"
                            />
                        </div>
                        <div className="w-full flex flex-row gap-4 h-20">
                            <div className="w-full space-y-1">
                                <div className="text-gray3">
                                    <Label
                                        htmlFor="name"
                                        className="text-left text-p1_semibold font-p1_semibold"
                                    >
                                        Username*
                                    </Label>
                                </div>
                                <Input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="w-full border-input rounded-md shadow-sm "
                                    value={name}
                                    onChange={handleNameChange}
                                    maxLength={30}
                                />
                            </div>
                            <div className="w-full space-y-1 h-20">
                                <div className="text-gray3">
                                    <Label
                                        htmlFor="email"
                                        className="text-left text-gray3 text-p1_semibold font-p1_semibold"
                                    >
                                        Email*
                                    </Label>
                                </div>
                                <Input
                                    type="text"
                                    id="email"
                                    name="email"
                                    className="w-full border-input rounded-md shadow-sm "
                                    value={email}
                                    onChange={handleEmailChange}
                                />
                            </div>
                        </div>
                        <div className="w-full space-y-1 h-20">
                            <div className="text-gray3">
                                <Label
                                    htmlFor="password"
                                    className="text-left text-p1_semibold font-p1_semibold"
                                >
                                    Password*
                                </Label>
                            </div>
                            <div className="relative">
                                <Input
                                    type={passwordType}
                                    id="password"
                                    name="password"
                                    className={
                                        'w-full border-input rounded-md shadow-sm ' +
                                        (!isPasswordValid ? ' border-red-500' : '')
                                    } // Add red border if passwords don't match
                                    placeholder="Min. 8 characters"
                                    value={password}
                                    onChange={handleChange}
                                />
                                <div onClick={handlePasswordToggle}>
                                    {passwordType === 'password' ? (
                                        <MdOutlineVisibilityOff className="absolute inset-y-0 right-0 flex items-center pr-4 pt-0.5 h-10 w-10 cursor-pointer" />
                                    ) : (
                                        <MdOutlineVisibility className="absolute inset-y-0 right-0 flex items-center pr-4 pt-0.5 h-10 w-10 cursor-pointer" />
                                    )}
                                </div>
                            </div>
                            {!isPasswordValid && (
                                <p className="text-red-500 text-xs mt-1">
                                    The password should have at least 8 characters.
                                </p>
                            )}{' '}
                            {/* Error message */}
                        </div>

                        <div className="w-full space-y-1 h-20">
                            <div className="text-gray3">
                                <Label
                                    htmlFor="password2"
                                    className="text-left text-p1_semibold font-p1_semibold"
                                >
                                    Verify Password*
                                </Label>
                            </div>
                            <div className="relative">
                                <Input
                                    type={password2Type}
                                    id="password2"
                                    name="password2"
                                    className={
                                        'w-full border-input rounded-md shadow-sm ' +
                                        (passwordMatch ? '' : ' border-red-500')
                                    } // Add red border if passwords don't match
                                    value={password2}
                                    onChange={handleChange}
                                />
                                <div onClick={handlePassword2Toggle}>
                                    {password2Type === 'password' ? (
                                        <MdOutlineVisibilityOff className="absolute inset-y-0 right-0 flex items-center pr-4 pt-0.5 h-10 w-10 cursor-pointer" />
                                    ) : (
                                        <MdOutlineVisibility className="absolute inset-y-0 right-0 flex items-center pr-4 pt-0.5 h-10 w-10 cursor-pointer" />
                                    )}
                                </div>
                            </div>
                            {!passwordMatch && (
                                <p className="text-red-500 text-xs mt-1">
                                    The passwords do not match
                                </p>
                            )}{' '}
                            {/* Error message */}
                        </div>
                        {errorMessage && (
                            <div className="mb-4 text-center text-red-500 text-sm">
                                {errorMessage}
                            </div>
                        )}
                        <div className="flex flex-col justify-center content-center pt-4">
                            {!isLoadingRegister ? (
                                <>
                                    <Button
                                        className={`mt-4 w-full ${isFormValid() ? '' : 'opacity-50 cursor-not-allowed w-full'}`}
                                        type="submit"
                                        disabled={!isFormValid()}
                                    >
                                        Register
                                    </Button>
                                    <div className="mr-auto ml-auto w-fit mt-4 flex flex-row">
                                        <a
                                            className="text-gray-500 underline cursor-pointer text-p1_regular"
                                            onClick={() => goToLogin()}
                                        >
                                            Already have an account? Log in!
                                        </a>
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-center items-center w-full h-10">
                                    <Spinner />
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default RegisterPage;
