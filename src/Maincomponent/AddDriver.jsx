import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    where,
    doc,
    getDoc, getDocs,
    updateDoc,
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
import { useNavigate } from 'react-router-dom';
import { generateRandomPassword } from '../utils/common';
import SAIRLogo from '../images/SAIRlogo.png'; 
import logoutIcon from '../images/logout.png'; 
import { sendEmail } from '../utils/email';

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
            if (Employer.CompanyName) {
                const motorcycleQuery = query(
                    collection(db, 'Motorcycle'),
                    where('CompanyName', '==', Employer.CompanyName),
                    where('available', '==', true)
                );
                const unsubscribe = onSnapshot(motorcycleQuery, (snapshot) => {
                    console.log("Motorcycle snapshot:", snapshot.docs); // Debug log
                    const bikes = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        GPSnumber: doc.data().GPSnumber,
                    }));
                    setAvailableMotorcycles(bikes);
                });
                return () => unsubscribe();
            }
        };
        fetchMotorcycles();
    }, [Employer]);

    const handleAddDriver = async (values) => {
        try {
            let newErrors = {};
            const formattedPhoneNumber = `+966${values.PhoneNumber}`;
            
            // Determine GPS number and availability
            const gpsNumber = values.GPSnumber === "None" ? null : values.GPSnumber;
            const available = gpsNumber === null; // Driver is available if no motorcycle is assigned
        
            // Generate random password
            const generatedPassword = generateRandomPassword();
        
            // Create the user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                values.Email,
                generatedPassword
            );
        
            // Get the new user's UID
            const user = userCredential.user;
        
            // Prepare the new driver object
            const newDriver = { 
                ...values, 
                PhoneNumber: formattedPhoneNumber,
                GPSnumber: gpsNumber, 
                CompanyName: Employer.CompanyName,
                isDefaultPassword: true,
                available: available, // Set availability based on motorcycle assignment
                UID: user.uid 
            };
        
            // Store the new driver in Firestore
            const driverDocRef = await addDoc(collection(db, 'Driver'), newDriver);
        
            // If a motorcycle is assigned, update its availability and DriverID
            if (gpsNumber) {
                const q = query(
                    collection(db, 'Motorcycle'),
                    where('GPSnumber', '==', gpsNumber)
                );
                const querySnapshot = await getDocs(q);
        
                if (!querySnapshot.empty) {
                    const motorcycleDocRef = querySnapshot.docs[0].ref; // Get the document reference
                    
                    // Update the motorcycle document
                    await updateDoc(motorcycleDocRef, {
                        available: false, // Set motorcycle's available field to false
                        DriverID: values.DriverID // Set the DriverID to the driver's ID from the form
                    });
                } else {
                    console.error(`No motorcycle found with GPS number: ${gpsNumber}`);
                }
            }
        
            // Send welcome email
            const response = await sendEmail({
                email: values.Email,
                subject: 'Welcome to SAIR!',
                message: `Congratulations! 
        
        You are now a driver at ${Employer.CompanyName}.
                    
        We are excited to have you with us! 
        
        Your password is: ${generatedPassword}
        
        To ensure your safety, we have set up your account in SAIR Mobile app. Download SAIR now from Google Play to monitor regulations and keep us informed about any crashes.
        
        Best Regards,  
        SAIR Team`,
            });
        
            if (response.success) {
                setPopupMessage("Driver added successfully!");
                setPopupImage(successImage);
            } else {
                setPopupMessage("Error adding driver");
                setPopupImage(errorImage);
            }
        
            setPopupVisible(true);
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
                <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop:'-60px',
    marginBottom: '20px' 
}}>
                <Card className={styles.card__Wrapper}
                style={{ width: '900px' ,height:'450px'}}>
    <Form
        form={form}
        layout="vertical"
        onFinish={handleAddDriver}
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
                            marginLeft: '0',
                            marginTop: '0',
                            fontFamily: 'Open Sans',
                            fontSize: '16px'
                        }}>
                            First Name
                        </span>
                    }
                    name="Fname"
                    rules={[{ required: true, message: 'First name is required.' }]}
                >
                    <Input
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #059855', // Green border
                            borderRadius: '8px',
                            fontSize: '14px',
                            transition: 'border-color 0.3s ease-in-out',
                            fontFamily: 'Open Sans',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1c7a50'} // Darker green on focus
                        onBlur={(e) => e.target.style.borderColor = '#059855'} // Revert border color
                    />
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
                            marginLeft: '0',
                            marginTop: '0',
                            fontFamily: 'Open Sans',
                            fontSize: '16px'
                        }}>
                            Last Name
                        </span>
                    }
                    name="Lname"
                    rules={[{ required: true, message: 'Last name is required.' }]}
                >
                    <Input
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #059855', // Green border
                            borderRadius: '8px',
                            fontSize: '14px',
                            transition: 'border-color 0.3s ease-in-out',
                            fontFamily: 'Open Sans',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1c7a50'} // Darker green on focus
                        onBlur={(e) => e.target.style.borderColor = '#059855'} // Revert border color
                    />
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
    rules={[
        { required: true, message: 'Phone Number is required.' },
        {
            validator: (_, value) => {
                if (!value || value.length !== 9) {
                    return Promise.reject(new Error('Phone number must be 9 digits long (after +966).'));
                }
                // Check if the value is numeric
                if (!/^\d{9}$/.test(value)) {
                    return Promise.reject(new Error('Phone number must contain only digits.'));
                }
                // Check if it starts with 5 (assuming you want it to start with 5)
                if (!/^5\d{8}$/.test(value)) {
                    return Promise.reject(new Error('Phone number must start with 5 and be followed by 8 digits.'));
                }
                return Promise.resolve();
            },
        },
    ]}
