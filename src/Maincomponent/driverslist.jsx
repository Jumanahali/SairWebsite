import React, { useEffect, useState } from 'react';
import { db , auth } from '../firebase';
import { useNavigate, useParams } from 'react-router-dom';
import {
    collection, doc, onSnapshot, deleteDoc, query, where
} from 'firebase/firestore';
import TrashIcon from '../images/Trash.png';
import PencilIcon from '../images/pencil.png';
import EyeIcon from '../images/eye.png'; 
import '../Driverlist.css';
import successImage from '../images/Sucess.png'; 
import errorImage from '../images/Error.png'; 
import { SearchOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Button, Table } from 'antd';
import SAIRLogo from '../images/SAIRlogo.png'; 
import logoutIcon from '../images/logout.png'; 

const DriverList = () => {
    const [driverData, setDriverData] = useState([]);
    const [isAddPopupVisible, setIsAddPopupVisible] = useState(false);
    const [driverToRemove, setDriverToRemove] = useState(null);
    const [isDeletePopupVisible, setIsDeletePopupVisible] = useState(false);
    const [availableMotorcycles, setAvailableMotorcycles] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [notificationMessage, setNotificationMessage] = useState('');
    const [isNotificationVisible, setIsNotificationVisible] = useState(false);
    const [isSuccess, setIsSuccess] = useState(true);
    const [isDeleteSuccess, setIsDeleteSuccess] = useState(false);

    const navigate = useNavigate();
    const { driverId } = useParams();

    const handleEditDriver = (driver) => {
        navigate(`/edit-driver/${driver?.id}`);
    };

    const columns = [
        {
            title: 'Driver ID',
            dataIndex: 'DriverID',
            key: 'DriverID',
        },
        {
            title: 'Driver Name',
            dataIndex: 'DriverName',
            key: 'DriverName',
            render: (text, record) => `${record.Fname} ${record.Lname}`,
        },
        {
            title: 'Phone Number',
            dataIndex: 'PhoneNumber',
            key: 'PhoneNumber',
        },
        {
            title: 'Email',
            dataIndex: 'Email',
            key: 'Email',
        },
        {
            title: 'Details',
            key: 'Details',
            render: (text, record) => (
                <img
                    style={{ cursor: 'pointer' }}
                    src={EyeIcon}
                    alt="Details"
                    onClick={() => viewViolationDetails(record.DriverID)}
                />
            ),
        },
        {
            title: 'Actions',
            key: 'Actions',
            render: (text, record) => (
                <div>
                    <img
                        style={{ cursor: 'pointer', marginRight: 8 }}
                        src={TrashIcon}
                        alt="Delete"
                        onClick={() => openDeleteConfirmation(record)}
                    />
                    <img
                        style={{ cursor: 'pointer' }}
                        src={PencilIcon}
                        alt="Edit"
                        onClick={() => handleEditDriver(record)}
                    />
                </div>
            ),
        },
    ];

    const filteredData = driverData.filter(driver => driver.DriverID.includes(searchQuery));

    useEffect(() => {
        const fetchDrivers = () => {
            const driverCollection = collection(db, 'Driver');
            const unsubscribe = onSnapshot(driverCollection, (snapshot) => {
                const driverList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setDriverData(driverList);
            });
            return () => unsubscribe();
        };

        const fetchMotorcycles = async () => {
            const motorcycleQuery = query(
                collection(db, 'Motorcycle'),
                where('CompanyName', '==', 'Jahez') 
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

        fetchDrivers();
        fetchMotorcycles();
    }, []);

    const handleDeleteDriver = async (driverId) => {
        try {
            await deleteDoc(doc(db, 'Driver', driverId));
            setIsDeleteSuccess(true);
            setNotificationMessage('Driver deleted successfully!');
            setIsNotificationVisible(true);
        } catch (error) {
            console.error('Error deleting driver:', error);
            setIsDeleteSuccess(false);
            setNotificationMessage('Error deleting driver. Please try again.');
            setIsNotificationVisible(true);
        }
        setIsDeletePopupVisible(false);
    };

    const openDeleteConfirmation = (driver) => {
        setDriverToRemove(driver);
        setIsDeletePopupVisible(true);
    };

    const viewViolationDetails = async (driverID) => {
        navigate(`/violation/detail/${driverID}`);
    };
    const handleLogout = () => {
        auth.signOut().then(() => {
          navigate('/'); // Redirect to login page (Login.jsx)
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
                            <li><a class="active" onClick={() => navigate('/driverslist')}>Drivers List</a></li>
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
            </div>
            <div className='body'>
                <div className="driver-list-header-container">
                    <h1>Driver List</h1>
                    <div className={'driver-header-action'}>
                        <div className="search-container">
                            <SearchOutlined className='searchIcon' />
                            <input
                                type="text"
                                placeholder="Search by ID"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button type="primary" id="add-driver-button" onClick={() => navigate('/add-driver')}>
                            <UsergroupAddOutlined /> 
                            <span>Add Driver</span>
                        </Button>
                    </div>
                </div>

                <br/>

                <Table 
                    columns={columns} 
                    dataSource={filteredData} 
                    rowKey="id" 
                    pagination={{ pageSize: 5 }}
                />

                {isDeletePopupVisible && (
                    <div id="delete" className="popup-container">
                        <div>
                            <span className="delete-close-popup-btn" onClick={() => setIsDeletePopupVisible(false)}>&times;</span>
                            <p>Are you sure you want to delete {driverToRemove?.Fname}?</p>
                            <button id="YES" onClick={() => handleDeleteDriver(driverToRemove.id)}>Yes</button>
                            <button id="NO" onClick={() => setIsDeletePopupVisible(false)}>No</button>
                        </div>
                    </div>
                )}

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

export default DriverList;