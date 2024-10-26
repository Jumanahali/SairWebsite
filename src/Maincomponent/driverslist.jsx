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
            align:'center',
        },
        {
            title: 'Driver Name',
            dataIndex: 'DriverName',
            key: 'DriverName',
            align:'center',
            render: (text, record) => `${record.Fname} ${record.Lname}`,
        },
        {
            title: 'Phone Number',
            dataIndex: 'PhoneNumber',
            key: 'PhoneNumber',
            align:'center',
        },
        {
            title: 'Email',
            dataIndex: 'Email',
            key: 'Email',
            align:'center',
        },
        {
            title: 'Details',
            key: 'Details',
            align:'center',
            render: (text, record) => (
                <img
                    style={{ cursor: 'pointer' }}
                    src={EyeIcon}
                    alt="Details"
                    onClick={() => viewDriverDetails(record.DriverID)}
                />
            ),
        },
        {
            title: 'Actions',
            key: 'Actions',
            align:'center',
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

    const filteredData = driverData.filter(driver => {
        // Combine first and last names for a more flexible search
        const fullName = `${driver.Fname} ${driver.Lname}`.toLowerCase();
        const driverID = driver.DriverID.toLowerCase();
        const query = searchQuery.toLowerCase();
    
        return driverID.includes(query) || fullName.includes(query);
    });
    
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

    const viewDriverDetails = (driverID) => {
        console.log('Navigating to details for driver ID:', driverID); // Add this line
        navigate(`/driver-details/${driverID}`);
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
                            <li><a className="active" onClick={() => navigate('/driverslist')}>Drivers List</a></li>
                            <li><a onClick={() => navigate('/motorcycleslist')}>Motorcycles List</a></li>
                            <li><a onClick={() => navigate('/employee-profile')}>Profile</a></li>
                        </ul>
                    </div>
                    <button className="logoutBu" onClick={handleLogout}>
                        <img className="logout" src={logoutIcon} alt="Logout"/>
                    </button>
                </nav>
            </header>     
            <div className="breadcrumb" Style={{marginRight:'100px'}}>
                <a onClick={() => navigate('/employer-home')}>Home</a>
                <span> / </span>
                <a onClick={() => navigate('/driverslist')}>Driver List</a>
            </div>
            <div className='body' style={{padding:'0px 150px'}}>
                <div className="driver-list-header-container">
                    <h1>Driver List</h1>
                    <div className={'driver-header-action'}>
                        <div className="search-container">
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="#059855" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
            </svg>
                            <input
                                type="text"
                                placeholder="Search by Driver ID or Driver Name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{width:"300px"}}
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
                    style={{ width: '1200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '0 auto' }}
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