>
    <div style={{ position: 'relative' }}>
        <span style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#000',
            fontSize: '14px',
            padding: '8px',
            marginBottom:"100px",
            fontFamily: 'Open Sans',
            pointerEvents: 'none',
            zIndex: 1
        }}>
            +966
        </span>
        <Input
            maxLength={9}  //Only allow 9 digits (after +966)
            //placeholder="Enter your phone number"
            style={{
                width: '100%',
                paddingLeft: '50px', // Adjust padding to leave space for +966
                border: '1px solid #059855', // Green border
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.3s ease-in-out',
                fontFamily: 'Open Sans',
                height: '43px',
            }}
            onFocus={(e) => e.target.style.borderColor = '#1c7a50'} // Darker green on focus
            onBlur={(e) => e.target.style.borderColor = '#059855'} // Revert border color
        />
    </div>
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
                            marginLeft: '0',
                            marginTop: '0',
                            fontFamily: 'Open Sans',
                            fontSize: '16px'
                        }}>
                            Email
                        </span>
                    }
                    name="Email"
                    rules={[{ required: true, message: 'Email is required' }, {
                        type: 'email', message: 'Please enter a valid email address.',
                    },]}
                >
                    <Input
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #059855', // Green border
                            borderRadius: '8px',
                            fontSize: '14px',
                            transition: 'border-color 0.3s ease-in-out',
                            fontFamily: 'Open Sans',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1c7a50'} // Darker green on focus
                        onBlur={(e) => e.target.style.borderColor = '#059855'} // Revert border color
                    />
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
                            marginLeft: '0',
                            marginTop: '0',
                            fontFamily: 'Open Sans',
                            fontSize: '16px'
                        }}>
                            Driver ID (National ID / Residency Number)
                        </span>
                    }
                    name="DriverID"
                    rules={[{ required: true, message: 'Driver ID is required.' }]}
                >
                    <Input
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #059855', // Green border
                            borderRadius: '8px',
                            fontSize: '14px',
                            transition: 'border-color 0.3s ease-in-out',
                            fontFamily: 'Open Sans',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1c7a50'} // Darker green on focus
                        onBlur={(e) => e.target.style.borderColor = '#059855'} // Revert border color
                    />
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
                marginLeft: '0',
                marginTop: '0',
                fontFamily: 'Open Sans',
                fontSize: '16px'
            }}>
                GPS Number
            </span>
        }
        name="GPSnumber"
        rules={[{ required: true, message: 'GPS Number is required or you can choose None.' }]}
    >
        <Select
            placeholder="Select a motorcycle or None"
            style={{
                width: '100%',
                height: '45px',
                border: '0.5px solid #059855', // Green border
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
            {availableMotorcycles.length > 0 ? (
                availableMotorcycles.map((item) => (
                    <Select.Option key={item.id} value={item.GPSnumber}>
                        {item.GPSnumber}
                    </Select.Option>
                ))
            ) : (
                <Select.Option disabled>No motorcycles available</Select.Option>
            )}
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