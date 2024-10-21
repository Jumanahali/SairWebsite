import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { collection, doc, onSnapshot, deleteDoc, addDoc, getDoc } from 'firebase/firestore';
import TrashIcon from '../images/Trash.png';
import PencilIcon from '../images/pencil.png';
import EyeIcon from '../images/eye.png';
import '../motorcyclelist.css';
import successImage from '../images/Sucess.png';
import errorImage from '../images/Error.png';
import SAIRLogo from '../images/SAIRlogo.png';
import logoutIcon from '../images/logout.png';
import { Button, Table } from 'antd';
import { SearchOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { BsScooter } from 'react-icons/bs';
import { GiScooter } from 'react-icons/gi';
const MotorcycleList = () => {
  const [motorcycleData, setMotorcycleData] = useState([]);
  const [driverData, setDriverData] = useState([]);
  const [isAddPopupVisible, setIsAddPopupVisible] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [companyName, setCompanyName] = useState(''); // State for company name
  const [searchQuery, setSearchQuery] = useState('');
  const [newMotorcycle, setNewMotorcycle] = useState({
    MotorcycleID: '',
    GPSnumber: '',
    LicensePlate: '',
    DriverID: null,
  });
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const [motorcycleToRemove, setMotorcycleToRemove] = useState(null);
  const [isDeletePopupVisible, setIsDeletePopupVisible] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/');
    }).catch((error) => {
      console.error('Error logging out:', error);
    });
  };

  useEffect(() => {

    const employerUID = sessionStorage.getItem('employerUID');

    const fetchUserName = async () => {
      if (employerUID) {
        try {
          const userDocRef = doc(db, 'Employer', employerUID);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setCurrentUserName(docSnap.data().Fname);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error('Error fetching employer data:', error);
        }
      }
    };
    const fetchMotorcycles = () => {
      const motorcycleCollection = collection(db, 'Motorcycle');
      const unsubscribe = onSnapshot(motorcycleCollection, (snapshot) => {
        const motorcycleList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMotorcycleData(motorcycleList);
      });
      return () => unsubscribe();
    };

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

    const fetchCompanyData = async () => {
      const employerUID = sessionStorage.getItem('employerUID');
      if (employerUID) {
        try {
          const companyDocRef = doc(db, 'Employer', employerUID);
          const docSnap = await getDoc(companyDocRef);
          if (docSnap.exists()) {
            const companyData = docSnap.data();
            setCompanyName(companyData.CompanyName); // Set the company name
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error('Error fetching company data:', error);
        }
      }
    };
    fetchUserName();
    fetchMotorcycles();
    fetchDrivers();
    fetchCompanyData();
  }, []);


  const openDeleteConfirmation = (driver) => {
    setMotorcycleToRemove(driver);
    setIsDeletePopupVisible(true);
  };

  const handleDeleteMotorcycle = async (motorcycleId) => {
    try {
      await deleteDoc(doc(db, 'Motorcycle', motorcycleId));
      setIsSuccess(true); 
      setNotificationMessage('Motorcycle deleted successfully!');
    } catch (error) {
      console.error('Error deleting motorcycle:', error);
      setIsSuccess(false);
      setNotificationMessage('Error deleting motorcycle. Please try again.');
    }
    setIsNotificationVisible(true);
      setIsDeletePopupVisible(false);
  };

  const handleAddMotorcycleSubmit = async (e) => {
    e.preventDefault();
    if (!newMotorcycle.GPSnumber || !newMotorcycle.LicensePlate) {
      setIsSuccess(false);
      setNotificationMessage('Please fill in all required fields');
      setIsNotificationVisible(true);
      return;
    }

    try {
      await addDoc(collection(db, 'Motorcycle'), {
        MotorcycleID: newMotorcycle.MotorcycleID,
        GPSnumber: newMotorcycle.GPSnumber,
        LicensePlate: newMotorcycle.LicensePlate,
        DriverID: newMotorcycle.DriverID || null,
        CompanyName: companyName, // Save the company name from the Employer collection
      });
      setIsSuccess(true);
      setNotificationMessage('Motorcycle added successfully!');
      setIsAddPopupVisible(false);
    } catch (error) {
      console.error('Error saving motorcycle:', error);
      setIsSuccess(false);
      setNotificationMessage(`Error saving motorcycle: ${error.message}`);
    }

    setIsNotificationVisible(true);
    setNewMotorcycle({
      MotorcycleID: '',
      GPSnumber: '',
      LicensePlate: '',
      DriverID: null,
    });
  }; 

  const filteredData = motorcycleData
    .filter(motorcycle => motorcycle.GPSnumber.includes(searchQuery))
 

  const columns = [
    {
      title: 'Motorcycle ID', // Column for Motorcycle ID from DB
      dataIndex: 'MotorcycleID', // Use the MotorcycleID from DB
      key: 'MotorcycleID',
    },
    {
      title: 'GPS Number',
      dataIndex: 'GPSnumber',
      key: 'GPSnumber',
    },
    {
      title: 'License Plate',
      dataIndex: 'LicensePlate',
      key: 'LicensePlate', 
    },
    {
      title: 'Motorcycle Type ',
      dataIndex: 'Type',
      key: 'Type',
    },
    {
      title: 'Motorcycle Model ',
      dataIndex: 'Model',
      key: 'Model',
    }, 
    {
      title: 'Motorcycle Brand ',
      dataIndex: 'Brand',
      key: 'Brand',
    },
    {
      title: 'Details',
      key: 'Details',
      render: (text, record) => (
        <img
          style={{ cursor: 'pointer' }}
          src={EyeIcon}
          alt="Details"
        // onClick={() => viewViolationDetails(record.DriverID)}
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
          // onClick={() => handleEditDriver(record)}
          />
        </div>
      ),
    },
  ];
 console.log('motorcycleData', motorcycleData);
  return (
    <  >
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
      <main>

        <div className="breadcrumb">
          <a onClick={() => navigate('/employer-home')}>Home</a>
          <span> / </span>
          <a onClick={() => navigate('/motorcycleslist')}>Motorcycles List</a>
        </div> 

        <div className="driver-list-header-container">
          <h1>Motorcycles List</h1>
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

            <Button type="primary" id="add-driver-button" onClick={() => {
              navigate('/add-motorcycle')
            }}>
              <GiScooter height={200} />
              <span>Add Motorcycle</span>
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />


        {isAddPopupVisible && (
          <div className="popup-container">
            <div className="popup-content">
              <span className="close-popup-btn" onClick={() => setIsAddPopupVisible(false)}>&times;</span>
              <h3>Add Motorcycle</h3>
              <form onSubmit={handleAddMotorcycleSubmit}>
                <input
                  type="text"
                  placeholder='GPS Number'
                  value={newMotorcycle.GPSnumber}
                  onChange={(e) => setNewMotorcycle((prevState) => ({
                    ...prevState,
                    GPSnumber: e.target.value,
                  }))}
                />
                <input
                  type="text"
                  placeholder='License Plate'
                  value={newMotorcycle.LicensePlate}
                  onChange={(e) => setNewMotorcycle((prevState) => ({
                    ...prevState,
                    LicensePlate: e.target.value,
                  }))}
                />
                <select
                  value={newMotorcycle.DriverID || ''}
                  onChange={(e) => setNewMotorcycle((prevState) => ({
                    ...prevState,
                    DriverID: e.target.value === 'None' ? null : e.target.value
                  }))}>
                  <option value="None">None</option>
                  {driverData.map(driver => (
                    <option key={driver.id} value={driver.id}>{driver.DriverID}</option>
                  ))}
                </select>
                <button type="submit">Add</button>
              </form>
            </div>
          </div>
        )}

        {isDeletePopupVisible && (
          <div id="delete" className="popup-container">
            <div>
              <span className="delete-close-popup-btn" onClick={() => setIsDeletePopupVisible(false)}>&times;</span>
              <p>Are you sure you want to delete {motorcycleToRemove?.GPSnumber}?</p>
              <button id="YES" onClick={() => handleDeleteMotorcycle(motorcycleToRemove.id)}>Yes</button>
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
      </main>
    </>
  );
};

export default MotorcycleList;