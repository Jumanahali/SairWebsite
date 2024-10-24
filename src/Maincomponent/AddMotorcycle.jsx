import React, { useEffect, useState } from 'react';
import { collection, addDoc, where, query, doc, getDoc, getDocs, onSnapshot } from 'firebase/firestore';
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
      const available = driverID === null; // Determine availability based on driver selection
      const motorcycleData = {
        ...values,
        MotorcycleID: motorcycleID,
        DriverID: driverID,
        CompanyName: Employer.CompanyName,
        available: available,
      };

      await addDoc(collection(db, 'Motorcycle'), motorcycleData);
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
        const dq = query(collection(db, 'Driver'), where('CompanyName', '==', CompanyName), where('available', '==', false));

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

        <Card style={{ margin: "1.5rem" }}>
          <h3>Add Motorcycle</h3>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddMotorcycle}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Driver ID"
                  name="DriverID"
                  rules={[{ required: true, message: 'Please select the Driver ID.' }]}
                >
                  <Select placeholder="Select a Driver ID">
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
                  label="GPS Number"
                  name="GPSnumber"
                  rules={[{ required: true, message: 'Please input the GPS Number.' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Motorcycle Model"
                  name="Model"
                  rules={[{ required: true, message: 'Please input the Motorcycle Model.' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Type"
                  name="Type"
                  rules={[{ required: true, message: 'Please input Type.' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Motorcycle Brand"
                  name="Brand"
                  rules={[{ required: true, message: 'Please input Brand.' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="License Plate"
                  name="LicensePlate"
                  rules={[{ required: true, message: 'Please input the License Plate.' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button type="primary" htmlType="submit" >
                Add Motorcycle
              </Button>
            </Form.Item>
          </Form>
        </Card>

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