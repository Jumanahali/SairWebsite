import React, { useEffect, useState } from 'react';
import { collection, addDoc, where, query, doc, getDoc, getDocs, onSnapshot , updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase'; // Ensure auth is imported
import { Form, Input, Button, notification, Card, Row, Col, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import successImage from '../images/Sucess.png';
import errorImage from '../images/Error.png';
import SAIRLogo from '../images/SAIRlogo.png'; 
import logoutIcon from '../images/logout.png'; 

const AddMotorcycle = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [Employer, setEmployer] = useState({ CompanyName: '' });
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const [availableDrivers, setAvailableDrivers] = useState([]);

  useEffect(() => {
    const employerUID = sessionStorage.getItem('employerUID');
    const fetchEmployer = async () => {
      const docRef = doc(db, 'Employer', employerUID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEmployer(data);
      }
    };
    fetchEmployer();
  }, []);

  const generateMotorcycleID = async (gpsNumber) => {
    let uniqueID = '';
    let isUnique = false;

    while (!isUnique) {
      const randomDigits = Math.floor(100 + Math.random() * 900).toString();
      uniqueID = `${gpsNumber}${randomDigits}`;

      const q = query(collection(db, 'Motorcycle'), where('MotorcycleID', '==', uniqueID));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        isUnique = true;
      }
    }

    return uniqueID;
  };

  const handleAddMotorcycle = async (values) => {
    try {
      const driverID = values.DriverID === "None" ? null : values.DriverID;
      const motorcycleID = await generateMotorcycleID(values.GPSnumber);
      const available = driverID === null;
  
      const motorcycleData = {
        ...values,
        MotorcycleID: motorcycleID,
        DriverID: driverID,
        CompanyName: Employer.CompanyName,
        available: available,
      };
  
      // Add the motorcycle to the Motorcycle collection
      await addDoc(collection(db, 'Motorcycle'), motorcycleData);
  
      // If a driver was selected, update their availability to false
      if (driverID) {
        // Query the driver document using DriverID field
        const q = query(
          collection(db, 'Driver'),
          where('DriverID', '==', driverID)
        );
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          const driverDocRef = querySnapshot.docs[0].ref; // Get the document reference
          await updateDoc(driverDocRef, { available: false });
        } else {
          console.error(`No driver found with DriverID: ${driverID}`);
        }
      }
  
      setIsSuccess(true);
      setNotificationMessage('Motorcycle added successfully.');
    } catch (error) {
      console.error('Error adding motorcycle:', error);
      setIsSuccess(false);
      setNotificationMessage('Error adding motorcycle. Please try again.');
    } finally {
      setIsNotificationVisible(true);
    }
  };
  

  useEffect(() => {
    const fetchAvailableDrivers = async () => {
      const employerUID = sessionStorage.getItem('employerUID');
      const employerDocRef = doc(db, 'Employer', employerUID);
      const docSnap = await getDoc(employerDocRef);

      if (docSnap.exists()) {
        const { CompanyName } = docSnap.data();
        const dq = query(collection(db, 'Driver'), where('CompanyName', '==', CompanyName), where('available', '==', true));

        const unsubscribe = onSnapshot(dq, (drivers) => {
          const driverOptions = drivers.docs.map((doc) => {
            const driverData = doc.data();
            return { value: driverData.DriverID, label: driverData.DriverID };
          });
          setAvailableDrivers(driverOptions);
        });

        return () => unsubscribe();
      }
    };

    fetchAvailableDrivers();
  }, []);

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
              <li><a onClick={() => navigate('/driverslist')}>Drivers List</a></li>
              <li><a class="active" onClick={() => navigate('/motorcycleslist')}>Motorcycles List</a></li>
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
        <a onClick={() => navigate('/motorcycleslist')}>Motorcycle List</a>
        <span> / </span>
        <a onClick={() => navigate('/add-motorcycle')}>Add Motorcycle</a>
      </div>
      <div>
        <div className="driver-list-header-container">
          <h1>Add Motorcycle</h1>
        </div>
        <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop:'-30px',
    marginBottom: '20px' 
}}>
        <Card
    style={{ width: '900px' ,height:'450px'}}
>

    <Form
        form={form}
        layout="vertical"
        onFinish={handleAddMotorcycle}
        style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px', // Space between form items
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
                            fontSize: '16px',
                        }}>
                            Driver ID (National ID / Residency Number)
                        </span>
                    }
                    name="DriverID"
                    rules={[{ required: true, message: 'Please select the Driver ID.' }]}
                >
                    <Select
                        placeholder="Select a Driver ID"
                        style={{
                            width: '100%',
                            height: '45px',
                            border: '1px solid #059855', // Green border
                            borderRadius: '8px',
                            fontSize: '14px',
                            transition: 'border-color 0.3s ease-in-out',
                            fontFamily: 'Open Sans',
                        }}
                        dropdownStyle={{
                            boxShadow: 'none',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1c7a50'} // Darker green on focus
                        onBlur={(e) => e.target.style.borderColor = '#059855'} // Revert border color
                    >
                        <Select.Option value="None">None</Select.Option>
                        {availableDrivers.map((item) => (
                            <Select.Option key={item.value} value={item.value}>
                                {item.label}
                            </Select.Option>
                        ))}
                    </Select>
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
                            fontSize: '16px',
                        }}>
                            GPS Number
                        </span>
                    }
                    name="GPSnumber"
                    rules={[{ required: true, message: 'Please input the GPS Number.' }]}
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
                            fontSize: '16px',
                        }}>
                            Motorcycle Model
                        </span>
                    }
                    name="Model"
                    rules={[{ required: true, message: 'Please input the Motorcycle Model.' }]}
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
                            fontFamily: 'Open Sans',
                            fontSize: '16px',
                        }}>
                            Motorcycle Type
                        </span>
                    }
                    name="Type"
                    rules={[{ required: true, message: 'Please input Type.' }]}
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
                            fontSize: '16px',
                        }}>
                            Motorcycle Brand
                        </span>
                    }
                    name="Brand"
                    rules={[{ required: true, message: 'Please input Brand.' }]}
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
                            fontFamily: 'Open Sans',
                            fontSize: '16px',
                        }}>
                            License Plate
                        </span>
                    }
                    name="LicensePlate"
                    rules={[{ required: true, message: 'Please input the License Plate.' }]}
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
        <Form.Item>
            <Button
                type="primary"
                htmlType="submit"
                style={{
                    backgroundColor: "#059855",
                }}
            >
                Add Motorcycle
            </Button>
        </Form.Item>
    </Form>
</Card>
</div>

        {isNotificationVisible && (
          <div className={`notification-popup ${isSuccess ? 'success' : 'error'}`}>
            <span className="close-popup-btn" onClick={() => navigate("/motorcycleslist")}>&times;</span>
            <img src={isSuccess ? successImage : errorImage} alt={isSuccess ? 'Success' : 'Error'} />
            <p>{notificationMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddMotorcycle;