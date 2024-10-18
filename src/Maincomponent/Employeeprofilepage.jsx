import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; 
import { useNavigate } from 'react-router-dom'; 
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import successImage from '../images/Sucess.png'; 
import errorImage from '../images/Error.png'; 
import '@fortawesome/fontawesome-free/css/all.min.css';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const Profile = () => {
    const [Employer, setEmployer] = useState({
        Fname: '',
        Lname: '',
        commercialNumber: '',
        EmployeerEmail:'',
        PhoneNumber: '',
        CompanyName: '',
        CompanyEmail: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    
    const [originalEmployerData, setOriginalEmployerData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [validationMessages, setValidationMessages] = useState({
        phoneError: '',
        commercialNumberError: '',
        emailError: '',
        emailperError:'',
        currentPasswordError:'',
        newPassword:'',
        confirmNewPassword:'',
        currentPasswordEmpty:'',
    });

    const [loading, setLoading] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
    });
    const [currentPassValid, setCurrentPassValid] = useState(false); // New state for current password validity
    const navigate = useNavigate();

    useEffect(() => {
        const employerUID = sessionStorage.getItem('employerUID');
        const fetchEmployer = async () => {
            const docRef = doc(db, 'Employer', employerUID);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setEmployer(data);
                setOriginalEmployerData(data); // Store original data for cancel functionality
            } else {
                setPopupMessage('Employer not found');
            }
        }; 

        fetchEmployer();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployer({ ...Employer, [name]: value });

        

        switch (name) {
            case 'PhoneNumber':
                setValidationMessages((prev) => ({ ...prev, phoneError: validatePhoneNumber(value) }));
                break;
            case 'commercialNumber':
                setValidationMessages((prev) => ({ ...prev, commercialNumberError: validateCommercialNumber(value) }));
                break;
            case 'EmployeerEmail':
                setValidationMessages((prev) => ({ ...prev, emailperError: validateEmail(value) }));
                break;
            case 'CompanyEmail':
                setValidationMessages((prev) => ({ ...prev, emailError: validateEmail(value) }));
                break;
            case 'newPassword':
                setPasswordRequirements({
                    length: value.length >= 8,
                    uppercase: /[A-Z]/.test(value),
                    lowercase: /[a-z]/.test(value),
                    number: /\d/.test(value),
                    special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
                });
                break;
            case 'currentPassword':
                    // Check if the current password is correct (this will be done on submit)
                    break;
            default:
                break;
        }
    };

    const validatePhoneNumber = (phoneNumber) => {
        const phoneRegex = /^\+966\d{9}$/;
        return phoneRegex.test(phoneNumber) ? '' : 'Phone number must start with +966 and be followed by 9 digits.';
    }; 

    const validateCommercialNumber = (number) => {
        const numberRegex = /^\d{10}$/;
        return numberRegex.test(number) ? '' : 'Commercial number must be exactly 10 digits long.';
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) ? '' : 'Please enter a valid email address.';
    };


    const handleVerifyCurrentPassword = async () => {
        if (!Employer.currentPassword) {
            setValidationMessages((prev) => ({
                ...prev,
                currentPasswordEmpty: 'Please enter your current password to verify.',
                currentPasswordError: '',
            }));
            return;
        }
    
        const auth = getAuth();
        const user = auth.currentUser;
    
        try {
            const credential = EmailAuthProvider.credential(
                user.email,
                Employer.currentPassword
            );
    
            await reauthenticateWithCredential(user, credential);
            setCurrentPassValid(true);
            setValidationMessages((prev) => ({
                ...prev,
                currentPasswordError: '',
                currentPasswordEmpty: '',
            }));
        } catch (error) {
            console.error("Error verifying current password:", error);
            setCurrentPassValid(false);
            setValidationMessages((prev) => ({
                ...prev,
                currentPasswordError: 'Incorrect current password. Please try again.',
                currentPasswordEmpty: '',
            }));
        }
    };
    
    


    
    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        // Check for validation errors
        if (Object.values(validationMessages).some(msg => msg)) {
            console.log(validationMessages);
            setPopupMessage('Please fix validation errors.');
            setLoading(false);
            return;
        }
    
        // Check if new passwords match
        if (Employer.newPassword && Employer.newPassword !== Employer.confirmNewPassword) {
            setValidationMessages((prev) => ({
                ...prev,
                confirmNewPasswordError: 'New passwords do not match.',
            }));
            setLoading(false);
            return;
        }
    
        const employerUID = sessionStorage.getItem('employerUID');
        const auth = getAuth();
        const user = auth.currentUser;
    
        try {
            // Update the Firestore document first (except password)
            const docRef = doc(db, 'Employer', employerUID);
            const updateData = { ...Employer };
            delete updateData.currentPassword;
            delete updateData.newPassword;
            delete updateData.confirmNewPassword;
    
            await updateDoc(docRef, updateData);
    
            // If a new password is provided, re-authenticate and update it
            if (Employer.newPassword) {
                const credential = EmailAuthProvider.credential(
                    user.email,
                    Employer.currentPassword // Use current password for re-authentication
                );
    
                // Re-authenticate and then update the password
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, Employer.newPassword);
            }
    
            setPopupMessage('Profile updated successfully.');
            setEditMode(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            
                setPopupMessage('Failed to update profile.');
            
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEmployer(originalEmployerData); // Restore original data
        setEditMode(false); // Exit edit mode
        setValidationMessages({ // Clear validation messages
            phoneError: '',
            commercialNumberError: '',
            emailError: '',
            newPassword: '',
            confirmNewPassword: '',
            currentPasswordError:'',
            emailperError:'',
            currentPasswordEmpty:'',
        });
          // Reset password requirements to default (all false)
    setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
    });
    setCurrentPassValid(false); // Reset current password verification

    };
    

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="profile-container">
            <h1>My Profile</h1>
            <form onSubmit={handleSave}>
                <div>
                    <label>First Name</label>
                    <input
                        type="text"
                        name="Fname"
                        value={Employer.Fname}
                        onChange={handleChange}
                        disabled={!editMode}
                       required 
                    />
                </div>
                <div>
                    <label>Last Name</label>
                    <input
                        type="text"
                        name="Lname"
                        value={Employer.Lname}
                        onChange={handleChange}
                        disabled={!editMode}
                        required
                    />
                </div>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        name="EmployeerEmail"
                        value={Employer.EmployeerEmail}
                        onChange={handleChange}
                        disabled={!editMode}
                        required
                    />
                    {validationMessages.emailperError && <p style={{ color: 'red' }}>{validationMessages.emailperError}</p>}
                </div>
                <div>
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        name="PhoneNumber"
                        value={Employer.PhoneNumber}
                        onChange={handleChange}
                        disabled={!editMode}
                        required
                    />
                    {validationMessages.phoneError && <p style={{ color: 'red' }}>{validationMessages.phoneError}</p>}
                </div>
                <div>
                    <label>Commercial Number</label>
                    <input
                        type="text"
                        name="commercialNumber"
                        value={Employer.commercialNumber}
                        onChange={handleChange}
                        disabled={!editMode}
                        required
                    />
                    {validationMessages.commercialNumberError && <p style={{ color: 'red' }}>{validationMessages.commercialNumberError}</p>}
                </div>
                <div>
                    <label>Company Name</label>
                    <input
                        type="text"
                        name="CompanyName"
                        value={Employer.CompanyName}
                        onChange={handleChange}
                        disabled={!editMode}
                        required
                    />
                </div>
                <div>
                    <label>Company Email</label>
                    <input
                        type="text"
                        name="CompanyEmail"
                        value={Employer.CompanyEmail}
                        onChange={handleChange}
                        disabled={!editMode}
                        required
                    />
                    {validationMessages.emailError && <p style={{ color: 'red' }}>{validationMessages.emailError}</p>}
                </div>
                {editMode && (
    <>
        <div>
            <label>Current Password</label>
            <input
                type={showPassword ? "text" : "password"}
                name="currentPassword"
                value={Employer.currentPassword}
                onChange={handleChange}
                required={Employer.newPassword ? true : false} // Only required if newPassword is entered
                            />
                            <button type="button" onClick={handleVerifyCurrentPassword}>
                                Verify
                            </button>
                            <span onClick={togglePasswordVisibility} className="password-toggle-icon">
        <i className={showPassword ? 'far fa-eye' : 'far fa-eye-slash'}></i>
    </span>

    {validationMessages.currentPasswordEmpty && (
        <p style={{ color: '#FFA500', display: 'flex', alignItems: 'center' }}>
            <i className="fas fa-exclamation-circle" style={{ marginRight: '5px', color: '#FFA500' }}></i>
            {validationMessages.currentPasswordEmpty}
        </p>
    )}

    {validationMessages.currentPasswordError && (
        <p style={{ color: 'red', display: 'flex', alignItems: 'center' }}>
            <i className="fas fa-times-circle" style={{ marginRight: '5px', color: 'red' }}></i>
            {validationMessages.currentPasswordError}
        </p>
    )}

    {currentPassValid && (
        <p style={{ color: 'green', display: 'flex', alignItems: 'center' }}>
            <i className="fas fa-check-circle" style={{ marginRight: '5px', color: 'green' }}></i>
            {validationMessages.currentPasswordsuccess}
            Current password verified successfully.
        </p>
    )}
</div>
        <div>
            <label>New Password</label>
            <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                value={Employer.newPassword}
                onChange={handleChange}
                disabled={!currentPassValid} // Disable until current password is valid
               
            />
            <span onClick={togglePasswordVisibility} className="password-toggle-icon">
                <i className={showPassword ? 'far fa-eye' : 'far fa-eye-slash'}></i>
            </span>
            <div className="password-requirements">
    <ul>
        <li style={{ color: passwordRequirements.length ? '#059855' : 'red' }}>
            At least 8 characters
        </li>
        <li style={{ color: passwordRequirements.uppercase ? '#059855' : 'red' }}>
            At least one uppercase letter
        </li>
        <li style={{ color: passwordRequirements.lowercase ? '#059855' : 'red' }}>
            At least one lowercase letter
        </li>
        <li style={{ color: passwordRequirements.number ? '#059855' : 'red' }}>
            At least one number
        </li>
        <li style={{ color: passwordRequirements.special ? '#059855' : 'red' }}>
            At least one special character
        </li>
    </ul>
    </div>
        </div>
        <div>
            <label>Confirm New Password</label>
            <input
                type={showPassword ? "text" : "password"}
                name="confirmNewPassword"
                value={Employer.confirmNewPassword}
                onChange={handleChange}
                disabled={!currentPassValid}
               
                
            />
             <span onClick={togglePasswordVisibility} className="password-toggle-icon">
                <i className={showPassword ? 'far fa-eye' : 'far fa-eye-slash'}></i>
            </span>
            {validationMessages.confirmNewPasswordError && (
                <p style={{ color: 'red' }}>{validationMessages.confirmNewPasswordError}</p>
            )}
        </div>
    </>
)}

                {editMode ? (
                    <div>
                        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                        <button type="button" onClick={handleCancel}>Cancel</button>
                    </div>
                ) : (
                    <button type="button" onClick={() => setEditMode(true)}>Edit</button>
                )}
            </form>

            {popupMessage && (
                <div className="popup">
                    <p>{popupMessage}</p>
                </div>
            )}
        </div>
    );
};

export default Profile;