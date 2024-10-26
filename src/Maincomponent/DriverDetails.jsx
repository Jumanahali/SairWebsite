import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import SAIRLogo from '../images/SAIRlogo.png'; 
import logoutIcon from '../images/logout.png';  
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const DriverDetails = () => {
    const { driverId } = useParams();
    const navigate = useNavigate();
    const [driverDetails, setDriverDetails] = useState(null);
    const [motorcycles, setMotorcycles] = useState([]);
    const [violations, setViolations] = useState([]);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDriverDetails = async () => {
            try {
                const driverQuery = query(collection(db, 'Driver'), where('DriverID', '==', driverId));
                const querySnapshot = await getDocs(driverQuery);

                if (!querySnapshot.empty) {
                    const driverData = querySnapshot.docs[0].data();
                    setDriverDetails(driverData);

                    // Fetch motorcycles and violations
                    await fetchMotorcycles(driverData.GPSnumber);
                    await fetchViolations(driverData.DriverID);
                } else {
                    setError('No driver found with this ID.');
                }
            } catch (error) {
                setError('Failed to fetch driver details.');
            }
        };

        const fetchMotorcycles = async (gpsNumber) => {
            try {
                const motorcycleQuery = query(collection(db, 'Motorcycle'), where('GPSnumber', '==', gpsNumber));
                const motorcycleSnapshot = await getDocs(motorcycleQuery);
                const motorcyclesData = motorcycleSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setMotorcycles(motorcyclesData);
            } catch (error) {
                setError('Failed to fetch motorcycle details.');
            }
        };

        const fetchViolations = async (driverID) => {
            try {
                const violationsQuery = query(collection(db, 'Violation'), where('driverID', '==', driverID));
                const violationsSnapshot = await getDocs(violationsQuery);
                const violationsData = violationsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setViolations(violationsData);
            } catch (error) {
                console.error("Error fetching violations:", error);
            }
        };

        fetchDriverDetails();
    }, [driverId]);

    const handleLogout = () => {
        navigate('/login');
    };

    const handleViewViolations = () => {
        if (violations.length > 0) {
            navigate(`/violation/detail/${driverId}`);
        } else {
            setIsPopupVisible(true); // Show popup if no violations exist
        }
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
                <a onClick={() => navigate('/driverslist')}>Drivers List</a>
                <span> / </span>
                <span>Driver Details</span>
            </div>

            <main style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>
                <h2 className="title">Driver Details</h2>
                <hr />
                {error ? (
                    <p>{error}</p>
                ) : driverDetails ? (
                    <>
                        <h3>Driver ID </h3>
                        <p>{driverDetails.DriverID}</p>
                        <h3>Name</h3>
                        <p>{`${driverDetails.Fname} ${driverDetails.Lname}`}</p>
                        <h3>Phone Number</h3>
                        <p>{driverDetails.PhoneNumber}</p>
                        <h3>Email</h3>
                        <p>{driverDetails.Email}</p>
                        <h3>GPS Number</h3>
                        <p>{driverDetails.GPSnumber}</p>
                        <h3>Company Name</h3>
                        <p>{driverDetails.CompanyName}</p>
                    <br/>

                        <h3 style={{
        color: '#059855',
        fontSize: '32px',
        margin: '20px 0',
    }}>Motorcycles Details</h3>
                        <hr />
                        {motorcycles.length > 0 ? (
                            motorcycles.map((motorcycle, index) => (
                                <div key={index}>
                                    <h3>Motorcycle ID</h3>
                                    <p>{motorcycle.MotorcycleID}</p>
                                    <h3>Motorcycle GPS Number</h3>
                                    <p>{motorcycle.GPSnumber}</p>
                                    <h3>Motorcycle Brand</h3>
                                    <p>{motorcycle.Brand}</p>
                                    <h3>Motorcycle Model</h3>
                                    <p>{motorcycle.Model}</p>
                                    <h3>Motorcycle License Plate</h3>
                                    <p>{motorcycle.LicensePlate}</p>
                                    <h3>Motorcycle Type</h3>
                                    <p>{motorcycle.Type}</p>
                                    <hr />
                                </div>
                            ))
                        ) : (
                            <p>No motorcycles associated with this driver.</p>
                        )}
                        
                        <button onClick={handleViewViolations} style={{
        backgroundColor: '#059855',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        alignItems: 'center',
        cursor: 'pointer',
        padding: '20px 10px',
        width: 'auto',
        height: '60px',
        fontFamily: 'Open Sans',
    }}>    <i className="fas fa-eye" style={{ marginRight: '8px' }}></i>

                            View Violations
                        </button>
                
                        <Button onClick={goBack} style={{ float: 'right', margin: '10px', width: 'auto',
        height: '60px', fontSize:'15px' }}>                    
    <ArrowLeftOutlined style={{ marginRight: '8px' }} /> Go Back
</Button>
                    </>
                ) : null}
            </main>

            {isPopupVisible && (
    <div className="popup-container">
        <div>
            <span className="close-popup-btn" onClick={() => setIsPopupVisible(false)}>&times;</span>
            <p>This driver has no violations.</p>
        </div>
    </div>
)}
        </div>
    );
};

export default DriverDetails;