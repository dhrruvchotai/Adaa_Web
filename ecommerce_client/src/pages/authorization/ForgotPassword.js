import { useState } from 'react';
import Swal from 'sweetalert2';
import { sendOtpToEmail, verifyOtp, changePassword } from './API';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { KeyRound, Mail, Lock } from 'lucide-react';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!/\S+@\S+\.\S+/.test(email)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Email Format',
                text: 'Please enter a valid email address.',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await sendOtpToEmail(email);
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'OTP Sent',
                    text: 'An OTP has been sent to your email.',
                });
                setStep(2);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to Send OTP',
                    text: response.message,
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Something went wrong. Please try again later.',
            });
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
                Swal.fire({
                    icon: 'success',
                    title: 'OTP Verified',
                    text: 'OTP has been verified. You can now reset your password.',
                });
                setStep(3);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid OTP',
                    text: response.message,
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Something went wrong. Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            Swal.fire({
                icon: 'error',
                title: 'Weak Password',
                text: 'Password must be at least 6 characters long.',
            });
            return;
        }
    
        setLoading(true);
        try {
            const response = await changePassword(email, newPassword);
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Password Changed',
                    text: 'Your password has been successfully changed.',
                });
                navigate('/auth/login');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to Change Password',
                    text: response.message,
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Something went wrong. Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <div className="step-indicator">
                    <div className={`step ${step >= 1 ? 'active' : ''}`} />
                    <div className={`step ${step >= 2 ? 'active' : ''}`} />
                    <div className={`step ${step >= 3 ? 'active' : ''}`} />
                </div>

                {step === 1 && (
                    <div>
                        <h1 className="forgot-password-title">Forgot Password</h1>
                        <form onSubmit={handleEmailSubmit}>
                            <div className="input-group">
                                <label htmlFor="email" className="input-label">
                                    <Mail className="inline-block w-5 h-5 mr-2" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="input-field"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    'Send OTP'
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h1 className="forgot-password-title">Enter OTP</h1>
                        <form onSubmit={handleOtpSubmit}>
                            <div className="input-group">
                                <label htmlFor="otp" className="input-label">
                                    <KeyRound className="inline-block w-5 h-5 mr-2" />
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    id="otp"
                                    className="input-field"
                                    placeholder="Enter the OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner" />
                                        Verifying OTP...
                                    </>
                                ) : (
                                    'Verify OTP'
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h1 className="forgot-password-title">Reset Password</h1>
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="input-group">
                                <label htmlFor="newPassword" className="input-label">
                                    <Lock className="inline-block w-5 h-5 mr-2" />
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    className="input-field"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner" />
                                        Changing Password...
                                    </>
                                ) : (
                                    'Change Password'
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;