import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { collection, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import SearchIcon from '../images/search.png';
import EyeIcon from '../images/eye.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../Violations.css';
import SAIRLogo from '../images/SAIRlogo.png'; 
import logoutIcon from '../images/logout.png'; 

const ViolationList = () => {
  const [violations, setViolations] = useState([]);
  const [isDetailsPopupVisible, setIsDetailsPopupVisible] = useState(false);
  const [currentViolation, setCurrentViolation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');

  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/');
    }).catch((error) => {
      console.error('Error logging out:', error);
    });
  };

  useEffect(() => {
    const fetchUserName = async () => {
      const employerUID = sessionStorage.getItem('employerUID');
      if (employerUID) {
        try {
          const userDocRef = doc(db, 'Employer', employerUID);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setCurrentUserName(docSnap.data().Fname);
          }
        } catch (error) {
          console.error('Error fetching employer data:', error);
        }
      }
    };

    const fetchViolations = () => {
      const violationCollection = collection(db, 'te2');
      const unsubscribe = onSnapshot(violationCollection, (snapshot) => {
        const violationList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setViolations(violationList);
      });
      return () => unsubscribe();
    };

    fetchUserName();
    fetchViolations();
  }, []);

  const openDetailsPopup = async (violationId) => {
    const violationDocRef = doc(db, 'te2', violationId);
    const violationDoc = await getDoc(violationDocRef);

    if (violationDoc.exists()) {
      const violationData = violationDoc.data();
      // Fetch additional data as needed
      setCurrentViolation({
        id: violationId,
        date: new Date(violationData.time.seconds * 1000).toLocaleDateString(),
        time: new Date(violationData.time.seconds * 1000).toLocaleTimeString(),
        speed: violationData.speed,
        maxSpeed: violationData.MaxSpeed,
        driverId: violationData.DriverID,
        // Add other fields as needed
      });
      setIsDetailsPopupVisible(true);
    }
  };
  
  return (
    <div className="Header"> 
    <header>
      <nav>
      <a onClick={() => navigate('/Employeehomepage')}>
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
    </header>     <div class="breadcrumb">
    <a onClick={() => navigate('/employer-home')}>Home</a>
    <span> / </span>
    <a onClick={() => navigate('/violations')}>Violations List</a>
  </div>
      <h1>Violations List</h1>
      <div className="search-container">
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Violation ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Violation Table */}
      <table className="violation-table">
        <thead>
          <tr>
            <th>Violation ID</th>
            <th>Violation Location</th>
            <th>Driver Speed</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {violations
          .filter(violation => {
            const violationDate = new Date(violation.time.seconds * 1000); // Convert Firestore timestamp
            const formattedViolationDate = violationDate.toLocaleDateString('en-GB');
            return (
              violation.id.includes(searchQuery) &&
              (!searchDate || formattedViolationDate === searchDate) // Compare formatted dates
            );
          })
          .map((violation) => (
            <tr key={violation.id}>
              <td>{violation.id}</td>
              <td>{violation.location}</td>
              <td>{violation.speed}</td>
              <td>
                <Link to={violation.id}>
                  <img
                    style={{ cursor: 'pointer' }}
                    src={EyeIcon}
                    alt="Details" 
                  />
                </Link> 
              </td>
            </tr>
          ))}
      </tbody>
      </table>

      {/* Details Popup */}
      {/* {isDetailsPopupVisible && currentViolation && (
                <div className="popup-container">
                    <div className="popup-content">
                        <span className="close-popup-btn" onClick={() => setIsDetailsPopupVisible(false)}>&times;</span>
                        <h3>Violation Details</h3>
                        <p>Violation ID: {currentViolation.id}</p>
                        <p>Date: {currentViolation.date}</p>
                        <p>Time: {currentViolation.time}</p>
                        <p>Driver Speed: {currentViolation.speed}</p>
                        <p>Street Speed: {currentViolation.maxSpeed}</p>
                        <p>Driver ID: {currentViolation.driverId}</p>
                        <p>Driver Name: {currentViolation.driverName}</p>
                        <p>Motorcycle Plate: {currentViolation.licensePlate}</p>
                        <p>Price: {currentViolation.price}</p>
                        <div style={{ height: "200px", width: "200px" }}>
                            <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
                                <GoogleMap
                                    mapContainerStyle={{ height: "100%", width: "100%" }}
                                    center={currentViolation.position}
                                    zoom={15}
                                >
                                    <Marker position={currentViolation.position} />
                                </GoogleMap>
                            </LoadScript>
                        </div>
                    </div>
                </div>
            )} */}
    </div>
  );
};

export default ViolationList;