import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { sendOtpToEmail, verifyOtp, changePassword } from './API';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';

function ForgotPassword() {
    const [user, setUser] = useState({ Email: '', OTP: '', Password: '' });
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!/\S+@\S+\.\S+/.test(user.Email)) {
            toast.error('Enter a valid email address.');
            return;
        }
        setLoading(true);
        try {
            const response = await sendOtpToEmail(user.Email);
            if (response.success) {
                toast.success('Check your email for the OTP.');
                setStep(2);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error('Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await verifyOtp(user.Email, user.OTP);
            if (response.success) {
                toast.success('Proceed to reset your password.');
                setStep(3);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error('Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (user.Password.length < 6) {
            toast.error('Password must be at least 6 characters long.');
            return;
        }
        setLoading(true);
        try {
            const response = await changePassword(user.Email, user.Password);
            if (response.success) {
                toast.success('Login with your new password.');
                navigate('/auth/login');
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error('Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container px-lg-4">
            <div className="row text-center">
                <div className="col h1 signInText">Forgot Password</div>
            </div>
            {step === 1 && (
                <>
                    <div className='row pt-4 px-lg-5 pb-1 px-1'>
                        <div className='col fw-bold fs-5'>Email</div>
                    </div>
                    <div className='row px-lg-5 px-1'>
                        <div className='col text-center'>
                            <input type='email' className='w-100 py-1 px-2' name='Email' placeholder='Enter your email' onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className='row px-5 py-5'>
                        <div className='col'>
                            <button className='btn btn-lg w-100 mybtn' onClick={handleEmailSubmit} disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </div>
                    </div>
                </>
            )}
            {step === 2 && (
                <>
                    <div className='row pt-4 px-lg-5 pb-1 px-1'>
                        <div className='col fw-bold fs-5'>OTP</div>
                    </div>
                    <div className='row px-lg-5 px-1'>
                        <div className='col text-center'>
                            <input type='text' className='w-100 py-1 px-2' name='OTP' placeholder='Enter OTP' onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className='row px-5 py-5'>
                        <div className='col'>
                            <button className='btn btn-lg w-100 mybtn' onClick={handleOtpSubmit} disabled={loading}>
                                {loading ? 'Verifying OTP...' : 'Verify OTP'}
                            </button>
                        </div>
                    </div>
                </>
            )}
            {step === 3 && (
                <>
                    <div className='row pt-4 px-lg-5 pb-1 px-1'>
                        <div className='col fw-bold fs-5'>New Password</div>
                    </div>
                    <div className='row px-lg-5 px-1'>
                        <div className='col text-center'>
                            <input type='password' className='w-100 py-1 px-2' name='Password' placeholder='Enter new password' onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className='row px-5 py-5'>
                        <div className='col'>
                            <button className='btn btn-lg w-100 mybtn' onClick={handlePasswordSubmit} disabled={loading}>
                                {loading ? 'Changing Password...' : 'Change Password'}
                            </button>
                        </div>
                    </div>
                </>
            )}
            <ToastContainer />
        </div>
    );
}

export default ForgotPassword;
