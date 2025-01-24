import { Outlet } from 'react-router-dom';
import './style.css';

function AuthorizationLayout() {
    return (
        <>
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-6 d-flex flex-column justify-content-center align-items-center styleLeft'>
                        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
                            Welcome to Your Favorite Store!
                        </h1>
                        <p style={{ fontSize: "1.2rem", fontWeight: "lighter", maxWidth: "80%", color: "orange" }}>
                            Where shopping meets convenience and joy.
                        </p>
                    </div>
                    <div className='col-6 d-flex justify-content-center align-items-center styleRight'>
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    );
}

export default AuthorizationLayout;