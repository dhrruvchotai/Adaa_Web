import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendOtpToEmail, verifyOtp, changePassword } from './API';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';

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
        <>
            <div className="container px-lg-4">
                <div className="row text-center">
                    <div className="col h1 signInText">
                        {step === 1 && 'Forgot Password'}
                        {step === 2 && 'Enter OTP'}
                        {step === 3 && 'Change Password'}
                    </div>
                </div>
                <div className="row text-center py-1">
                    <div className="col toRegister">
                        Remember your password? <Link to='/auth/login' className='text-decoration-none'>Login</Link>
                    </div>
                </div>

                {step === 1 && (
                    <div className="row pt-4 px-lg-5 pb-1 px-1">
                        <div className="col">
                            <div className="row">
                                <div className="col fw-bold fs-5">Email</div>
                            </div>
                            <div className="row px-lg-5 px-1">
                                <div className="col text-center">
                                    <input
                                        type="email"
                                        className="w-100 py-1 px-2"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    {email && !/\S+@\S+\.\S+/.test(email) && (
                                        <small className="text-danger">Please enter a valid email address</small>
                                    )}
                                </div>
                            </div>
                            <div className="row px-5 py-5">
                                <div className="col">
                                    <button
                                        className="btn btn-lg w-100 mybtn"
                                        style={{ color: "white" }}
                                        onClick={handleEmailSubmit}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                <span className="ms-2">Sending OTP...</span>
                                            </>
                                        ) : (
                                            'Send OTP'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="row pt-4 px-lg-5 pb-1 px-1">
                        <div className="col">
                            <div className="row">
                                <div className="col fw-bold fs-5">OTP</div>
                            </div>
                            <div className="row px-lg-5 px-1">
                                <div className="col text-center">
                                    <input
                                        type="text"
                                        className="w-100 py-1 px-2"
                                        placeholder="Enter the OTP sent to your email"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="row px-5 py-5">
                                <div className="col">
                                    <button
                                        className="btn btn-lg w-100 mybtn"
                                        style={{ color: "white" }}
                                        onClick={handleOtpSubmit}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                <span className="ms-2">Verifying OTP...</span>
                                            </>
                                        ) : (
                                            'Verify OTP'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="row pt-4 px-lg-5 pb-1 px-1">
                        <div className="col">
                            <div className="row">
                                <div className="col fw-bold fs-5">New Password</div>
                            </div>
                            <div className="row px-lg-5 px-1">
                                <div className="col text-center">
                                    <input
                                        type="password"
                                        className="w-100 py-1 px-2"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    {newPassword.length > 0 && newPassword.length < 6 && (
                                        <small className="text-danger">Password must be at least 6 characters long</small>
                                    )}
                                </div>
                            </div>
                            <div className="row px-5 py-5">
                                <div className="col">
                                    <button
                                        className="btn btn-lg w-100 mybtn"
                                        style={{ color: "white" }}
                                        onClick={handlePasswordSubmit}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                <span className="ms-2">Changing Password...</span>
                                            </>
                                        ) : (
                                            'Change Password'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default ForgotPassword;