import { useEffect, useState } from 'react';
import { doc, getDoc, getDocs, query, where, collection } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import Map from './Map';
import "../ViolationDetail.css";
import SAIRLogo from '../images/SAIRlogo.png'; 
import logoutIcon from '../images/logout.png';  
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const ViolationGeneral = () => {
  const [currentViolation, setCurrentViolation] = useState({});
  const [currentMotorCycle, setCurrentMotorCycle] = useState({});
  const { violationId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchViolationDetails = async () => {
      try {
        // Fetch violation details from the new "Violation" collection
        const violationDocRef = doc(db, 'Violation', violationId);
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

  const goBack = () => {
    navigate(-1); // Navigate back to the previous page
};

const formatDate = (time) => {
  const date = new Date(time * 1000); // Assuming timestamp is in seconds
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
  const day = date.getDate().toString().padStart(2, '0'); // Days are 1-based
  
  return `${month}/${day}/${year}`; // Format as YYYY-MM-DD
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
              <li><a className="active" onClick={() => navigate('/violations')}>Violations List</a></li>
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
        <span> / </span>
        <a onClick={() => navigate(`/violation/general/${violationId}`)}>Violation Details</a>
      </div>
      <main style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>
        <h2 className="title" style={{ fontWeight:"bold" }}>Violation Details</h2>
        {currentViolation.GPSnumber && currentMotorCycle && (
          <>
            <hr />
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  Driver ID 
  <span style={{ fontSize: '12px', color: 'gray', marginTop:"8px" }}>(National ID / Residency Number)</span>
</h3>
            <p>{currentViolation.driverID}</p>
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
        <p>{currentViolation.violationID}</p>
        <h3>Street Speed</h3>
        <p>{currentViolation.streetMaxSpeed}</p>
        <h3>Motorcycle Speed</h3>
        <p>{currentViolation.driverSpeed}</p>
        <h3>Violation Amount</h3>
        <p>{currentViolation.price} SAR</p>
        <h3>Time</h3>
        <p>{new Date(currentViolation.time * 1000).toLocaleTimeString()}</p>
        <h3>Date</h3>
        <p>{formatDate(currentViolation.time)}</p>
        <hr />
        <h3>Violation Location</h3>
        <p>{currentViolation.location}</p>
        <div className="map">
          {currentViolation.position && (
            <Map 
              lat={currentViolation.position.latitude} 
              lng={currentViolation.position.longitude} 
              placeName={currentViolation.location} 
            />
          )}
        </div>
        <div style={{marginBottom:'100px'}}>
        <Button onClick={goBack} style={{ float: 'right', marginBottom: '100px', width: 'auto',
        height: '60px', fontSize:'15px' , color:'#059855' , borderColor:'#059855'}}>                  
    <ArrowLeftOutlined style={{ marginRight: '8px' }} /> Go Back
</Button>
</div>
      </main>
    </div>
  );
};

export default ViolationGeneral;
