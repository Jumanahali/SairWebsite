import React from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Form, Input, Button, notification, Card, Row, Col } from 'antd';
import styles from '../DriverList.module.css'; 
import { BackwardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { generateRandomPassword } from '../utils/common';

const AddDriver = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const handleAddDriver = async (values) => {
        try {
            let newErrors = {};

            // Phone number validation
            if (!values.PhoneNumber.startsWith('+966')) {
                newErrors.PhoneNumber = 'Phone number must start with +966.';
            }
            if (values.PhoneNumber.length !== 13) {
                newErrors.PhoneNumber = 'Phone number must be exactly 13 digits.';
            }

            if (Object.keys(newErrors).length > 0) {
                // If there are validation errors, set them on the form
                form.setFields([
                    {
                        name: 'PhoneNumber',
                        errors: [newErrors.PhoneNumber],
                    },
                ]);
                return; // Stop the submission
            }

            // Generate random password
            const generatedPassword = generateRandomPassword();

            // Add the driver to the Firestore database with the generated password
            const newDriver = { ...values, Password: generatedPassword };

            // Store the new driver in Firestore
            await addDoc(collection(db, 'Driver'), newDriver);

            // Prepare the message for email
            const message = `Your account has been created. Your password is: ${generatedPassword}`;

            // Call the backend API to send the email
            const response = await fetch('http://localhost:8080/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: values.Email, // Email of the driver
                    subject: 'Your Account Password',
                    message: message, // The message to be sent
                }),
            });

            const result = await response.json();
            if (result.success) {
                notification.success({
                    message: 'Driver added successfully! Password has been sent via email.',
                });
            } else {
                notification.error({
                    message: `Error sending email: ${result.error}`,
                });
            }
        } catch (error) {
            console.error('Error adding driver:', error);
            notification.error({
                message: 'Error adding driver. Please try again.',
            });
        }
    };

    return (
        <div>
            <div className="driver-list-header-container">
                <h1>Add Driver</h1>
                <div className={'driver-header-action'}>
                    <Button type="primary" id="add-driver-button" onClick={() => {
                        navigate('/driverslist');
                    }}>
                        <BackwardOutlined />
                        <span>Go Back</span>
                    </Button>
                </div>
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
                                label="Email"
                                name="Email"
                                rules={[{ required: true, type: 'email', message: 'Please input a valid Email!' }]}
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
                                rules={[{ required: true, message: 'Please input the Phone Number!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="GPS Number"
                                name="GPSnumber"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
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
                            Add Driver
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AddDriver;
