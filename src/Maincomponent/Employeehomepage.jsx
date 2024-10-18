import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import '../App.css'; 
import SAIRLogo from '../images/SAIRlogo.png'; 
import logoutIcon from '../images/logout.png'; 
import profileIcon from '../images/Profile.PNG'; 
import driversIcon from '../images/drivers.png'; 
import motorcyclesIcon from '../images/motorcyle.png'; 
import violationsIcon from '../images/violation.png';
import complaintsIcon from '../images/complaint.png'; 
import crashesIcon from '../images/crash.png';
import back from '../images/back.jpg'; 
import { auth, db } from '../firebase'; 
import { doc, getDoc } from 'firebase/firestore'; 

const EmployeeHome = () => {
  const [userName, setUserName] = useState(''); // State for storing user's first name
  const navigate = useNavigate(); // Use navigate for redirection

  useEffect(() => {
    // Fetch the first name from the Employer collection
    const fetchUserName = async () => {
      const employerUID = sessionStorage.getItem('employerUID'); // Get the stored UID

      if (employerUID) {
        try {
          const userDocRef = doc(db, 'Employer', employerUID); // Use the UID to fetch the document
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const employerData = docSnap.data();
            console.log("Employer Data:", employerData); // Log the fetched data
            setUserName(employerData.Fname); // Set the first name from Firestore
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error('Error fetching employer data:', error);
        }
      }
    };

    fetchUserName();
  }, []);

  // Logout function to navigate back to the login page
  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/'); // Redirect to login page (Login.jsx)
    }).catch((error) => {
      console.error('Error LOGGING out:', error);
    });
  };

  // Handle redirection functions for each page
  const handleNavigation = (path) => {
    navigate(path); // Navigate to the specified path
  };

  return (
    <div className="Header"> 
      <header>
        <nav>
          <a onClick={() => handleNavigation('/Employeehomepage')}>
            <img className="logo" src={SAIRLogo} alt="SAIR Logo"/>
          </a>
          <div className="nav-links" id="navLinks">
            <ul>
              <li><a  onClick={() => navigate('/employer-home')}>Home</a></li>
              <li><a onClick={() => navigate('/violations')}>Violations List</a></li>
              <li><a onClick={() => navigate('/crashes')}>Crashes List</a></li>           
              <li><a onClick={() => navigate('/complaints')}>Complaints List</a></li>
              <li><a onClick={() => navigate('/driverslist')}>Drivers List</a></li>
              <li><a onClick={() => navigate('/motorcycleslist')}>Motorcycles List</a></li>
              <li><a onClick={() => navigate('/employee-profile')}>Profile</a></li>
            </ul>
          </div>
          <button className="logoutBu" onClick={handleLogout}>
            <img className="logout" src={logoutIcon} alt="Logout"/>
          </button>
        </nav>
      </header>
      <div className="text-box">
        <h1>SAIR Vision</h1>
        <p>
          SAIR initiative seeks to enhance road safety through advanced monitoring and ensure the safety of delivery motorcycle drivers.
          By equipping the General Department of Traffic (GDT), employers, and drivers with essential tools, it aims to reduce violations and accidents,
          promoting a safer environment for everyone on the road. The system ultimately fosters a culture of accountability and safety. 
          Through these measures, SAIR empowers all stakeholders to contribute to a safer and more efficient delivery ecosystem.
        </p>
        <a onClick={() => handleNavigation('/violations')} className="hero-btn">View Violations</a>
      </div>
    </div>
  );
};

export default EmployeeHome;
