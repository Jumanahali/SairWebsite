import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Form, Input, Button, notification, Card, Row, Col } from 'antd';
import styles from '../DriverList.module.css';
import { BackwardOutlined } from '@ant-design/icons';



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
    });
    const [isLoading, setIsLoading] = useState(true);

    // Fetch the driver's data based on driverId
    useEffect(() => {
        const fetchDriverData = async () => {
            try {
                // console.log(driverId);
                const driverDocRef = doc(db, 'Driver', driverId);
                const driverDoc = await getDoc(driverDocRef);
                console.log(driverDoc);
                if (driverDoc.exists()) {
                    setNewDriver(driverDoc.data());
                } else {
                    notification.error({
                        message: 'Driver not found',
                    });
                }
            } catch (error) {
                console.error('Error fetching driver data:', error);
                notification.error({
                    message: 'Error fetching driver data.',
                });
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
            notification.success({
                message: 'Driver updated successfully!',
            });
        } catch (error) {
            console.error('Error updating driver:', error);
            notification.error({
                message: 'Error updating driver. Please try again.',
            });
        }
    };

    if (isLoading) {
        return <p>Loading driver data...</p>;
    }

    return (
        <div>


            <div className="driver-list-header-container">
                <h1>Edit Driver List</h1>
               <div className={'driver-header-action'}>
              
              
                <Button  type="primary" id="add-driver-button" onClick={() => {
                    navigate('/driverslist')
                   
                }}>
                    <BackwardOutlined /> 
                    <span>Go Back</span>
                </Button>
               </div>
              
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
                    label="GPS Number"
                    name="GPSnumber"
                >
                    <Input />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    label="Company Name"
                    name="CompanyName"
                    rules={[{ required: true, message: 'Please input the Company Name!' }]}
                >
                    <Input />
                </Form.Item>
            </Col>
        </Row>
        <Form.Item>
            <Button type="primary" htmlType="submit">
                Update Driver
            </Button>
        </Form.Item>
    </Form>
</Card>
        </div>
    );
};

export default EditDriver;
