import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { checkUser } from './API';
import Swal from 'sweetalert2';
import { useUser } from './UserContext';

function Login() {
    const [user, setUser] = useState({
        Email: '',
        Password: ''
    });
    const { setUserGlobal } = useUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Email format validation
        const isValidEmail = /\S+@\S+\.\S+/;
        if (!isValidEmail.test(user.Email)) {
            Swal.fire({
                icon: "error",
                title: "Invalid Email Format",
                text: "Please enter a valid email address.",
            });
            return;
        }

        // Password validation
        if (user.Password.length < 6) {
            Swal.fire({
                icon: "error",
                title: "Weak Password",
                text: "Password must be at least 6 characters long.",
            });
            return;
        }

        if (user.Email === '' || user.Password === '') {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Please fill in all the fields for login!",
            });
            return;
        }

        setLoading(true); // Set loading state

        try {
            const response = await checkUser(user);
            if (response.success) {
                setUserGlobal(response.user);
                Swal.fire({
                    icon: "success",
                    title: "Login Successful",
                    text: "You have logged in successfully",
                });
                if (response.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/shopping');
                }
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Login Failed",
                    text: response.message,
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong. Please try again later.",
            });
            console.error("Login error:", error);
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleFormSubmit(e);
        }
    };

    const handleForgotPassword = async (e) => {
        navigate('/auth/forgot-password')
    }

    return (
        <>
            <div className="container px-lg-4">
                <div className="row text-center">
                    <div className="col h1 signInText">
                        Sign in to your account
                    </div>
                </div>
                <div className="row text-center py-1">
                    <div className="col toRegister">
                        Don't have an account? <Link to='/auth/register' className='text-decoration-none'>Register</Link>
                    </div>
                </div>
                <div className='row pt-4 px-lg-5 pb-1 px-1'>
                    <div className='col fw-bold fs-5'>
                        Email
                    </div>
                </div>
                <div className='row px-lg-5 px-1'>
                    <div className='col text-center'>
                        <input 
                            id="emailInput"
                            type='email' 
                            className='w-100 py-1 px-2' 
                            placeholder='Enter your email'
                            onChange={(e) => setUser(prev => ({ ...prev, Email: e.target.value }))}
                            onKeyDown={handleKeyDown}
                        />
                        {user.Email && !/\S+@\S+\.\S+/.test(user.Email) && (
                            <small className="text-danger">Please enter a valid email address</small>
                        )}
                    </div>
                </div>
                <div className='row pt-4 px-lg-5 pb-1 px-1'>
                    <div className='col fw-bold fs-5'>
                        Password
                    </div>
                </div>
                <div className='row px-lg-5 px-1'>
                    <div className='col text-center'>
                        <input 
                            type='password' 
                            className='w-100 py-1 px-2' 
                            placeholder='Enter your password'
                            onChange={(e) => setUser(prev => ({ ...prev, Password: e.target.value }))}
                            onKeyDown={handleKeyDown}
                        />
                        {user.Password.length > 0 && user.Password.length < 6 && (
                            <small className="text-danger">Password must be at least 6 characters long</small>
                        )}
                    </div>
                </div>
                <div className='row px-5 py-5'>
                    <div className='col'>
                        <button 
                            className='btn btn-lg w-100 mybtn'  
                            style={{color: "white" }}
                            onClick={handleFormSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                        <button 
                            className='btn btn-lg w-100 mt-2 mybtn' 
                            style={{color: "white" }}
                            onClick={handleForgotPassword}
                            disabled={loading}
                        >
                            Forgot Password?
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;