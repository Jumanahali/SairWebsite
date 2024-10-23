import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import '../App.css'; 
import SAIRLogo from '../images/SAIRlogo.png'; 
import logoutIcon from '../images/logout.png'; 
import { auth, db } from '../firebase'; 
import { doc, getDoc } from 'firebase/firestore'; 
import homeBackground from '../images/homebackground7.png'; // Ensure this path is correct

const EmployeeHome = () => {
  const [userName, setUserName] = useState(''); // State for storing user's first name
  const navigate = useNavigate(); // Use navigate for redirection

  const styles = {
    backgroundImage: `url(${homeBackground})`,
    backgroundSize: '100%', // Ensures the image covers the entire background
    backgroundPosition: 'center', // Centers the image
    height: '100vh', // Sets the height to full viewport height
    width: '100%', // Ensures it takes the full width
  };

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
    <div style={styles}>
      <div className="Header">
        <header>
          <nav>
            <a onClick={() => handleNavigation('/Employeehomepage')}>
              <img className="logo" src={SAIRLogo} alt="SAIR Logo" />
            </a>
            <div className="nav-links" id="navLinks">
              <ul>
                <li><a class="active" onClick={() => navigate('/employer-home')}>Home</a></li>
                <li><a onClick={() => navigate('/violations')}>Violations List</a></li>
                <li><a onClick={() => navigate('/crashes')}>Crashes List</a></li>
                <li><a onClick={() => navigate('/complaints')}>Complaints List</a></li>
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
        <div className="text-box">
          <br/>
        <h1 style={{ color: '#059855' }}>SAIR Vision</h1>
           <p style={{ fontSize: '20px' ,color:"black" }}>
           The SAIR initiative aims to enhance road safety and protect delivery motorcycle drivers by providing 
           the General Department of Traffic (GDT), employers, and drivers with essential monitoring tools. 
           This initiative seeks to reduce violations and accidents, fostering a safer environment for all 
           road users. Ultimately, SAIR promotes a culture of accountability and empowers stakeholders to 
           contribute to a safer and more efficient delivery ecosystem.
           </p>
           <br/><br/><br/><br/>
          <h1 style={{ color: '#059855' }}>SAIR Mission</h1>
           <p style={{ fontSize: '20px' ,color:"black" }}>
           The mission of the SAIR initiative is to enhance road safety and reduce traffic violations by providing 
           advanced monitoring technologies. We aim to equip the General Department of Traffic (GDT), 
           employers, and delivery motorcycle drivers with essential tools to ensure compliance and create 
           a safer, more efficient delivery ecosystem for all road users.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHome;