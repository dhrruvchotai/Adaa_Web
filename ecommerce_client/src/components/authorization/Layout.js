import { Outlet } from 'react-router-dom';
import './style.css';

function AuthorizationLayout() {
    return (
        <>
            <div className='auth-layout'>
                <div className='row'>
                    {/* Left Section */}
                    <div className='col-md-6 col-12 d-flex flex-column justify-content-center align-items-center styleLeft'>
                        <h1 className="welcome-heading">
                            Welcome to Your Favorite Store!
                        </h1>
                        <p className="welcome-subtext">
                            Where shopping meets convenience and joy.
                        </p>
                    </div>

                    {/* Right Section */}
                    <div className='col-md-6 col-12 d-flex justify-content-center align-items-center styleRight'>
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    );
}

export default AuthorizationLayout;