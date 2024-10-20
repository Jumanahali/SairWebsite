import React, { useEffect, useState } from 'react';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    where,
    doc,
    getDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import {
    Form,
    Input,
    Button,
    notification,
    Card,
    Row,
    Col,
    Select,
    message,
} from 'antd';
import successImage from '../images/Sucess.png'; 
import errorImage from '../images/Error.png'; 
import styles from '../DriverList.module.css';
import { BackwardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { generateRandomPassword } from '../utils/common';
import SAIRLogo from '../images/SAIRlogo.png'; 
import logoutIcon from '../images/logout.png'; 

const AddDriver = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [availableMotorcycles, setAvailableMotorcycles] = useState([]);
    const [Employer, setEmployer] = useState({ CompanyName: '' });
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [popupImage, setPopupImage] = useState('');


    useEffect(() => {
        const employerUID = sessionStorage.getItem('employerUID');
        const fetchEmployer = async () => {
            const docRef = doc(db, 'Employer', employerUID);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setEmployer(data);
            } else {
                message.error('Employer not found');
            }
        };
        fetchEmployer();
    }, []);

    useEffect(() => {
        const fetchMotorcycles = async () => {
            const motorcycleQuery = query(
                collection(db, 'Motorcycle'),
                where('CompanyName', '==', Employer.CompanyName),
                where('available', '==', false)
            );
            const unsubscribe = onSnapshot(motorcycleQuery, (snapshot) => {
                const bikes = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    GPSnumber: doc.data().GPSnumber,
                }));
                setAvailableMotorcycles(bikes);
            });
            return () => unsubscribe();
        };
        if (Employer.CompanyName) {
            fetchMotorcycles();
        }
    }, [Employer]);

    const handleAddDriver = async (values) => {
        try {
            let newErrors = {};

            // Phone number validation
            if (!values.PhoneNumber.startsWith('+9665') || values.PhoneNumber.length !== 13) {
                newErrors.PhoneNumber = 'Phone number must start with +9665 and be followed by 8 digits.';
            }

            if (Object.keys(newErrors).length > 0) {
                form.setFields([{ name: 'PhoneNumber', errors: [newErrors.PhoneNumber] }]);
                return; // Stop the submission
            }

            // Determine GPS number and availability
            const gpsNumber = values.GPSnumber === "None" ? null : values.GPSnumber;
            const available = values.GPSnumber !== "None";

            // Generate random password
            const generatedPassword = generateRandomPassword();

            // Prepare the new driver object
            const newDriver = { 
                ...values, 
                GPSnumber: gpsNumber, 
                CompanyName: Employer.CompanyName,
                Password: generatedPassword,
                isDefaultPassword: true,
                available: available
            };

            // Store the new driver in Firestore
            await addDoc(collection(db, 'Driver'), newDriver);

            // Prepare the message for email
            const emailMessage = `Your account has been created. Your password is: ${generatedPassword}`;

            // Call the backend API to send the email
            const response = await fetch('http://localhost:8080/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: values.Email,
                    subject: 'Your Account Password',
                    message: emailMessage,
                }),
            });

            const result = await response.json();
            if (result.success) {
                setPopupMessage("Driver added successfully!");
                setPopupImage(successImage);
                setPopupVisible(true);
            } else {
                setPopupMessage("Error Addint driver");
                setPopupImage(errorImage);
                setPopupVisible(true);
            }
        } catch (error) {
            console.error('Error adding driver:', error);
            notification.error({
                message: 'Error adding driver. Please try again.',
            });
        }
    };

    const handleLogout = () => {
        auth.signOut()
            .then(() => navigate('/'))
            .catch((error) => console.error('Error LOGGING out:', error));
    };

    const handleClosePopup = () => {
        setPopupVisible(false);
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
                <a onClick={() => navigate('/add-driver')}>Add Driver</a>
            </div>

            <div>
                <div className="driver-list-header-container">
                    <h1>Add Driver</h1>
                </div>

                <Card className={styles.card__Wrapper}>
                    <h3>Add Driver</h3>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleAddDriver}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Driver ID"
                                    name="DriverID"
                                    rules={[{ required: true }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="First Name"
                                    name="Fname"
                                    rules={[{ required: true }]}
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
                                    rules={[{ required: true }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Email"
                                    name="Email"
                                    rules={[{ required: true, type: 'email', message: 'Please enter a valid email address.' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Phone Number"
                                    name="PhoneNumber"
                                    rules={[{ required: true, message: 'Please input the Phone Number.' }]}
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
                            <Button style={{ backgroundColor: "#059855" }} type="primary" htmlType="submit">
                                Add Driver
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
            {popupVisible && (
                <div className="popup">
                    <button className="close-btn" onClick={handleClosePopup}>×</button>
                    <img src={popupImage} alt="Popup" />
                    <p>{popupMessage}</p>
                </div>
            )}
        </div>
    );
};

export default AddDriver;