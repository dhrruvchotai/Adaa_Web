import Swal from "sweetalert2";
const apiUser = 'http://localhost:3001';

export const checkUserByEmail = async (email) => {
    try {
        const res = await fetch(apiUser + '/auth/users/email/' + email);
        if (res.status !== 200) {
            throw new Error('Failed to fetch user');
        }
        const data = await res.json();
        return data.exists;
    } 
    catch (error) {
        console.error('Error checking user by email:', error);
        return null;
    }
};

export const checkUserByUsername = async (username) => {
    try {
        const res = await fetch(apiUser + '/auth/users/username/' + username);
        if (res.status !== 200) {
            throw new Error('Failed to fetch user');
        }
        const data = await res.json();
        return data.exists;
    } 
    catch (error) {
        console.error('Error checking user by email:', error);
        return null;
    }
};

export const checkUserByPhone = async (phone) => {
    try {
        const res = await fetch(apiUser + '/auth/users/phone/' + phone);
        if (res.status !== 200) {
            throw new Error('Failed to fetch user');
        }
        const data = await res.json();
        return data.exists;
    } 
    catch (error) {
        console.error('Error checking user by phone:', error);
        return null;
    }
};


export const addUser = async (user, navigate) => {
    try {
        const response = await fetch(apiUser + '/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to register');
        }
        else{
            Swal.fire({
                icon: "success",
                title: "Registration Successful",
                text: "You have registered successfully",
            });
            navigate('/auth/login');
        }
    } 
    catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: error.message,
        });
    }
};

export const checkUser = async (user) => {
    try {
        const res = await fetch(apiUser + '/auth/login', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Login failed');
        }

        const data = await res.json();
        localStorage.setItem('user', data.user);
        return data;
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
};

export const sendOtpToEmail = async (email) => {
    const response = await fetch(apiUser+'/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
};

export const verifyOtp = async (email, otp) => {
    try {
        const response = await fetch(apiUser + '/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response: ', errorText);
            return { message: 'Failed to verify OTP. Please try again.' };
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Fetch error: ', error);
        return { message: 'Something went wrong. Please try again later.' };
    }
};

export const changePassword = async (email, newPassword) => {
    const response = await fetch(apiUser+'/change-password', {
        method: 'POST',
        body: JSON.stringify({ email, newPassword }),
        headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
};