import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
    const [newDriver, setNewDriver] = useState({
        DriverID: '',
        Fname: '',
        Lname: '',
        PhoneNumber: '',
        GPSnumber: '',
        CompanyName: '',
        Email: '',
    });
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
                    setNewDriver(driverDoc.data());
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

    // Handle driver update
    const handleUpdateDriver = async (values) => {
        try {
            const driverDocRef = doc(db, 'Driver', driverId);
            await setDoc(driverDocRef, values);
            setNotificationMessage("Driver updated successfully!");
            setIsSuccess(true);
            setIsNotificationVisible(true);
        } catch (error) {
            console.error('Error updating driver:', error);
            setNotificationMessage("Error updating driver");
            setIsSuccess(false);
            setIsNotificationVisible(true);
        }
    };

    if (isLoading) {
        return <p>Loading driver data...</p>;
    }

    const handleLogout = () => {
        // Ensure auth is imported and defined
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
            <div className="breadcrumb">
                <a onClick={() => navigate('/employer-home')}>Home</a>
                <span> / </span>
                <a onClick={() => navigate('/driverslist')}>Driver List</a>
                <span> / </span>
                <a onClick={() => navigate('/edit-driver/:driverId')}>Edit Driver</a>
            </div>
            <div>
                <div className="driver-list-header-container">
                    <h1>Edit Driver</h1>
                </div>

                <Card className={styles.card__Wrapper}>
                    <h3>Edit Driver</h3>
                    <Form
                        layout="vertical"
                        onFinish={handleUpdateDriver}
                        initialValues={newDriver}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Driver ID"
                                    name="DriverID"
                                    rules={[{ required: true, message: 'Please input the Driver ID!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="First Name"
                                    name="Fname"
                                    rules={[{ required: true, message: 'Please input the First Name!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Last Name"
                                    name="Lname"
                                    rules={[{ required: true, message: 'Please input the Last Name!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Phone Number"
                                    name="PhoneNumber"
                                    rules={[{ required: true, message: 'Please input the Phone Number!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Email"
                                    name="Email"
                                    rules={[{ required: true, message: 'Please input the Email!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="GPS Number"
                                    name="GPSnumber"
                                >
                                    <Select>
                                        <Select.Option value="None">None</Select.Option>
                                        {availableMotorcycles?.map((item) => (
                                            <Select.Option key={item.id} value={item.GPSnumber}>
                                                {item.GPSnumber}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item>
                            <Button style={{ backgroundColor: '#059855' }} type="primary" htmlType="submit">
                                Update Driver
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>

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