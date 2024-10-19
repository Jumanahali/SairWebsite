import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { collection, doc, onSnapshot, deleteDoc, addDoc, getDoc } from 'firebase/firestore';
import TrashIcon from '../images/Trash.png';
import PencilIcon from '../images/pencil.png';
import ProfileImage from '../images/Profile.PNG';
import AddIcon from '../images/addmotorcycle.png';
import SearchIcon from '../images/search.png';
import EyeIcon from '../images/eye.png';
import '../motorcyclelist.css';
import successImage from '../images/Sucess.png';
import errorImage from '../images/Error.png';
import SAIRLogo from '../images/SAIRlogo.png'; 
import logoutIcon from '../images/logout.png'; 
const MotorcycleList = () => {
    const [motorcycleData, setMotorcycleData] = useState([]);
    const [driverData, setDriverData] = useState([]);
    const [isAddPopupVisible, setIsAddPopupVisible] = useState(false);
    const [currentUserName, setCurrentUserName] = useState('');
    const [companyName, setCompanyName] = useState(''); // State for company name
    const [searchQuery, setSearchQuery] = useState('');
    const [newMotorcycle, setNewMotorcycle] = useState({
        GPSnumber: '',
        LicensePlate: '',
        DriverID: null,
    });
    const [isNotificationVisible, setIsNotificationVisible] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(true);

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
            GPSnumber: '',
            LicensePlate: '',
            DriverID: null,
        });
    };

    const handleNavigation = (path) => {
        navigate(path);
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
                <li><a  onClick={() => navigate('/employer-home')}>Home</a></li>
                <li><a onClick={() => navigate('/violations')}>Violations List</a></li>
                <li><a onClick={() => navigate('/crashes')}>Crashes List</a></li>           
                <li><a onClick={() => navigate('/complaints')}>Complaints List</a></li>
                <li><a onClick={() => navigate('/driverslist')}>Drivers List</a></li>
                <li><a onClick={() => navigate('/motorcycleslist')}>Motorcycles List</a></li>
                <li><a onClick={() => navigate('/employee-profile')}>Profile</a></li>
              </ul>
            </div>
            <button className="logoutBu" onClick={handleLogout}>
              <img className="logout" src={logoutIcon} alt="Logout"/>
            </button>
          </nav>
        </header>     <div class="breadcrumb">
        <a onClick={() => navigate('/employer-home')}>Home</a>
        <span> / </span>
        <a onClick={() => navigate('/motorcycleslist')}>Motorcycles List</a>
      </div>

            <div className="motorcycle-list-header-container">
                <h1>Motorcycles List</h1>
                <button className="add-motorcycle-button" onClick={() => {
                    setIsAddPopupVisible(true);
                    setNewMotorcycle({
                        GPSnumber: '',
                        LicensePlate: '',
                        DriverID: null,
                    });
                }}>
                    <img src={AddIcon} alt="Add" /> Add Motorcycle
                </button>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search by GPS Number"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <table className="motorcycle-table">
                <thead>
                    <tr>
                        <th>GPS Number</th>
                        <th>License Plate</th>
                        <th>Details</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {motorcycleData
                        .filter(motorcycle => motorcycle.GPSnumber.includes(searchQuery))
                        .map((motorcycle) => (
                        <tr key={motorcycle.id}>
                            <td>{motorcycle.GPSnumber}</td>
                            <td>{motorcycle.LicensePlate}</td>
                            <td className="details-container">
                                <img style={{ cursor: 'pointer' }} src={EyeIcon} alt="Details" />
                            </td>
                            <td className="actions-container">
                                <img style={{ cursor: 'pointer' }} src={TrashIcon} alt="Delete" onClick={() => handleDeleteMotorcycle(motorcycle.id)} />
                                <img style={{ cursor: 'pointer' }} src={PencilIcon} alt="Edit" />
                            </td>
                        </tr>
                    ))} 
                </tbody>
            </table>

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

            {isNotificationVisible && (
                <div className={`notification-popup ${isSuccess ? 'success' : 'error'}`}>
                    <span className="close-popup-btn" onClick={() => setIsNotificationVisible(false)}>&times;</span>
                    <img src={isSuccess ? successImage : errorImage} alt={isSuccess ? 'Success' : 'Error'} />
                    <p>{notificationMessage}</p>
                </div>
            )}
        </div>
    );
};

export default MotorcycleList;