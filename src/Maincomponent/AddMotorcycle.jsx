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
  const [availableGPSNumbers, setAvailableGPSNumbers] = useState([{ value: "null", label: "None" }]);


  const handleAddMotorcycle = async (values) => {
    try {

      console.log(values);

      // Store the new motorcycle in Firestore
      const s = await addDoc(collection(db, 'Motorcycle'), values);

      console.log(s);


      setIsSuccess(true);
      setNotificationMessage('Motorcycle added successfully.');

      // navigate('/motorcycleslist'); 
    } catch (error) {
      console.error('Error adding motorcycle:', error);
      setIsSuccess(false);
      setNotificationMessage('Error adding motorcycle. Please try again.');

    } finally {
      setIsNotificationVisible(true);

    }
  };

  useEffect(() => {
    // fetch available GPS numbers
    const fetchAvailableGPSNumbers = async () => {
      const employerUID = sessionStorage.getItem('employerUID')

      const employerDocRef = doc(db, 'Employer', employerUID); // Use the UID to fetch the document
      const docSnap = await getDoc(employerDocRef);

      if (docSnap.exists()) {
        const { CompanyName } = docSnap.data();
        console.log("Employer Data:", CompanyName); // Log the fetched data
        const dq = query(collection(db, 'Driver'), where('CompanyName', '==', CompanyName));

        const unsubscribe = onSnapshot(dq, (drivers) => {

          drivers.docs.forEach((doc) => {
            const driverData = doc.data();
            console.log("Driver Data:", driverData); // Log the fetched data
            if (driverData.CompanyName === CompanyName && driverData.available && driverData.GPSnumber) {
              console.log("Driver GPS Number:", driverData.GPSnumber);
              setAvailableGPSNumbers((prev) => [...prev, { value: driverData.GPSnumber, label: driverData.GPSnumber }]);
            }
          }
          );

        });


        return () => unsubscribe();
      } else {
        console.log("No company document!");
      }

    };

    fetchAvailableGPSNumbers();

  }, [form])

  console.log(availableGPSNumbers);

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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Motorcycle ID"
                name="MotorcycleID"
                rules={[{ required: true, message: 'Please input the Motorcycle ID!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="GPS Number"
                name="GPSnumber"
                rules={[{ required: true, message: 'Please input the GPS Number.' }]}
              >
                <Select options={availableGPSNumbers} />
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
