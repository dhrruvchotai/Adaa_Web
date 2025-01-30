import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { sendOtpToEmail, verifyOtp, changePassword } from './API';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // 1 - Email, 2 - OTP, 3 - Change Password
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!/\S+@\S+\.\S+/.test(email)) {
            toast.error('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            const response = await sendOtpToEmail(email);
            if (response.success) {
                toast.success('An OTP has been sent to your email.');
                setStep(2); // Move to OTP verification step
            } else {
                toast.error(response.message || 'Failed to send OTP.');
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await verifyOtp(email, otp);
            if (response.success) {
                toast.success('OTP has been verified. You can now reset your password.');
                setStep(3); // Move to password reset step
            } else {
                toast.error(response.message || 'Invalid OTP.');
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        try {
            const response = await changePassword(email, newPassword);
            if (response.success) {
                toast.success('Your password has been successfully changed.');
                navigate('/auth/login');
            } else {
                toast.error(response.message || 'Failed to change password.');
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <ToastContainer position="top-center" autoClose={3000} theme="dark" />
            <motion.div
                className="w-full max-w-md bg-gray-900 rounded-lg shadow-lg p-8"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-2xl font-bold text-center mb-6">Forgot Password</h1>
                        <form onSubmit={handleEmailSubmit}>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                    Enter your email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-600"
                                disabled={loading}
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-2xl font-bold text-center mb-6">Enter OTP</h1>
                        <form onSubmit={handleOtpSubmit}>
                            <div className="mb-4">
                                <label htmlFor="otp" className="block text-sm font-medium mb-2">
                                    Enter the OTP sent to your email
                                </label>
                                <input
                                    type="text"
                                    id="otp"
                                    className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-600"
                                disabled={loading}
                            >
                                {loading ? 'Verifying OTP...' : 'Verify OTP'}
                            </button>
                        </form>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-2xl font-bold text-center mb-6">Change Password</h1>
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="mb-4">
                                <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                                    Enter new password
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-600"
                                disabled={loading}
                            >
                                {loading ? 'Changing Password...' : 'Change Password'}
                            </button>
                        </form>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

export default ForgotPassword;