import React, { useEffect, useState } from 'react';
import { collection, addDoc, where, query, doc, getDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Form, Input, Button, notification, Card, Row, Col, Select } from 'antd';
import { BackwardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import successImage from '../images/Sucess.png';
import errorImage from '../images/Error.png';

const AddMotorcycle = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const [availableDrivers, setAvailableDrivers] = useState([]);

  const generateMotorcycleID = async (gpsNumber) => {
    let uniqueID = '';
    let isUnique = false;

    while (!isUnique) {
      // Generate Motorcycle ID by concatenating GPS number and 3 random digits
      const randomDigits = Math.floor(100 + Math.random() * 900).toString(); // Generate 3 random digits
      uniqueID = `${gpsNumber}${randomDigits}`;

      // Check if the ID already exists in the 'Motorcycle' collection
      const q = query(collection(db, 'Motorcycle'), where('MotorcycleID', '==', uniqueID));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        isUnique = true; // No duplicate found, ID is unique
      }
    }

    return uniqueID;
  };

  const handleAddMotorcycle = async (values) => {
    try {
      console.log(values);

      // Generate unique Motorcycle ID based on GPS Number
      const motorcycleID = await generateMotorcycleID(values.GPSnumber);
      const motorcycleData = { ...values, MotorcycleID: motorcycleID }; // Add generated ID to values

      // Store the new motorcycle in Firestore
      const s = await addDoc(collection(db, 'Motorcycle'), motorcycleData);
      console.log(s);

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
    // Fetch available drivers who are not assigned to any motorcycle
    const fetchAvailableDrivers = async () => {
      const employerUID = sessionStorage.getItem('employerUID');
      const employerDocRef = doc(db, 'Employer', employerUID);
      const docSnap = await getDoc(employerDocRef);

      if (docSnap.exists()) {
        const { CompanyName } = docSnap.data();
        console.log("Employer Data:", CompanyName);
        const dq = query(collection(db, 'Driver'), where('CompanyName', '==', CompanyName), where('available', '==', false));

        const unsubscribe = onSnapshot(dq, (drivers) => {
          const driverOptions = drivers.docs.map((doc) => {
            const driverData = doc.data();
            console.log("Driver Data:", driverData);
            return { value: driverData.DriverID, label: driverData.DriverID };
          });
          setAvailableDrivers(driverOptions);
        });

        return () => unsubscribe();
      } else {
        console.log("No company document!");
      }
    };

    fetchAvailableDrivers();
  }, [form]);

  return (
    <div>
      <div className="driver-list-header-container">
        <h1>Add Motorcycle</h1>
        <div className={'driver-header-action'}>
          <Button type="primary" id="add-driver-button" onClick={() => {
            navigate('/motorcycleslist');
          }}>
            <BackwardOutlined />
            <span>Go Back</span>
          </Button>
        </div>
      </div>

      <Card style={{ margin: "1.5rem" }}>
        <h3>Add Motorcycle</h3>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddMotorcycle}
        >
          {/* Motorcycle ID field is removed since it will be auto-generated */}
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Driver ID"
                name="DriverID"
                rules={[{ required: true, message: 'Please select the Driver ID.' }]}
              >
                <Select options={availableDrivers} />
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
            <Button type="primary" htmlType="submit">
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
  );
};

export default AddMotorcycle;
