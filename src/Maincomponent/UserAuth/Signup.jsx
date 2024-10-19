import React, { useState } from 'react';
import { db, auth } from '../../firebase'; 
import { useNavigate } from 'react-router-dom'; 
import { doc, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth'; 
import successImage from '../../images/Sucess.png'; 
import errorImage from '../../images/Error.png'; 
import backgroundImage from '../../images/sairbackground.png'; 
import '../../App.css'; 
import { getDocs, query, collection, where } from 'firebase/firestore';
import '@fortawesome/fontawesome-free/css/all.min.css';

const SignUp = () => {
    const [user, setUser] = useState({
        Fname: '',
        Lname: '',
        commercialNumber: '',
        EmployeerEmail:'',
        PhoneNumber: '',
        CompanyName: '',
        CompanyEmail: '',
        Password: '',
        confirmPassword: '',
        confirmPasswordError: '',
    });
    const [validationMessages, setValidationMessages] = useState({
        phoneError: '',
        commercialNumberError: '',
        emailError: '',
        passwordError: '',
        emailperError:'',
        
    });
    const [loading, setLoading] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [popupImage, setPopupImage] = useState('');
    const [showConfirmNewPassword, setshowConfirmNewPassword] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('+966');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
 // Validation for the confirmation password
 if (name === 'confirmPassword') {
    const confirmPasswordError = value !== user.Password ? 'Passwords do not match.' : '';
    setValidationMessages((prev) => ({
        ...prev,
        confirmPasswordError: confirmPasswordError,
    }));
}
        if (name === 'commercialNumber') {
            const commercialNumberError = validateCommercialNumber(value);
            setValidationMessages((prev) => ({
                ...prev,
                commercialNumberError: value === '' ? '' : commercialNumberError,
            }));
        } else if (name === 'CompanyEmail') {
            const emailError = validateEmail(value);
            setValidationMessages((prev) => ({
                ...prev,
                emailError: value === '' ? '' : emailError,
            }));
        }else if (name === 'EmployeerEmail') {
            const emailperError = validateEmail(value);
            setValidationMessages((prev) => ({
                ...prev,
                emailperError: value === '' ? '' : emailperError,
            }));
        }
          if (name === 'Password') {
            // Check password requirements
            setPasswordRequirements({
                length: value.length >= 8,
                uppercase: /[A-Z]/.test(value),
                lowercase: /[a-z]/.test(value),
                number: /\d/.test(value),
                special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
            });
        }else if (value.trim() === '') {
            setValidationMessages((prev) => ({ ...prev, [`${name}Error`]: '' }));
        }
    };

    const togglePasswordVisibility = (type) => {
        if (type === 'new') {
            setShowPassword(!showPassword);
        }  else if (type === 'confirm') {
            setshowConfirmNewPassword(!showConfirmNewPassword);
        }
    };

    const handlePhoneNumberChange = (e) => {


        let newPhoneNumber = e.target.value;
      
        //user.PhoneNumber='+966'+ e.target.value;
       
       // setPhoneNumber({phoneNumber:'+966'+ e.target.value});
      // user.PhoneNumber.value='+966'+ e.target.value;

        // Allow only digits after the prefix
        if (newPhoneNumber.startsWith('+966')) {
           setUser({ ...user, PhoneNumber: newPhoneNumber }); // Store only the digits

        }
        else{
            newPhoneNumber = '+966' + newPhoneNumber.slice(3);
           

            setUser({ ...user, PhoneNumber: newPhoneNumber }); // Store only the digits 
        }
       
       
console.log(newPhoneNumber);
         // Only validate if there is more than just the prefix ('+966')
         const phoneError = newPhoneNumber !== '+966' ? validatePhoneNumber(newPhoneNumber) : '';

        setValidationMessages((prev) => ({
            ...prev,
            phoneError: phoneError 
        }));
  //      setUser({ ...user, PhoneNumber: newPhoneNumber.replace('+966', '') }); // Store only the digits


    };

    const handleFocus = (e) => {
        e.target.setSelectionRange(user.PhoneNumber.length, user.PhoneNumber.length);
    };


    const handleClick = (e) => {
        // If the user clicks inside the input, ensure the cursor stays after the prefix
        if (e.target.selectionStart < 4) {
            e.target.setSelectionRange(user.PhoneNumber.length, user.PhoneNumber.length);
        }
    };

    const validatePhoneNumber = (phoneNumber) => {
        const phoneRegex = /^\+9665\d{8}$/; // Example for a specific format
        return phoneRegex.test(phoneNumber) ? '' : 'Phone number must start with +9665 and be followed by 8 digits.';
    };

    const validateCommercialNumber = (number) => {
        const numberRegex = /^\d{10}$/; // Exactly 10 digits
        return numberRegex.test(number) ? '' : 'Commercial number must be exactly 10 digits long.';
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format
        return emailRegex.test(email) ? '' : 'Please enter a valid email address.';
    };

   
    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setValidationMessages((prev) => ({ ...prev, confirmPasswordError: '' }));

        // Check if passwords match
        if (user.Password !== user.confirmPassword) {
            setValidationMessages((prev) => ({
                ...prev,
                confirmPasswordError: 'Passwords do not match.',
            }));
            setLoading(false);
            return;
        }


        try {
            // Check if the commercialNumber already exists
            const existingUserQuery = await getDocs(query(collection(db, 'Employer'), where('commercialNumber', '==', user.commercialNumber)));

            if (!existingUserQuery.empty) {
                setPopupMessage("The commercial number is already used. Please use a correct number.");
                setPopupImage(errorImage);
                setPopupVisible(true);
                setLoading(false);
                return; // Prevent sign-up if commercial number exists
            }

            // Create user with Firebase Authentication using email
            const userCredential = await createUserWithEmailAndPassword(auth,`${user.commercialNumber}@sair.com`, user.Password);
            const newUser = userCredential.user;

            // Add user data to Firestore
            await addDoc(collection(db, 'Employer'), {
                Fname: user.Fname,
                Lname: user.Lname,
                commercialNumber: user.commercialNumber,
                PhoneNumber: user.PhoneNumber,
                CompanyName: user.CompanyName,
                EmployeerEmail:user.EmployeerEmail,
                CompanyEmail: user.CompanyEmail,
                uid: newUser.uid,
            });

            // Handle success
            setPopupMessage("You have successfully signed up! Welcome aboard.");
            setPopupImage(successImage);
            setPopupVisible(true);
            setTimeout(() => {
                setPopupVisible(false);
                navigate('/');
            }, 3000);
        } catch (error) {
            console.error('Error signing up:', error);
            setPopupMessage('Signup failed. Please try again.');
            setPopupImage(errorImage);
            setPopupVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleClosePopup = () => {
        setPopupVisible(false);
    };

    
    const getBorderColor = (field) => {
        if (field === 'Password') {
            return validationMessages.passwordError ? 'red' : !validationMessages.passwordError && user.Password ? 'green' : '';
        } else if (field === 'PhoneNumber') {
            return validationMessages.phoneError ? 'red' : !validationMessages.phoneError && user.PhoneNumber ? 'green' : '';
        } else if (field === 'confirmPassword') {
            return validationMessages.confirmPasswordError ? 'red' : user.confirmPassword ? 'green' : '';
        }  else if (field === 'CompanyEmail') {
            return validationMessages.emailError ? 'red' : !validationMessages.emailError && user.CompanyEmail ? 'green' : '';
        } else if (field === 'EmployeerEmail') {
            return validationMessages.emailperError ? 'red' : !validationMessages.emailperError && user.EmployeerEmail ? 'green' : '';
        } else if (field === 'commercialNumber') {
            return validationMessages.commercialNumberError ? 'red' : !validationMessages.commercialNumberError && user.commercialNumber ? 'green' : '';
        } else {
            return validationMessages[`${field}Error`] ? 'red' : !validationMessages[`${field}Error`] && user[field] ? 'green' : '';
        }
    };
 
    

    return (

        <div 
            className="login-container"  
        >
            <div >
  <img src={backgroundImage} alt="Top Right Image" className="top-right-image" />
 
</div>
            <div >
                <h1 style={{marginTop:'40px'}}>Welcome to SAIR! </h1> <p style={{fontSize:'30px' , color: '#059855', marginTop:'6px', marginLeft:'47px'}}>Your easy solution for managing <br/>delivery drivers.</p>
                

                
                <form 
  className='form-container' 
  style={{ marginLeft: '100px', paddingBottom: '20px' }} 
  onSubmit={handleSignUp}
>                        <div className="profile-field">
                        <label>First Name</label><br></br>
                        <input
                            type="text"
                            name="Fname"
                            value={user.Fname}
                            onChange={handleChange}
                            required
                            style={{ borderColor: getBorderColor('Fname') }}
                        />
                    </div>
                    <div className="profile-field">
                        <label>Last Name</label><br></br>
                        <input
                            type="text"
                            name="Lname"
                            value={user.Lname}
                            onChange={handleChange}
                           
                            required
                            style={{ borderColor: getBorderColor('Lname') }}
                        />
                    </div>
                    <div className="profile-field">
                        <label>Email</label><br></br>
                        <input
                            type="email"
                            name="EmployeerEmail"
                            value={user.EmployeerEmail}
                            onChange={handleChange}
                         required
                            style={{ borderColor: getBorderColor('EmployeerEmail') }}
                        />
                    {validationMessages.emailperError && <p style={{ color: 'red' }}>{validationMessages.emailperError}</p>}

                    </div>
                    <div className="profile-field">
                        <label>Phone Number</label><br />
                        <input
                            type="tel"
                            name="PhoneNumber"
                           placeholder='+966'
                            value={`${user.PhoneNumber}`}
                            onChange={handlePhoneNumberChange}
                            onFocus={handleFocus}
                            required
                            style={{ borderColor: getBorderColor('PhoneNumber') }}
                        />
                        {validationMessages.phoneError && <p style={{ color: 'red' }}>{validationMessages.phoneError}</p>}
                    </div>


                    <div className="profile-field">
                        <label>Commercial Number</label><br/>
                        <input
                            type="text"
                            name="commercialNumber"
                            value={user.commercialNumber}
                            onChange={handleChange}
                           
                            required
                            style={{ borderColor: getBorderColor('commercialNumber') }}
                        />
                        {validationMessages.commercialNumberError && <p style={{ color: 'red' }}>{validationMessages.commercialNumberError}</p>}
                    </div>

                    <div className="profile-field">
                        <label>Company Name</label><br/>
                        <input
                            type="text"
                            name="CompanyName"
                            value={user.CompanyName}
                            onChange={handleChange}
                         
                            required
                            style={{ borderColor: getBorderColor('CompanyName') }}
                        />
                    </div>
                    <div className="profile-field">
                        <label>Company Email</label><br></br>
                        <input
                            type="email"
                            name="CompanyEmail"
                            value={user.CompanyEmail}
                            onChange={handleChange}
                         required
                            style={{ borderColor: getBorderColor('CompanyEmail') }}
                        />
                    {validationMessages.emailError && <p style={{ color: 'red' }}>{validationMessages.emailError}</p>}

                    </div>
                    <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <label>Password</label><br/>
                        <input
                             type={showPassword ? "text" : "password"}
                            name="Password"
                            value={user.Password}
                            onChange={handleChange}
                            required
                            style={{ borderColor: getBorderColor('Password') ,paddingRight: '30px'}}
                        />
                    
                    <span 
    onClick={() => togglePasswordVisibility('new')}
    className="password-toggle-iconsignup" 
    style={{
        position: 'absolute',
        top: '63px',
        left: '309px',
        transform: 'translateY(-50%)',
        cursor: 'pointer',
        fontSize: '18px',
        color: 'gray'
    }}
>
    <i className={showPassword ? 'far fa-eye' : 'far fa-eye-slash'}></i>
</span></div>
                               <div className="password-requirements">
    <ul style={{marginLeft: '45px'}}>
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
</div><br></br>
                    <div style={{ position: 'relative' }} className="profile-field">
                        <label >Confirm Password</label><br />
                        <input
                            type={showConfirmNewPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={user.confirmPassword}
                            onChange={handleChange}
                            required
                            style={{ borderColor: getBorderColor('confirmPassword') }}
                        />
                           <span 
   onClick={() => togglePasswordVisibility('confirm')}
    className="password-toggle-iconsignup2" 
    style={{
        position: 'absolute',
        top: '64px',
        left: '309px',
        transform: 'translateY(-50%)',
        cursor: 'pointer',
        fontSize: '18px',
        color: 'gray'
    }}
>
    <i className={showConfirmNewPassword ? 'far fa-eye' : 'far fa-eye-slash'}></i>
</span>
                        {validationMessages.confirmPasswordError && <p style={{ color: 'red' }}>{validationMessages.confirmPasswordError}</p>}
                    </div>
                    <div style={{ marginTop: '20px', textAlign: 'center', position:'relative' }}>
                    <a 
      id='signup2' 
      onClick={() => navigate('/')} 
      style={{ cursor: 'pointer', color: '#059855', textDecoration: 'underline', marginTop: '10px' }}
    >
      Already have a company account? Log in here
    </a> <br />

    <button id='signsubmit1' type="submit" style={{ marginBottom: '15px' }}>
      Sign up
    </button>
   
  
  </div>
                </form>

                {popupVisible && (
                    <div className="popup">
                        <button className="close-btn" onClick={handleClosePopup}>×</button>
                        <img src={popupImage} alt="Popup" />
                        <p>{popupMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignUp;