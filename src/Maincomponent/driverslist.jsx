import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import {
    collection,doc,onSnapshot,deleteDoc,addDoc,getDoc,query,where,setDoc} from 'firebase/firestore';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import TrashIcon from '../images/Trash.png';
import PencilIcon from '../images/pencil.png';
import SAIRlogo from '../images/SAIRlogo.png';
import ProfileImage from '../images/Profile.PNG';
import LogoutIcon from '../images/logout.png';
import AddIcon from '../images/add.png';
import SearchIcon from '../images/search.png';
import EyeIcon from '../images/eye.png'; 
import '../Driverlist.css';
import successImage from '../images/Sucess.png'; 
import errorImage from '../images/Error.png'; 


const DriverList = () => {
    const [driverData, setDriverData] = useState([]);
    const [isAddPopupVisible, setIsAddPopupVisible] = useState(false);
    const [driverToRemove, setDriverToRemove] = useState(null);
    const [isDeletePopupVisible, setIsDeletePopupVisible] = useState(false);
    const [currentUserName, setCurrentUserName] = useState('');
    const [availableMotorcycles, setAvailableMotorcycles] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [driverToEdit, setDriverToEdit] = useState(null);
    const [newDriver, setNewDriver] = useState({
        DriverID: '',
        Fname: '',
        Lname: '',
        PhoneNumber: '',
        GPSnumber: null,
        CompanyName: '', 
    });
    const [isNotificationVisible, setIsNotificationVisible] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(true);
    const [violations, setViolations] = useState([]);
    const [isDetailsPopupVisible, setIsDetailsPopupVisible] = useState(false);
    const [currentDriverID, setCurrentDriverID] = useState('');
    const [currentLocation, setCurrentLocation] = useState(null);
    const [isDeleteSuccess, setIsDeleteSuccess] = useState(false); // New state for delete success

    const navigate = useNavigate();

    const handleLogout = () => {
        auth.signOut().then(() => {
            navigate('/'); 
        }).catch((error) => {
            console.error('Error LOGGING out:', error);
        });
    };

    const handleEditDriver = (driver) => {
        setIsEditMode(true);
        setIsAddPopupVisible(true);
        setDriverToEdit(driver);
        setNewDriver({
            DriverID: driver.DriverID,
            Fname: driver.Fname,
            Lname: driver.Lname,
            PhoneNumber: driver.PhoneNumber,
            GPSnumber: driver.GPSnumber || '',
            CompanyName: driver.CompanyName, 
        });
    };

    const generateRandomPassword = (length = 8) => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
        let password = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        return password;
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
                        setNewDriver((prevState) => ({
                            ...prevState,
                            CompanyName: docSnap.data().CompanyName, 
                        }));
                    } else {
                        console.log("No such document!");
                    }
                } catch (error) {
                    console.error('Error fetching employer data:', error);
                }
            }
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

        fetchUserName();
        fetchDrivers();
        fetchMotorcycles();
    }, []);

    const handleDeleteDriver = async (driverId) => {
        try {
            await deleteDoc(doc(db, 'Driver', driverId));
            setIsDeleteSuccess(true); // Set delete success state
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

    const handleAddDriverSubmit = async (e) => {
        e.preventDefault();
        if (!newDriver.DriverID || !newDriver.Fname || !newDriver.Lname || !newDriver.PhoneNumber) {
            setIsSuccess(false);
            setNotificationMessage('Please fill in all required fields');
            setIsNotificationVisible(true);
            return;
        }

        try {
            if (isEditMode && driverToEdit) {
                const driverDocRef = doc(db, 'Driver', driverToEdit.id);
                await setDoc(driverDocRef, {
                    DriverID: newDriver.DriverID,
                    Fname: newDriver.Fname,
                    Lname: newDriver.Lname,
                    PhoneNumber: newDriver.PhoneNumber,
                    GPSnumber: newDriver.GPSnumber || null,
                    CompanyName: newDriver.CompanyName
                });
                setIsSuccess(true);
                setNotificationMessage('Driver updated successfully!');
            } else {
                const generatedPassword = generateRandomPassword();
                await addDoc(collection(db, 'Driver'), {
                    DriverID: newDriver.DriverID,
                    Fname: newDriver.Fname,
                    Lname: newDriver.Lname,
                    PhoneNumber: newDriver.PhoneNumber,
                    GPSnumber: newDriver.GPSnumber || null,
                    CompanyName: newDriver.CompanyName,
                    Password: generatedPassword,
                    isDefaultPassword: true
                });
                setIsSuccess(true);
                setNotificationMessage('Driver added successfully!');
            }
            
            setIsAddPopupVisible(false);
        } catch (error) {
            console.error('Error saving driver:', error);
            setIsSuccess(false);
            setNotificationMessage('Error saving driver. Please try again.');
        }

        setIsNotificationVisible(true);

        setNewDriver({
            DriverID: '',
            Fname: '',
            Lname: '',
            PhoneNumber: '',
            GPSnumber: null,
            CompanyName: newDriver.CompanyName
        });
        setIsEditMode(false);
        setDriverToEdit(null);
    };

    const openDeleteConfirmation = (driver) => {
        setDriverToRemove(driver);
        setIsDeletePopupVisible(true);
    };

    const openDetailsPopup = async (driverID) => {
        setCurrentDriverID(driverID);
        const violationQuery = query(
            collection(db, 'Violation'),
            where('DriverID', '==', driverID)
        );
        const unsubscribe = onSnapshot(violationQuery, (snapshot) => {
            const violationsList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setViolations(violationsList);
            // Set location for the first violation for demonstration
            if (violationsList.length > 0 && violationsList[0].Location) {
                setCurrentLocation({
                    lat: violationsList[0].Location._lat,
                    lng: violationsList[0].Location._long
                });
            }
        });
        setIsDetailsPopupVisible(true);

        return () => unsubscribe();
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div>
            <header className="header-container">
                <img src={SAIRlogo} alt="SAIR logo" className="logo-image" />
                <div className="user-info-container">
                    <button className="logout-button" onClick={handleLogout}><img className='logout-icon' src={LogoutIcon} alt="Logout" /></button>
                    <div className="profile-section-container">
                        <img id='profile-image' src={ProfileImage} alt="Profile" />
                        <span id='name'>{currentUserName}</span>
                    </div>
                </div>
            </header>

            <nav className="navbar-container">
                <a onClick={() => handleNavigation('/employer-home')}>Home</a>
                <a onClick={() => handleNavigation('/violations')}>Violations List</a>
                <a onClick={() => handleNavigation('/crashes')}>Crashes List</a>
                <a onClick={() => handleNavigation('/complaints')}>Complaints List</a>
                <a onClick={() => handleNavigation('/driverslist')}>Drivers List</a>
                <a onClick={() => handleNavigation('/motorcycleslist')}>Motorcycles List</a>
                <a onClick={() => handleNavigation('/employee-profile')}>Profile page</a>
            </nav>

            <hr />

            <div className="driver-list-header-container">
                <h1>Drivers List</h1>
                <button id="add-driver-button" onClick={() => {
                    setIsAddPopupVisible(true);
                    setIsEditMode(false); 
                    setNewDriver({
                        DriverID: '',
                        Fname: '',
                        Lname: '',
                        PhoneNumber: '',
                        GPSnumber: null,
                        CompanyName: newDriver.CompanyName
                    });
                }}>
                    <img src={AddIcon} alt="Add" /> Add Driver
                </button>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search by ID"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <table className="driver-table">
                <thead>
                    <tr>
                        <th>Driver ID</th>
                        <th>Driver Name</th>
                        <th>Phone Number</th>
                        <th>Details</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {driverData
                        .filter(driver => driver.DriverID.includes(searchQuery))
                        .map((driver) => (
                        <tr key={driver.id}>
                            <td>{driver.DriverID}</td>
                            <td>{driver.Fname} {driver.Lname}</td>
                            <td>{driver.PhoneNumber}</td>
                            <td className="details-container">
                                <img style={{ cursor: 'pointer' }} src={EyeIcon} alt="Details" onClick={() => openDetailsPopup(driver.DriverID)} />
                            </td>
                            <td className="actions-container">
                                <img style={{ cursor: 'pointer' }} src={TrashIcon} alt="Delete" onClick={() => openDeleteConfirmation(driver)} />
                                <img style={{ cursor: 'pointer' }} src={PencilIcon} alt="Edit" onClick={() => handleEditDriver(driver)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

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

            {isAddPopupVisible && (
                <div className="popup-container">
                    <div className="popup-content">
                        <span className="close-popup-btn" onClick={() => setIsAddPopupVisible(false)}>&times;</span>
                        <h3>{isEditMode ? 'Edit Driver' : 'Add Driver'}</h3>
                        <form onSubmit={handleAddDriverSubmit}>
                            <input
                                type="text"
                                placeholder='Driver ID'
                                value={newDriver.DriverID}
                                onChange={(e) => setNewDriver((prevState) => ({
                                    ...prevState,
                                    DriverID: e.target.value
                                }))}
                            />
                            <input
                                type="text"
                                placeholder='First Name'
                                value={newDriver.Fname}
                                onChange={(e) => setNewDriver((prevState) => ({
                                    ...prevState,
                                    Fname: e.target.value
                                }))}
                            />
                            <input
                                type="text"
                                placeholder='Last Name'
                                value={newDriver.Lname}
                                onChange={(e) => setNewDriver((prevState) => ({
                                    ...prevState,
                                    Lname: e.target.value
                                }))}
                            />
                            <input
                                type="text"
                                placeholder='Phone Number'
                                value={newDriver.PhoneNumber}
                                onChange={(e) => setNewDriver((prevState) => ({
                                    ...prevState,
                                    PhoneNumber: e.target.value
                                }))}
                            />
                            <select
                                value={newDriver.GPSnumber}
                                onChange={(e) => setNewDriver((prevState) => ({
                                    ...prevState,
                                    GPSnumber: e.target.value
                                }))}
                            >
                                <option value="">Select Motorcycle</option>
                                <option value="null">None</option>
                                {availableMotorcycles.map((motorcycle) => (
                                    <option key={motorcycle.id} value={motorcycle.GPSnumber}>
                                        {motorcycle.GPSnumber}
                                    </option>
                                ))}
                            </select>
                            <button id='button' type="submit">
                                {isEditMode ? 'Update Driver' : 'Add Driver'}
                            </button>
                        </form>
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

{isDetailsPopupVisible && (
    <div className="popup-container details-popup">
        <div className="popup-content">
            <span className="close-popup-btn" onClick={() => setIsDetailsPopupVisible(false)}>&times;</span>
            <h3>Violations for Driver ID: {currentDriverID}</h3>
            {violations.length > 0 ? (
                <table className="details-table">
                    <thead>
                        <tr>
                            <th>Speed</th>
                            <th>Street Speed</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Price</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {violations.map((violation) => {
                            const date = violation.DateTime?.seconds 
                                ? new Date(violation.DateTime.seconds * 1000).toLocaleDateString() 
                                : 'N/A';
                            const time = violation.DateTime?.seconds 
                                ? new Date(violation.DateTime.seconds * 1000).toLocaleTimeString() 
                                : 'N/A';

                            return (
                                <tr key={violation.id}>
                                    <td>{violation.Speed}</td>
                                    <td>{violation.MaxSpeed || 'N/A'}</td>
                                    <td>{date}</td>
                                    <td>{time}</td>
                                    <td>{violation.Price}</td>
                                    <td>
                                        {violation.Location ? (
                                            <div>
                                                <LoadScript googleMapsApiKey="AIzaSyD3Hwzp5W-Rcdoe0tlWnrHCQZ_67nN1iHI">
                                                    <GoogleMap
                                                        mapContainerStyle={{ height: "200px", width: "200px" }}
                                                        center={{
                                                            lat: violation.Location.latitude, 
                                                            lng: violation.Location.longitude, 
                                                        }}
                                                        zoom={15}
                                                    >
                                                        <Marker
                                                            position={{
                                                                lat: violation.Location.latitude,
                                                                lng: violation.Location.longitude,
                                                            }}
                                                        />
                                                    </GoogleMap>
                                                </LoadScript>
                                            </div>
                                        ) : (
                                            <p>No location data available</p> 
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <p>No violations found for this driver.</p>
            )}
        </div>
    </div>
)}
        </div>
    );
};

export default DriverList;