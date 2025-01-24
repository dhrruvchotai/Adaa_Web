import { useState } from 'react';
import Swal from 'sweetalert2';
import { sendOtpToEmail, verifyOtp, changePassword } from './API'; // These API functions should be implemented
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // 1 - Email, 2 - OTP, 3 - Change Password
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Send OTP to user's email
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
                setStep(2); // Move to OTP verification step
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

    // Verify the OTP entered by the user
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
                setStep(3); // Move to password reset step
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

    // Change password after OTP verification
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
        <div className="container px-lg-4">
            {step === 1 && (
                <div>
                    <h1 className="text-center">Forgot Password</h1>
                    <form onSubmit={handleEmailSubmit}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Enter your email
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={loading}
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h1 className="text-center">Enter OTP</h1>
                    <form onSubmit={handleOtpSubmit}>
                        <div className="mb-3">
                            <label htmlFor="otp" className="form-label">
                                Enter the OTP sent to your email
                            </label>
                            <input
                                type="text"
                                id="otp"
                                className="form-control"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={loading}
                        >
                            {loading ? 'Verifying OTP...' : 'Verify OTP'}
                        </button>
                    </form>
                </div>
            )}

            {step === 3 && (
                <div>
                    <h1 className="text-center">Change Password</h1>
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="mb-3">
                            <label htmlFor="newPassword" className="form-label">
                                Enter new password
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                className="form-control"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={loading}
                        >
                            {loading ? 'Changing Password...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default ForgotPassword;
