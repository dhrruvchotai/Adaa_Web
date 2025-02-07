import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { addUser, checkUserByEmail, checkUserByUsername, checkUserByPhone } from './API';
import Swal from 'sweetalert2';

function Register() {
    const [user, setUser] = useState({
        Username: '',
        Email: '', 
        Password: '',
        Phone: '',
        Role: 'user'
    });

    const [emailValid, setEmailValid] = useState(true);
    const [passwordValid, setPasswordValid] = useState(true);
    const [phoneValid, setPhoneValid] = useState(true);
    const [loading, setLoading] = useState(false);


    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);

    const [passwordError, setPasswordError] = useState("");
    
    const isValidPassword = (password) => {
        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters long.");
            return false;
        } else if (!/[A-Z]/.test(password)) {
            setPasswordError("Password must contain at least one uppercase letter.");
            return false;
        } else if (!/[a-z]/.test(password)) {
            setPasswordError("Password must contain at least one lowercase letter.");
            return false;
        } else if (!/\d/.test(password)) {
            setPasswordError("Password must contain at least one digit.");
            return false;
        } else if (!/[@$!%*?&]/.test(password)) {
            setPasswordError("Password must contain at least one special character (@$!%*?&).");
            return false;
        }

        // ✅ Clear the error when all conditions are met
        setPasswordError("");
        return true;
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setUser((prev) => ({ ...prev, Password: password }));
        isValidPassword(password);
    };

    const navigate = useNavigate();

    const handleEmailChange = (e) => {
        const email = e.target.value;
        setUser((prev) => ({ ...prev, Email: email }));
        setEmailValid(isValidEmail(email));
    };



    const handlePhoneChange = (e) => {
        const phone = e.target.value;
        setUser((prev) => ({ ...prev, Phone: phone }));
        setPhoneValid(isValidPhone(phone));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        setLoading(true); 

        // Check if any field is empty
        if (user.Username === '' || user.Email === '' || user.Password === '' || user.Phone === '') {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please fill in all the fields for registration!',
            });
            return;
        }

        // Check email validity
        if (!isValidEmail(user.Email)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Email',
                text: 'Please enter a valid email address!',
            });
            return;
        }

        // Check password validity
        if (!isValidPassword(user.Password)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Password',
                text: 'Password must be at least 6 characters long!',
            });
            return;
        }

        // Check phone number validity
        if (!isValidPhone(user.Phone)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Phone Number',
                text: 'Phone number must be exactly 10 digits!',
            });
            return;
        }

        // Check if email already exists
        const userEmail = await checkUserByEmail(user.Email);
        if (userEmail) {
            Swal.fire({
                icon: 'error',
                title: 'Email Already Exists',
                text: 'The email address is already registered!',
            });
            return;
        }

        // Check if username already exists
        const userName = await checkUserByUsername(user.Username);
        if (userName) {
            Swal.fire({
                icon: 'error',
                title: 'Username Already Exists',
                text: 'The username is already taken!',
            });
            return;
        }

        const phoneExists = await checkUserByPhone(user.Phone);
    
        if (phoneExists) {
            Swal.fire({
                icon: 'error',
                title: 'Phone number already in use',
                text: 'The phone number is already registered.',
            });
            return;
        }

        // Add user if validation passes
        await addUser(user, navigate);
        Swal.fire({
            icon: 'success',
            title: 'Registration Successful',
            text: 'You have successfully created an account!',
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleFormSubmit(e);
        }
    };

    return (
        <>
            <div className="container px-4">
                <div className="row text-center">
                    <div className="col h1 signInText ">
                        Create New Account
                    </div>
                </div>
                <div className="row text-center py-1">
                    <div className="col toRegister">
                        Already have an account? <Link to='/auth/login' className='text-decoration-none'>Login</Link>
                    </div>
                </div>

                {/* Username Field */}
                <div className='row pt-4 px-5 pb-1'>
                    <div className='col fw-bold fs-5'>Username</div>
                </div>
                <div className='row px-5'>
                    <div className='col text-center'>
                        <input
                            type='text'
                            className='w-100 py-1 px-2 myinput'
                            placeholder='Enter your username'
                            onChange={(e) => setUser(prev => ({ ...prev, Username: e.target.value }))}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                </div>

                {/* Email Field */}
                <div className='row pt-4 px-5 pb-1'>
                    <div className='col fw-bold fs-5'>Email</div>
                </div>
                <div className='row px-5'>
                    <div className='col text-center'>
                        <input
                            type='email'
                            className='w-100 py-1 px-2 myinput'
                            placeholder='Enter your email'
                            onChange={handleEmailChange}
                            onKeyDown={handleKeyDown}
                        />
                        {!emailValid && (
                            <div className='text-start text-danger'>
                                Please enter a valid email address!
                            </div>
                        )}
                    </div>
                </div>

                {/* Password Field */}
                <div className='row pt-4 px-5 pb-1'>
                    <div className='col fw-bold fs-5'>Password</div>
                </div>
                <div className='row px-5'>
                    <div className='col text-center'>
                        <input
                            type='password'
                            className='w-100 py-1 px-2 myinput'
                            placeholder='Enter your password'
                            onChange={handlePasswordChange}
                            onKeyDown={handleKeyDown}
                        />
                       {passwordError && (
                            <div className='text-start text-danger'>
                                {passwordError}
                            </div>
                        )}
                    </div>
                </div>

                {/* Phone Field */}
                <div className='row pt-4 px-5 pb-1'>
                    <div className='col fw-bold fs-5'>Phone</div>
                </div>
                <div className='row px-5'>
                    <div className='col text-center'>
                        <input
                            type='text'
                            className='w-100 py-1 px-2 myinput'
                            placeholder='Enter your phone number'
                            onChange={handlePhoneChange}
                            onKeyDown={handleKeyDown}
                        />
                        {!phoneValid && (
                            <div className='text-start text-danger'>
                                Phone number must be exactly 10 digits!
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className='row px-5 py-5'>
                    <div className='col'>
                        <button 
                            className='btn-lg w-100 mybtn fw-medium fs-5'  
                            style={{ color: "white" }}
                            onClick={handleFormSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                    <span className="ms-2">Registering....</span>
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Register;