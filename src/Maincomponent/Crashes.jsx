import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import SAIRLogo from '../images/SAIRlogo.png'; // Adjust the path as necessary
import logoutIcon from '../images/logout.png'; // Adjust the path as necessary
import { db, auth } from '../firebase';

const CrashList = () => {
    const navigate = useNavigate(); // Initialize navigate

    const handleLogout = () => {
        // Handle logout logic here
        auth.signOut()
            .then(() => navigate('/'))
            .catch((error) => console.error('Error LOGGING out:', error));
    };

    return (
        <div className="Header">
            <header>
                <nav>
                    <a onClick={() => navigate('/Employeehomepage')}>
                        <img className="logo" src={SAIRLogo} alt="SAIR Logo" />
                    </a>
                    <div className="nav-links" id="navLinks">
                        <ul>
                            <li><a onClick={() => navigate('/employer-home')}>Home</a></li>
                            <li><a onClick={() => navigate('/violations')}>Violations List</a></li>
                            <li><a className="active" onClick={() => navigate('/crashes')}>Crashes List</a></li>
                            <li><a  onClick={() => navigate('/complaints')}>Complaints List</a></li>
                            <li><a onClick={() => navigate('/driverslist')}>Drivers List</a></li>
                            <li><a onClick={() => navigate('/motorcycleslist')}>Motorcycles List</a></li>
                            <li><a onClick={() => navigate('/employee-profile')}>Profile</a></li>
                        </ul>
                    </div>
                    <button className="logoutBu" onClick={handleLogout}>
                        <img className="logout" src={logoutIcon} alt="Logout" />
                    </button>
                </nav>
            </header>
            <div className="breadcrumb">
                <a onClick={() => navigate('/employer-home')}>Home</a>
                <span> / </span>
                <a onClick={() => navigate('/crashes')}>Crashes List</a>
            </div>
            <h1 style={{ color:'gray' ,padding: '100px', textAlign: 'center', margin: 0 }}>This is a Crashes List page. It will be done at sprint 2</h1>

        </div>

    );
};

export default CrashList;