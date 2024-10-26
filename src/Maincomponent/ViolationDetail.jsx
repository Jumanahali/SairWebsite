import { useEffect, useState } from 'react';
import { getDocs, query, where, collection } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import Map from './Map';
import "../ViolationDetail.css";
import SAIRLogo from '../images/SAIRlogo.png'; 
import logoutIcon from '../images/logout.png'; 
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const ViolationDetail = () => {
  const [violations, setViolations] = useState([]);
  const [motorcycleData, setMotorcycleData] = useState({});
  const { driverId } = useParams(); // Get driver ID from URL
  const navigate = useNavigate();

  useEffect(() => {
    const fetchViolationsByDriver = async () => {
      try {
        console.log('Querying violations for Driver ID:', driverId);
        
        // Use 'driverID' to match the field in the Firestore collection
        const violationsQuery = query(collection(db, 'Violation'), where('driverID', '==', driverId));
        const querySnapshot = await getDocs(violationsQuery);
        
        console.log('Query result:', querySnapshot.docs); // Check the results
  
        const violationsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        console.log('Violations fetched:', violationsList);
        setViolations(violationsList);
  
        // Fetch motorcycle data if necessary
        if (violationsList.length > 0 && violationsList[0].GPSnumber) {
          const motorcycleQuery = query(
            collection(db, 'Motorcycle'),
            where('GPSnumber', '==', violationsList[0].GPSnumber)
          );
          const motorcycleSnapshot = await getDocs(motorcycleQuery);
          setMotorcycleData(motorcycleSnapshot.docs[0]?.data() || {});
        }
      } catch (error) {
        console.error('Error fetching violations:', error);
      }
    };
  
    fetchViolationsByDriver();
  }, [driverId]);

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/'); // Redirect to login page
    }).catch((error) => {
      console.error('Error LOGGING out:', error);
    });
  };
  const goBack = () => {
    navigate(-1); // Navigate back to the previous page
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
              <li><a className="active" onClick={() => navigate('/driverslist')}>Drivers List</a></li>
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
        <a onClick={() => navigate('/driverslist')}>Driver List</a>
        <span> / </span>
        <a onClick={() => navigate('/driver-details/:driverId')}>Drivers Details</a>
        <span> / </span>
         <a onClick={() => navigate(`/violation/detail/${driverId}`)}>Violation Details</a>
      </div>
      <main style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>
        <h2 className="title">Violation Details for Driver ID: {driverId}</h2>
        {violations.map((violation, index) => (
          <div key={violation.id}>
            <hr />
            <h3 style={{ color: "#059855", fontSize: "20px", fontWeight: "bold" }}>
              Violation {index + 1}
            </h3>
            <h3>Motorcycle License Plate</h3>
            <p>{motorcycleData.LicensePlate || 'Not Available'}</p>
            <h3>Violation ID</h3>
            <p>{violation.ViolationID}</p>
            <h3>Street Speed</h3>
            <p>{violation.streetMaxSpeed} km/h</p>
            <h3>Motorcycle Speed</h3>
            <p>{violation.driverSpeed} km/h</p>
            <h3>Violation Price</h3>
            <p>{violation.price} SAR</p>
            <h3>Time</h3>
            <p>{new Date(violation.time * 1000).toLocaleTimeString()}</p>
            <h3>Date</h3>
            <p>{new Date(violation.time * 1000).toLocaleDateString('en-US')}</p>
            <h3>Violation Location</h3>
            <p>{violation.location}</p>
            <div className="map">
              {violation.position && 
              <Map lat={violation.position.latitude} lng={violation.position.longitude} />}
            </div>
            <hr />
          </div>
        ))}
            <Button onClick={goBack} style={{ float: 'right', width: 'auto',
        height: '60px', fontSize:'15px', marginTop:'-8px' }}>           
    <ArrowLeftOutlined style={{ marginRight: '8px' }} /> Go Back
</Button>
      </main>
  
    </div>
  );
};

export default ViolationDetail;