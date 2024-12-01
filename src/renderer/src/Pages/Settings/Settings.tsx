import React, { useState } from 'react';
import { useVariableContext } from '../../hooks/Variables/useVariableContext';
import { motion } from 'framer-motion';
import { Button } from '@renderer/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@renderer/components/ui/dialog';
import { Label } from '@renderer/components/ui/label';
import { Input } from '@renderer/components/ui/input';
import { useToast } from '@renderer/hooks/use-toast';
import { FaCheck } from 'react-icons/fa';
import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = () => {
    const { toast } = useToast();
    const { user } = useVariableContext();
    const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordType, setPasswordType] = useState('password');
    const [confirmPasswordType, setConfirmPasswordType] = useState('password');
    const [passwordMatch, setPasswordMatch] = useState(true);

    const handleUpdatePassword = () => {
        if (!passwordMatch) return;

        setIsSubmitting(true);

        // Simulate an API call
        setTimeout(() => {
            toast({
                className: '',
                style: {
                    borderTop: '0.35rem solid transparent',
                    borderBottom: 'transparent',
                    borderRight: 'transparent',
                    borderLeft: 'transparent',
                    borderImage: 'linear-gradient(to right, rgb(10, 27, 182), rgb(0, 0, 255))',
                    borderImageSlice: '1'
                },
                description: (
                    <div className="w-full h-full flex flex-row items-start gap-2">
                        <FaCheck className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-full p-2.5 max-w-10 w-10 max-h-8 h-8" />
                        <div className="flex flex-col">
                            <div className="font-p1_bold text-h3">
                                Password updated successfully!
                            </div>
                            <div className="font-p1_regular">Your password has been changed.</div>
                        </div>
                    </div>
                )
            });
            setShowUpdatePasswordModal(false);
            setIsSubmitting(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }, 1000);
    };

    const handlePasswordToggle = () => {
        setPasswordType((prevType) => (prevType === 'password' ? 'text' : 'password'));
    };

    const handleConfirmPasswordToggle = () => {
        setConfirmPasswordType((prevType) => (prevType === 'password' ? 'text' : 'password'));
    };

    const handleNewPasswordChange = (value: string) => {
        setNewPassword(value);
        setPasswordMatch(value === confirmPassword);
    };

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        setPasswordMatch(value === newPassword);
    };

    return (
        <motion.div
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-full bg-gray-50 overflow-auto"
        >
            <div className="max-w-4xl mx-auto my-8 p-6 w-full bg-white overflow-auto no-scrollbar rounded-lg shadow-md">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                        <img
                            className={
                                user?.avatar_url &&
                                'w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold'
                            }
                            src={user?.avatar_url}
                            alt={user?.username?.charAt(0) || 'NN'}
                        ></img>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                        <p className="text-sm text-gray-600">
                            Manage your profile and application settings.
                        </p>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                        Profile Information
                    </h2>
                    <div className="bg-gray-100 p-4 rounded-md">
                        <div className="mb-2">
                            <span className="text-gray-600">Username: </span>
                            <span className="font-medium text-gray-800">
                                {user?.username || 'N/A'}
                            </span>
                        </div>
                        <div className="mb-2">
                            <span className="text-gray-600">Email: </span>
                            <span className="font-medium text-gray-800">
                                {user?.email || 'N/A'}
                            </span>
                        </div>
                        <div className="flex flex-row w-full items-center justify-center">
                            <div
                                className="font-regular text-gray-600 underline hover:scale-105 cursor-pointer"
                                onClick={() => setShowUpdatePasswordModal(true)}
                            >
                                Update Password
                            </div>
                        </div>
                    </div>
                </div>

                {showUpdatePasswordModal && (
                    <Dialog open>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Update Password</DialogTitle>
                                <DialogDescription>
                                    Enter your current password and a new password to update your
                                    account.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mb-4">
                                <Label
                                    htmlFor="currentPassword"
                                    className="block text-gray-700 font-semibold mb-2"
                                >
                                    Current Password
                                </Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <Label
                                    htmlFor="newPassword"
                                    className="block text-gray-700 font-semibold mb-2"
                                >
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={passwordType}
                                        value={newPassword}
                                        onChange={(e) => handleNewPasswordChange(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                    <div
                                        onClick={handlePasswordToggle}
                                        className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                                    >
                                        {passwordType === 'password' ? (
                                            <MdOutlineVisibilityOff />
                                        ) : (
                                            <MdOutlineVisibility />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mb-4">
                                <Label
                                    htmlFor="confirmPassword"
                                    className="block text-gray-700 font-semibold mb-2"
                                >
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={confirmPasswordType}
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            handleConfirmPasswordChange(e.target.value)
                                        }
                                        className={`w-full p-2 border ${
                                            passwordMatch ? 'border-gray-300' : 'border-red-500'
                                        } rounded`}
                                    />
                                    <div
                                        onClick={handleConfirmPasswordToggle}
                                        className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                                    >
                                        {confirmPasswordType === 'password' ? (
                                            <MdOutlineVisibilityOff />
                                        ) : (
                                            <MdOutlineVisibility />
                                        )}
                                    </div>
                                </div>
                                {!passwordMatch && (
                                    <p className="text-red-500 text-xs mt-1">
                                        Passwords do not match
                                    </p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={() => setShowUpdatePasswordModal(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdatePassword}
                                    disabled={
                                        isSubmitting ||
                                        !passwordMatch ||
                                        !newPassword ||
                                        !confirmPassword ||
                                        !currentPassword
                                    }
                                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                                >
                                    {isSubmitting ? 'Updating...' : 'Update Password'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}

                <div className="w-full flex flex-col items-center justify-center px-20 py-5">
                    <div className="p-6 bg-gray-800 rounded-lg shadow-md text-center">
                        <h3 className="text-xl font-semibold mb-4 text-white">Did You Know?</h3>
                        <p className="text-white">
                            This VCS is designed specifically for TouchDesigner files, allowing you
                            to easily version control and collaborate on your visual projects, a
                            little assistant that reminds you of everything you have done!
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-sm text-gray-500 text-center">
                    &copy; {new Date().getFullYear()} Mariana. All rights reserved.
                </div>
            </div>
        </motion.div>
    );
};

export default Settings;
