import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, query, collection, where, onSnapshot , getDocs} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Form, Input, Button, notification, Card, Row, Col, Select } from 'antd';
import styles from '../DriverList.module.css';
import successImage from '../images/Sucess.png'; 
import errorImage from '../images/Error.png'; 
import SAIRLogo from '../images/SAIRlogo.png'; 
import logoutIcon from '../images/logout.png'; 

const EditDriver = () => {
    const { driverId } = useParams();
    const navigate = useNavigate();
    const [driverData, setDriverData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [availableMotorcycles, setAvailableMotorcycles] = useState([]);
    const [isNotificationVisible, setIsNotificationVisible] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Fetch the driver's data based on driverId
    useEffect(() => {
        const fetchDriverData = async () => {
            try {
                const driverDocRef = doc(db, 'Driver', driverId);
                const driverDoc = await getDoc(driverDocRef);
                if (driverDoc.exists()) {
                    const driverData = driverDoc.data();
                    const employerUID = sessionStorage.getItem('employerUID');
                    const companyName = await fetchCompanyName(employerUID);
                    
                    setDriverData({
                        ...driverData,
                        CompanyName: companyName // Include CompanyName
                    });

                    // Fetch available motorcycles after driver data is set
                    fetchAvailableMotorcycles(companyName);
                } else {
                    notification.error({ message: 'Driver not found' });
                }
            } catch (error) {
                console.error('Error fetching driver data:', error);
                notification.error({ message: 'Error fetching driver data.' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchDriverData();
    }, [driverId]);

    // Function to fetch company name based on employerUID
    const fetchCompanyName = async (employerUID) => {
        try {
            const companyDocRef = doc(db, 'Employer', employerUID);
            const companyDoc = await getDoc(companyDocRef);
            if (companyDoc.exists()) {
                const data = companyDoc.data();
                return data.CompanyName; // Return the CompanyName field
            } else {
                console.error('No such document!');
                return '';
            }
        } catch (error) {
            console.error('Error fetching company name:', error);
            return '';
        }
    };

    // Fetch available motorcycles based on company name
    const fetchAvailableMotorcycles = async (companyName) => {
        try {
            const motorcycleQuery = query(
                collection(db, 'Motorcycle'),
                where('CompanyName', '==', companyName),
                where('available', '==', true)
            );

            onSnapshot(motorcycleQuery, (snapshot) => {
                const bikes = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    GPSnumber: doc.data().GPSnumber,
                }));
                setAvailableMotorcycles(bikes);
            });
        } catch (error) {
            console.error('Error fetching motorcycles:', error);
        }
    };

    // Handle driver update
    const handleUpdateDriver = async (values) => {
        try {
            const driverDocRef = doc(db, 'Driver', driverId);
            const updatedData = {
                ...driverData,
                ...values,
                CompanyName: driverData.CompanyName,
                available: values.GPSnumber && values.GPSnumber !== "None" ? false : true // Set based on motorcycle assignment
            };
            
            // Update the driver document
            await setDoc(driverDocRef, updatedData);
    
            // If a GPS number is selected, update the corresponding motorcycle
            if (values.GPSnumber && values.GPSnumber !== "None") {
                const motorcycleQuery = query(
                    collection(db, 'Motorcycle'),
                    where('GPSnumber', '==', values.GPSnumber)
                );
                const querySnapshot = await getDocs(motorcycleQuery);
    
                if (!querySnapshot.empty) {
                    const motorcycleDocRef = querySnapshot.docs[0].ref; // Get the document reference
                    // Update the DriverID and available fields in the motorcycle document
                    await setDoc(motorcycleDocRef, {
                        DriverID: values.DriverID, // Set the DriverID to the driver's ID
                        available: false // Set motorcycle's available field to false
                    }, { merge: true }); // Merge to avoid overwriting other fields
                } else {
                    console.error(`No motorcycle found with GPS number: ${values.GPSnumber}`);
                }
            }
    
            // Show success notification
            setNotificationMessage("Driver updated successfully!");
            setIsSuccess(true);
            setIsNotificationVisible(true);
        } catch (error) {
            console.error('Error updating driver:', error);
            setNotificationMessage("Error updating driver: " + error.message);
            setIsSuccess(false);
            setIsNotificationVisible(true);
        }
    };

    const handleLogout = () => {
        auth.signOut().then(() => {
            navigate('/'); // Redirect to login page
        }).catch((error) => {
            console.error('Error LOGGING out:', error);
        });
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
                        <img className="logout" src={logoutIcon} alt="Logout"/>
                    </button>
                </nav>
            </header>     
            <div className="breadcrumb">
                <a onClick={() => navigate('/employer-home')}>Home</a>
                <span> / </span>
                <a onClick={() => navigate('/driverslist')}>Driver List</a>
                <span> / </span>
                <a onClick={() => navigate(`/edit-driver/${driverId}`)}>Edit Driver</a>
            </div>
            <div>
                <div className="driver-list-header-container">
                    <h1  style={{fontWeight:"bold"}} >Edit Driver</h1>
                </div>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    marginTop: '-60px',
                    marginBottom: '20px' 
                }}>
                    <Card className={styles.card__Wrapper} style={{ width: '900px', height: 'auto' }}>
                        {isLoading ? (
                            <p>   </p>
                        ) : (
                            <Form
                                layout="vertical"
                                onFinish={handleUpdateDriver}
                                initialValues={driverData}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px', 
                                    marginBottom: '20px',
                                    fontFamily: 'Open Sans',
                                }}
                            >
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label={
                                                <span style={{
                                                    display: 'block',
                                                    marginBottom: '5px',
                                                    fontWeight: 'bold',
                                                    color: '#059855',
                                                    fontFamily: 'Open Sans',
                                                    fontSize: '16px'
                                                }}>
                                                    First Name
                                                </span>
                                            }
                                            name="Fname"
                                            rules={[{ required: true, message: 'First name is required.' }]}
                                        >
                                            <Input style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #059855',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                            }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label={
                                                <span style={{
                                                    display: 'block',
                                                    marginBottom: '5px',
                                                    fontWeight: 'bold',
                                                    color: '#059855',
                                                    fontFamily: 'Open Sans',
                                                    fontSize: '16px'
                                                }}>
                                                    Last Name
                                                </span>
                                            }
                                            name="Lname"
                                            rules={[{ required: true, message: 'Last name is required.' }]}
                                        >
                                            <Input style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #059855',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                            }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label={
                                                <span style={{
                                                    display: 'block',
                                                    marginBottom: '5px',
                                                    fontWeight: 'bold',
                                                    color: '#059855',
                                                    fontFamily: 'Open Sans',
                                                    fontSize: '16px'
                                                }}>
                                                    Phone Number
                                                </span>
                                            }
                                            name="PhoneNumber"
                                            rules={[{ required: true, message: 'Phone number is required.' }]}
                                        >
                                            <Input style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #059855',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                            }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label={
                                                <span style={{
                                                    display: 'block',
                                                    marginBottom: '5px',
                                                    fontWeight: 'bold',
                                                    color: '#059855',
                                                    fontFamily: 'Open Sans',
                                                    fontSize: '16px'
                                                }}>
                                                    Email
                                                </span>
                                            }
                                            name="Email"
                                            rules={[{ required: true, message: 'Email is required.' }]}
                                        >
                                            <Input style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #059855',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                            }} disabled />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label={
                                                <span style={{
                                                    display: 'block',
                                                    marginBottom: '5px',
                                                    fontWeight: 'bold',
                                                    color: '#059855',
                                                    fontFamily: 'Open Sans',
                                                    fontSize: '16px'
                                                }}>
                                                    Driver ID  (National ID / Residency Number)
                                                </span>
                                            }
                                            name="DriverID"
                                            rules={[{ required: true, message: 'Driver ID is required.' }]}
                                        >
                                            <Input style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #059855',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                            }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label={
                                                <span style={{
                                                    display: 'block',
                                                    marginBottom: '5px',
                                                    fontWeight: 'bold',
                                                    color: '#059855',
                                                    fontFamily: 'Open Sans',
                                                    fontSize: '16px'
                                                }}>
                                                    GPS Number
                                                </span>
                                            }
                                            name="GPSnumber"
                                            rules={[{ required: true, message: 'GPS number is required or You can choose None.' }]}
                                        >
                                            <Select 
                                                placeholder="Select a motorcycle"
                                                style={{
                                                    width: '100%',
                                                    height: '45px',
                                                    border: '0.5px solid #059855',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    transition: 'border-color',
                                                    fontFamily: 'Open Sans',
                                                }}
                                                dropdownStyle={{
                                                    boxShadow: 'none',
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#1c7a50'} // Darker green on focus
                                                onBlur={(e) => e.target.style.borderColor = '#059855'} // Revert border color
                                            >
                                                <Select.Option value="None">None</Select.Option>
                                                {availableMotorcycles.map((item) => (
                                                    <Select.Option key={item.id} value={item.GPSnumber}>
                                                        {item.GPSnumber}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit">
                                        Update Driver
                                    </Button>
                                </Form.Item>
                            </Form>
                        )}
                    </Card>
                </div>
                {isNotificationVisible && (
                    <div className={`notification-popup ${isSuccess ? 'success' : 'error'}`}>
                        <span className="close-popup-btn" onClick={() => setIsNotificationVisible(false)}>&times;</span>
                        <img src={isSuccess ? successImage : errorImage} alt={isSuccess ? 'Success' : 'Error'} />
                        <p>{notificationMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditDriver;