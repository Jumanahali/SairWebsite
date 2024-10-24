import React, { useEffect, useState } from 'react';
import { db , auth} from '../firebase'; 
import { useNavigate } from 'react-router-dom'; 
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import successImage from '../images/Sucess.png'; 
import errorImage from '../images/Error.png'; 
import '@fortawesome/fontawesome-free/css/all.min.css';
import SAIRLogo from '../images/SAIRlogo.png'; 
import logoutIcon from '../images/logout.png'; 
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
        confirmNewPasswordError:'',
        currentPasswordsuccess:'',
    });

    const [loading, setLoading] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
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
        setValidationMessages((prev) => ({
            ...prev,
            currentPasswordError: '',
            currentPasswordEmpty: '',
            currentPasswordsuccess:'',
            confirmNewPasswordError: '',
        }));
        

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
            default:
                break;
        }
        
      
    };



    const handlePhoneNumberChange = (e) => {
      console.log(e.target.value);


        let newPhoneNumber = e.target.value;
      
        //user.PhoneNumber='+966'+ e.target.value;
       
       // setPhoneNumber({phoneNumber:'+966'+ e.target.value});
      // user.PhoneNumber.value='+966'+ e.target.value;

        // Allow only digits after the prefix
        if (newPhoneNumber.startsWith('+966')) {
                                                    
         setEmployer({ ...Employer, PhoneNumber: newPhoneNumber }); // Store only the digits

        }
        else{
            newPhoneNumber = '+966' + newPhoneNumber.slice(3);
           

            setEmployer({ ...Employer, PhoneNumber: newPhoneNumber }); // Store only the digits
        }
       
       
console.log(newPhoneNumber);
         // Only validate if there is more than just the prefix ('+966')
        // const phoneError = newPhoneNumber !== '+966' ? validatePhoneNumber(newPhoneNumber) : '';
         var phoneError='';
         if(validatePhoneNumber(newPhoneNumber) === ''){
          phoneError = '';
         }
         else if(validatePhoneNumber(newPhoneNumber) === '0'){
          phoneError = '';
          var str = newPhoneNumber+"";
          str = str.substring(str.indexOf('5'));
          var st = '+966'+str;
          setEmployer({ ...Employer, PhoneNumber: st });

         }
         else{
          phoneError=validatePhoneNumber(newPhoneNumber);
         }

        // setValidationMessages((prev) => ({
        //     ...prev,
        //     phoneError: phoneError 
        // }));//removed when empty
        setValidationMessages((prev) => ({ ...prev, phoneError: phoneError }));

  //      setUser({ ...user, PhoneNumber: newPhoneNumber.replace('+966', '') }); // Store only the digits


    };

    const handleFocus = (e) => {
        e.target.setSelectionRange(Employer.PhoneNumber.length, Employer.PhoneNumber.length);
    };


    const validatePhoneNumber = (phoneNumber) => {
        const phoneRegex = /^\+9665\d{8}$/; // Example for a specific format
        const phoneRegex1 = /^\+96605\d{8}$/; // Example for a specific format
        if(phoneRegex.test(phoneNumber)){

          return '';

        }
        else if(phoneRegex1.test(phoneNumber)){

          return '0';

        }
        else{

          return'Phone number must start with +9665 and be followed by 8 digits.';

        }

    };

    const validateCommercialNumber = (number) => {
        const numberRegex = /^\d{10}$/;
        return numberRegex.test(number) ? '' : 'Commercial number must be exactly 10 digits long.';
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) ? '' : 'Please enter a valid email address.';
    };
