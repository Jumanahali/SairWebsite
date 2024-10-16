import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase'; // Adjust the import path based on your project
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import successImage from '../images/Sucess.png';
import errorImage from '../images/Error.png';
import TrashIcon from '../images/Trash.png';
import PencilIcon from '../images/pencil.png';
import SAIRlogo from '../images/SAIRlogo.png';
import ProfileImage from '../images/Profile.PNG';
import LogoutIcon from '../images/logout.png';
import { useNavigate } from 'react-router-dom';



const Profile = () => {
    const [Employer, setEmployer] = useState({
        Fname: '',
        Lname: '',
        commercialNumber: '',
        Email: '',
        PhoneNumber: '',
        CompanyName: '',
        CompanyEmail: '',
        Password: '',
    });
    const [editableField, setEditableField] = useState(null);
    const [tempValue, setTempValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [popupImage, setPopupImage] = useState('');
    const [emailError, setEmailError] = useState('');
    const [companyEmailError, setCompanyEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmationError, setConfirmationError] = useState('');
    const [currentUserName, setCurrentUserName] = useState('');
    const navigate = useNavigate();



    // Fetch employer data from Firestore
    useEffect(() => {
    const employerUID = sessionStorage.getItem('employerUID'); // Get the stored UID
    if (!employerUID) {
        setError('Employer UID not found');
        setLoading(false);
        return;
    }

    const fetchEmployer = async () => {
        try {
            const docRef = doc(db, 'Employer', employerUID);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setCurrentUserName(docSnap.data().Fname);
                setEmployer(docSnap.data());
            } else {
                setError('Employer not found');
            }
        } catch (err) {
            setError('Error fetching employer data');
        } finally {
            setLoading(false);
        }
    };

    fetchEmployer();
}, []);

    // Handle field edit
    const handleEditClick = (field) => {
        setEditableField(field);
        setTempValue(Employer[field]); // Store current value for editing
        if (field === 'Password') {
            setConfirmPassword('');
            setIsEditing(true); // Set editing mode for password
        }
    };

    // Handle change in input
    const handleChange = (e) => {
        const value = e.target.value;
        setTempValue(value);
        if (editableField === 'Email') {
            const error = validateEmail(value);
            setEmailError(error);
        } else if (editableField === 'CompanyEmail') {
            const error = validateEmail(value);
            setCompanyEmailError(error);
        }
        if (editableField === 'PhoneNumber') {
            const error = validatePhoneNumber(value);
            setPhoneError(error); // Set error state if validation fails
        }
        if (editableField === 'Password') {
            const error = validatePassword(value);
            setPasswordError(error); // Set error state if validation fails
        }
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        setConfirmationError('');
    };

    // Save the updated profile
    const handleSave = async (field) => {
        try {
            if (field === 'Password' && tempValue !== confirmPassword) {
                setError('Passwords do not match!');
                return;
            }

            const updatedData = { ...Employer, [field]: tempValue };
            setEmployer(updatedData);

            const docRef = doc(db, 'Employer', employerUID);
            await updateDoc(docRef, { [field]: tempValue });

            setPopupMessage(field+' updated successfully');
            setPopupImage(successImage);
            setPopupVisible(true);

            // Reset edit state
            setEditableField(null);
            setConfirmPassword('');
            setTempValue('');
        } catch (error) {
            setPopupMessage('Failed to update profile');
            setPopupImage(errorImage);
            setPopupVisible(true);
        } finally {
            setEmailError('');
            setCompanyEmailError('');
            setPhoneError('');
            setPasswordError('');
            setConfirmationError(''); // Clear any confirmation error after the process
        }
    };

    // Handle pop-up close
    const handleClosePopup = () => {
        setPopupVisible(false);
    };

    const validateEmail = (email) => {
        if (email.trim() === '') {
            return '';
        }
        const emailRegex = /\S+@\S+\.\S+/;
        return emailRegex.test(email) ? '' : 'Invalid email address';
    };

    const validatePhoneNumber = (phoneNumber) => {
        if (phoneNumber.trim() === '') {
            return '';
        }
        const phoneRegex = /^\+?\d{10}$/; // Allows optional + followed by exactly 10 digits
        return phoneRegex.test(phoneNumber) ? '' : 'Phone number must start with +966 and be followed by 9 digits.';
    };

    const validatePassword = (Password) => {
        if (Password.trim() === '') {
            return '';
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=]).{8,}$/;
        return passwordRegex.test(Password) ? '' : 'Password must contain 8+ characters, including uppercase, lowercase, number, and special character.';
    };

    const handleLogout = () => {
      console.log('Logout initiated');
      auth.signOut().then(() => {
          console.log('Logout successful');
          navigate('/'); 
      }).catch((error) => {
          console.error('Error LOGGING out:', error);
      });
  };

    // Handle cancel
    const handleCancel = () => {
        setEditableField(null);
        setTempValue('');
        setConfirmPassword(''); // Reset confirm password
        setEmailError('');
        setCompanyEmailError('');
        setPhoneError('');
        setPasswordError('');
        setConfirmationError('');
        setIsEditing(false);
    };
    const handleNavigation = (path) => {
      navigate(path);
  };

    if (error) return <p>{error}</p>;


    return (
      
        <div className="profile-container">
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
            <h1>My Profile</h1>
            <div className="profile-fieldpro">
                <label className='prolabel'>First Name</label>
                {editableField === 'Fname' ? (
                    <>
                        <input type="text" value={tempValue} onChange={handleChange} />
                        <button className='edit' onClick={() => handleSave('Fname')}                          disabled={ !tempValue} // Disable save if fields are empty
                        >Save</button>
                        <button className='edit' onClick={handleCancel}>Cancel</button>
                    </>
                ) : (
                    <>
                        <div>
                    <input
                    type="text"
                    value={Employer.Fname}
                    readOnly
                />
                   <button className='edit' onClick={() => handleEditClick('Fname')}>Edit</button>
                </div>
                    </>
                )}
            </div>

           
            <div className="profile-fieldpro">
                <label className='prolabel'>Last Name</label>
                {editableField === 'Lname' ? (
                    <>
                        <input type="text" value={tempValue} onChange={handleChange} />
                        <button className='edit' onClick={() => handleSave('Lname')}                          disabled={ !tempValue} // Disable save if fields are empty
                        >Save</button>
                        <button className='edit' onClick={handleCancel}>Cancel</button>
                    </>
                ) : (
                    <>
                        <div>
                    <input
                    type="text"
                    value={Employer.Lname}
                    readOnly
                />
                   <button className='edit' onClick={() => handleEditClick('Lname')}>Edit</button>
                </div>
                    </>
                )}
            </div>

            <div className="profile-fieldpro">
    <label className='prolabel'>Commercial Number</label><br></br>
    <input
        type="text"
        value={Employer.commercialNumber} 
        readOnly 
    />
</div>


<div className="profile-fieldpro">
                <label className='prolabel'>Email</label>
                {editableField === 'Email' ? (
                    <>
                        <input type="text" value={tempValue} onChange={handleChange} />
                        <button className='edit' onClick={() => handleSave('Email')}                          disabled={ !tempValue} // Disable save if fields are empty
                        >Save</button>
                        <button className='edit' onClick={handleCancel}>Cancel</button>
                    </>
                ) : (
                    <>
                        <div>
                    <input
                    type="text"
                    value={Employer.Email}
                    readOnly
                />
                   <button className='edit' onClick={() => handleEditClick('Email')}>Edit</button>
                </div>
                        
                    </>
                )}
                            {emailError && <p style={{ color: 'red', margin: '0 0 0.5rem 0' }}>{emailError}</p>} 

            </div>

            <div className="profile-fieldpro">
                <label className='prolabel'>Phone Number</label>
                {editableField === 'PhoneNumber' ? (
                    <>
                        <input type="tel" value={tempValue} onChange={handleChange} />
                        <button className='edit' onClick={() => handleSave('PhoneNumber')}                          disabled={ !tempValue} // Disable save if fields are empty
                        >Save</button>
                        <button className='edit' onClick={handleCancel}>Cancel</button>
                    </>
                ) : (
                    <>
                        <div>
                    <input
                    type="text"
                    value={Employer.PhoneNumber}
                    readOnly
                />
                   <button className='edit' onClick={() => handleEditClick('PhoneNumber')}>Edit</button>
                </div>
                    </>
                )}
                {phoneError && <p style={{ color: 'red', margin: '0 0 0.5rem 0' }}>{phoneError}</p>} 

            </div>

            <div className="profile-fieldpro">
                <label className='prolabel'>Company Name</label>
                {editableField === 'CompanyName' ? (
                    <>
                        <input type="text" value={tempValue} onChange={handleChange} />
                        <button className='edit' onClick={() => handleSave('CompanyName')}                          disabled={ !tempValue} // Disable save if fields are empty
                        >Save</button>
                        <button className='edit' onClick={handleCancel}>Cancel</button>
                    </>
                ) : (
                    <>
                       <div>
                    <input
                    type="text"
                    value={Employer.CompanyName}
                    readOnly
                />
                   <button className='edit' onClick={() => handleEditClick('CompanyName')}>Edit</button>
                </div>
                    </>
                )}

            </div>

            <div className="profile-fieldpro">
                <label className='prolabel'>Company Email</label>
                {editableField === 'CompanyEmail' ? (
                    <>
                        <input type="email" value={tempValue} onChange={handleChange} />
                        <button className='edit' onClick={() => handleSave('CompanyEmail')}                          disabled={ !tempValue} // Disable save if fields are empty
                        >Save</button>
                        <button className='edit' onClick={handleCancel}>Cancel</button>
                    </>
                ) : (
                    <>
                        <div>
                    <input
                    type="text"
                    value={Employer.CompanyEmail}
                    readOnly
                />
                   <button className='edit' onClick={() => handleEditClick('CompanyEmail')}>Edit</button>
                </div>
                    </>
                )}
                            {companyEmailError && <p style={{ color: 'red', margin: '0 0 0.5rem 0' }}>{companyEmailError}</p>} 

            </div>

            <div className="profile-fieldpro">
                <label className='prolabel'>Password</label>
                {editableField === 'Password' ? (
                    <>
                        <input type="password" value={tempValue} onChange={handleChange} />
                        {passwordError && <p style={{ color: 'red', margin: '0 0 0.5rem 0' }}>{passwordError}</p>}

                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            placeholder="Confirm Password"
                        />
                        <button className='edit' onClick={() => handleSave('Password')}      
                         disabled={!tempValue || !confirmPassword} // Disable save if fields are empty
                        >Save</button>
                        <button className='edit' onClick={handleCancel}>Cancel</button>
                        <br></br>
                        {confirmationError && <p style={{ color: 'red', margin: '0 0 0.5rem 0' }}>{confirmationError}</p>}
                    </>
                ) : (
                    <>
                       <div>
                        <input type="password" value={Employer.Password} readOnly />
                        <button className='edit' onClick={() => handleEditClick('Password')}>Edit</button>
                    </div>
                    </>
                )}
            </div>

            



            {/* Popup message */}
            {popupVisible && (
                <div className="popup">
                    <button className="close-btn" onClick={handleClosePopup}>×</button>
                    <img src={popupImage} alt="Popup" />
                    <p>{popupMessage}</p>
                </div>
            )}
        </div>
    );
};

export default Profile;
