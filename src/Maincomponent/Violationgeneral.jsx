
import { useEffect, useState } from 'react'
import { doc, getDoc, getDocs, query, where, collection } from 'firebase/firestore'
import { useParams , useNavigate } from 'react-router-dom'
import { db } from '../firebase';
import Map from './Map';
import "../ViolationDetail.css"
import SAIRLogo from '../images/SAIRlogo.png'; 
import logoutIcon from '../images/logout.png';  

const ViolationGeneral = () => {
  const [currentViolation, setCurrentViolation] = useState({});
  const [currentMotorCycle, setCurrentMotorCycle] = useState({});
  const { violationId } = useParams();
  const navigate = useNavigate(); // Ensure navigate is defined

  useEffect(() => {
    const fetchViolationDetails = async () => {
      try {
        // Fetch violation details
        const violationDocRef = doc(db, 'te2', violationId);
        const violationDoc = await getDoc(violationDocRef);

        if (violationDoc.exists()) {
          const violationData = violationDoc.data();
          setCurrentViolation(violationData);

          // Fetch motorcycle details if GPS number is available
          if (violationData.GPSnumber) {
            const q = query(collection(db, "Motorcycle"), where("GPSnumber", "==", violationData.GPSnumber));
            const querySnapshot = await getDocs(q);
            setCurrentMotorCycle(querySnapshot.docs[0]?.data() || {});
          }
        }
      } catch (error) {
        console.error("Error fetching violation details:", error);
      }
    };

    fetchViolationDetails();
  }, [violationId]);

  const handleLogout = () => {
    // Implement your logout logic here
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
    
      <div className="breadcrumb">
        <a onClick={() => navigate('/employer-home')}>Home</a>
        <span> / </span>
        <a onClick={() => navigate('/violations')}>Violations List</a>
      </div>
      <main>
        <h2 className="title">Violation Details</h2>
        {currentViolation.GPSnumber && currentMotorCycle && (
          <>
            <hr />
            <h3>Driver ID</h3>
            <p>{currentViolation.DriverID}</p>
            <h3>Motorcycle License Plate</h3>
            <p>{currentMotorCycle.LicensePlate}</p>
            <h3>GPS Serial Number</h3>
            <p>{currentMotorCycle.GPSnumber}</p>
            <h3>Motorcycle Type</h3>
            <p>{currentMotorCycle.Type}</p>
            <h3>Motorcycle Brand</h3>
            <p>{currentMotorCycle.Brand}</p>
            <h3>Motorcycle Model</h3>
            <p>{currentMotorCycle.Model}</p>
          </>
        )}
        <hr />
        <h3>Violation ID</h3>
        <p>{currentViolation.ViolationID}</p>
        <h3>Street Speed</h3>
        <p>{currentViolation.MaxSpeed}</p>
        <h3>Motorcycle Speed</h3>
        <p>{currentViolation.speed}</p>
        <h3>Violation Price</h3>
        <p>{currentViolation.price} SAR</p>
        <h3>Time</h3>
        <p>{new Date(currentViolation.time * 1000).toLocaleTimeString()}</p>
        <h3>Date</h3>
        <p>{new Date(currentViolation.time * 1000).toLocaleDateString('en-US')}</p>
        <hr />
        <h3>Violation Location</h3>
        <p>{currentViolation.location}</p>
        <div className="map">
          {currentViolation?.position && <Map lat={currentViolation.position?.y} lng={currentViolation.position?.x} />}
        </div>
      </main>
    </div>
  );
};

export default ViolationGeneral;