//Hi
    const handleVerifyCurrentPassword2 = async (e) => {

      console.log(e.target.value);
      Employer.currentPassword=e.target.value;
        if (!e.target.value) {
            setValidationMessages((prev) => ({
                ...prev,
                currentPasswordEmpty: 'Please enter your current password to verify.',
                currentPasswordError: '',
                currentPasswordsuccess:'',
            }));
            return;
        }
        else if(e.target.value.length >= 10){
            console.log(e.target.value.length);


        
       
    
        const auth = getAuth();
        const user = auth.currentUser;
    
        try {
            const credential = EmailAuthProvider.credential(
                user.email,
                e.target.value
            );
    
            await reauthenticateWithCredential(user, credential);
            setCurrentPassValid(true);
            setValidationMessages((prev) => ({
                ...prev,
                currentPasswordError: '',
                currentPasswordEmpty: '',
                currentPasswordsuccess:'Current password verified successfully',
            }));
        } catch (error) {
            console.error("Error verifying current password:", error);
            setCurrentPassValid(false);
            setValidationMessages((prev) => ({
                ...prev,
                currentPasswordError: 'Incorrect current password. Please try again.',
                currentPasswordEmpty: '',
                currentPasswordsuccess:'',
            }));
        }
    }

    else{
        setValidationMessages((prev) => ({
            ...prev,
            currentPasswordError: 'Incorrect current password. Please try again.',
            currentPasswordEmpty: '',
            currentPasswordsuccess:'',
        }));
    }


    };
    const handleVerifyCurrentPassword = async () => {
        console.log(Employer.currentPassword);
        if (!Employer.currentPassword) {
            setValidationMessages((prev) => ({
                ...prev,
                currentPasswordEmpty: 'Please enter your current password to verify.',
                currentPasswordError: '',
                currentPasswordsuccess:'',
            }));
            return;
        }
        else if(Employer.currentPassword.length >= 10){
            console.log(Employer.currentPassword.length);


        
       
    
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
                currentPasswordsuccess:'Current password verified successfully',
            }));
        } catch (error) {
            console.error("Error verifying current password:", error);
            setCurrentPassValid(false);
            setValidationMessages((prev) => ({
                ...prev,
                currentPasswordError: 'Incorrect current password. Please try again.',
                currentPasswordEmpty: '',
                currentPasswordsuccess:'',
            }));
        }
    }

    else{
        setValidationMessages((prev) => ({
            ...prev,
            currentPasswordError: 'Incorrect current password. Please try again.',
            currentPasswordEmpty: '',
            currentPasswordsuccess:'',
        }));
    }
    };
    
    

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
      
       
        setValidationMessages((prev) => ({
            ...prev,
            currentPasswordError: '',
            currentPasswordEmpty: '',
            currentPasswordsuccess:'',
            confirmNewPasswordError: '',
        }));
        
         
         if (Employer.newPassword && Employer.newPassword !== Employer.confirmNewPassword) {
            setValidationMessages((prev) => ({
                ...prev,
                confirmNewPasswordError: 'New passwords do not match.',
            }));
            setLoading(false);
            return;
        }
      

        setValidationMessages((prev) => ({
            ...prev,
            currentPasswordError: '',
            currentPasswordEmpty: '',
            currentPasswordsuccess:'',
             confirmNewPasswordError: '',
        }));


        if (Object.values(validationMessages).some(msg => msg)) {
            setLoading(false);
            return;
        }
    
      
    
        const employerUID = sessionStorage.getItem('employerUID');
        const auth = getAuth();
        const user = auth.currentUser;
    
        try {
          console.log(Employer);
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

            
            setEmployer((prevState) => ({
                ...prevState,
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            }));
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
            confirmNewPasswordError:'',
            currentPasswordsuccess:'',

        
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
    

    const togglePasswordVisibility = (type) => {
        if (type === 'current') {
            setShowCurrentPassword(!showCurrentPassword);
        } else if (type === 'new') {
            setShowNewPassword(!showNewPassword);
        } else if (type === 'confirm') {
            setShowConfirmNewPassword(!showConfirmNewPassword);
        }
    };

    // Logout function to navigate back to the login page
  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/'); // Redirect to login page (Login.jsx)
    }).catch((error) => {
      console.error('Error LOGGING out:', error);
    });
  };

  // Handle redirection functions for each page
  const handleNavigation = (path) => {
    navigate(path); // Navigate to the specified path
  };

    return (
        <div className="Header"> 
      <header>
        <nav>
          <a onClick={() => handleNavigation('/Employeehomepage')}>
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
      <a onClick={() => navigate('/employee-profile')}>Profile</a>
    </div>
        <div className="profile-container">
   
            <h1>My Profile</h1>
            <form onSubmit={handleSave}>
  <div className="form-row">
    <div>
      <label className="profileLabel">First Name</label>
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
      <label className="profileLabel" >Last Name</label>
      <input
        type="text"
        name="Lname"
        value={Employer.Lname}
        onChange={handleChange}
        disabled={!editMode}
        required
      />
    </div>
  </div>

  <div className="form-row">
    <div>
      <label className="profileLabel">Email</label>
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
      <label className="profileLabel">Phone Number</label>
      <input
        type="tel"
        name="PhoneNumber"
        placeholder='+966'
        value={`${Employer.PhoneNumber}`}
        onChange={handlePhoneNumberChange}
       
        required
        disabled={!editMode}
      />
      {validationMessages.phoneError && <p style={{ color: 'red' }}>{validationMessages.phoneError}</p>}
    </div>
  </div>

  <div className="form-row">
    <div>
      <label className="profileLabel">Commercial Number</label>
      <input
        type="text"
        name="commercialNumber"
        value={Employer.commercialNumber}
        readOnly
      />
    </div>
    <div>
      <label className="profileLabel">Company Name</label>
      <input
        type="text"
        name="CompanyName"
        value={Employer.CompanyName}
        onChange={handleChange}
        disabled={!editMode}
        required
      />
    </div>
  </div>

  <div className="form-row">
    <div>
      <label className="profileLabel">Company Email</label>
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
  </div>

  {editMode && (
    <>
      <div className="form-row">
        <div style={{ position: 'relative' }}>
          <label className="profileLabel">Current Password</label>
          <input
            type={showCurrentPassword ? "text" : "password"}
            name="currentPassword"
            value={Employer.currentPassword}
            onChange={handleVerifyCurrentPassword2}
            required={Employer.newPassword ? true : false}
          />
          {/* <button type="button" className='profileVerify' onKeyUp={handleVerifyCurrentPassword}>
            Verify
          </button> */}
   
          <span onClick={() => togglePasswordVisibility('current')} className="password-toggle-iconprofile1">
            <i className={showCurrentPassword ? 'far fa-eye' : 'far fa-eye-slash'}></i>
          </span>
          

          {validationMessages.currentPasswordEmpty && (
            <p style={{ color: '#FFA500', display: 'flex', alignItems: 'center', fontSize: '14px' }}>
              <i className="fas fa-exclamation-circle" style={{ marginRight: '5px', color: '#FFA500' }}></i>
              {validationMessages.currentPasswordEmpty}
            </p>
          )}

          {validationMessages.currentPasswordError && (
            <p  style={{ color: 'red', display: 'flex', alignItems: 'center', fontSize: '14px' }}>
              <i className="fas fa-times-circle" style={{ marginRight: '5px', color: 'red' }}></i>
              {validationMessages.currentPasswordError}
            </p>
          )}

          {currentPassValid && validationMessages.currentPasswordsuccess && (
            <p style={{ color: 'green', display: 'flex', alignItems: 'center', fontSize: '14px' }}>
              <i className="fas fa-check-circle" style={{ marginRight: '5px', color: 'green' }}></i>
              {validationMessages.currentPasswordsuccess}
            </p>
          )}
        </div>

      </div>
      <div className="form-row">
      <div  style={{ position: 'relative' }}>
          <label className="profileLabel">New Password</label>
          <input
            type={showNewPassword ? "text" : "password"}
            name="newPassword"
            value={Employer.newPassword}
            onChange={handleChange}
            disabled={!currentPassValid}
            className='newPass'
          />
          <span onClick={() => togglePasswordVisibility('new')} className="password-toggle-iconprofile2">
            <i className={showNewPassword ? 'far fa-eye' : 'far fa-eye-slash'}></i>
          </span>
          <div className="password-requirements">
            <ul>
              <li style={{ color: passwordRequirements.length ? '#059855' : 'red' }}>At least 8 characters</li>
              <li style={{ color: passwordRequirements.uppercase ? '#059855' : 'red' }}>At least one uppercase letter</li>
              <li style={{ color: passwordRequirements.lowercase ? '#059855' : 'red' }}>At least one lowercase letter</li>
              <li style={{ color: passwordRequirements.number ? '#059855' : 'red' }}>At least one number</li>
              <li style={{ color: passwordRequirements.special ? '#059855' : 'red' }}>At least one special character</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="form-row">
        <div style={{ position: 'relative' }}>
          <label className="profileLabel">Confirm New Password</label>
          <input
            type={showConfirmNewPassword ? "text" : "password"}
            name="confirmNewPassword"
            value={Employer.confirmNewPassword}
            onChange={handleChange}
            disabled={!currentPassValid}
            className='confPass'
          />
          <span onClick={() => togglePasswordVisibility('confirm')} className="password-toggle-iconprofile3">
            <i className={showConfirmNewPassword ? 'far fa-eye' : 'far fa-eye-slash'}></i>
          </span>
          {validationMessages.confirmNewPasswordError && (
            <p style={{ color: 'red' }}>{validationMessages.confirmNewPasswordError}</p>
          )}
        </div>
      </div>
    </>
  )}

  <div>
    {editMode ? (
      <div>
        <button type="submit" className='profilesave' disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
        <button type="button" className='profileCancel' onClick={handleCancel}>Cancel</button>
      </div>
    ) : (
      <button type="button" className='editBtn' onClick={() => setEditMode(true)}>Edit</button>
    )}
  </div>
{/*
<div className="info">
    <div className="info__icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" height="24" fill="none"><path fill="#393a37" d="m12 1.5c-5.79844 0-10.5 4.70156-10.5 10.5 0 5.7984 4.70156 10.5 10.5 10.5 5.7984 0 10.5-4.7016 10.5-10.5 0-5.79844-4.7016-10.5-10.5-10.5zm.75 15.5625c0 .1031-.0844.1875-.1875.1875h-1.125c-.1031 0-.1875-.0844-.1875-.1875v-6.375c0-.1031.0844-.1875.1875-.1875h1.125c.1031 0 .1875.0844.1875.1875zm-.75-8.0625c-.2944-.00601-.5747-.12718-.7808-.3375-.206-.21032-.3215-.49305-.3215-.7875s.1155-.57718.3215-.7875c.2061-.21032.4864-.33149.7808-.3375.2944.00601.5747.12718.7808.3375.206.21032.3215.49305.3215.7875s-.1155.57718-.3215.7875c-.2061.21032-.4864.33149-.7808.3375z"></path></svg>
    </div>
    <div className="info__title">Profile updated successfully</div>
    <div className="info__close"><svg height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="m15.8333 5.34166-1.175-1.175-4.6583 4.65834-4.65833-4.65834-1.175 1.175 4.65833 4.65834-4.65833 4.6583 1.175 1.175 4.65833-4.6583 4.6583 4.6583 1.175-1.175-4.6583-4.6583z" fill="#393a37"></path></svg></div>
</div>*/
}
</form>



            {popupMessage && (
                <div className="popup">
                    <p>{popupMessage}</p>
                </div>
            )}
         </div></div>
          );
          };

export default Profile;