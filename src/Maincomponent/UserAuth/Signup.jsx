import React, { useState } from 'react';
import { db, auth } from '../../firebase'; 
import { useNavigate } from 'react-router-dom'; 
import { doc, addDoc } from 'firebase/firestore';
import successImage from '../../images/Sucess.png'; 
import errorImage from '../../images/Error.png'; 
import backgroundImage from '../../images/Background.png'; 
import '../../App.css'; 

import { getDocs, query, collection, where } from 'firebase/firestore';


const SignUp = () => {
    const [user, setUser] = useState({
        Fname: '',
        Lname: '',
        commercialNumber: '',
        Email: '',
        PhoneNumber: '',
        CompanyName: '',
        CompanyEmail: '',
        Password: '',
    });
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [companyEmailError, setCompanyEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmationError, setConfirmationError] = useState('');
    const [commercialNumberError, setCommercialNumberError] = useState('');
    const [loading, setLoading] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [popupImage, setPopupImage] = useState('');
    const[notificationMessage,setNotificationMessage]=useState('');
    const [isNotificationVisible, setIsNotificationVisible] = useState(false);
    

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });

        // Validate fields on change
        if (name === 'Email') {
            setEmailError(validateEmail(value));
        } else if (name === 'CompanyEmail') {
            setCompanyEmailError(validateEmail(value));
        } else if (name === 'PhoneNumber') {
            setPhoneError(validatePhoneNumber(value));
        } else if (name === 'Password') {
            setPasswordError(validatePassword(value));
        } else if (name === 'commercialNumber') {
            setCommercialNumberError(validateCommercialNumber(value));
        }
    };

    // Confirm password change
    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        setConfirmationError('');
    };

    // Handle sign-up
    const handleSignUp = async (e) => {
        e.preventDefault();
        if (user.Password !== confirmPassword) {
            setConfirmationError('Passwords do not match!');
            return;
        }

        // Check for other validation errors
        if (emailError || companyEmailError || phoneError || passwordError || commercialNumberError) {
            return; // Prevent sign-up if there are validation errors
        }

        setLoading(true);

        try {
            // Check if the commercialNumber already exists
            const existingUserQuery = await getDocs(query(collection(db, 'Employer'), where('commercialNumber', '==', user.commercialNumber)));
    
            
        if (!existingUserQuery.empty) {
            setPopupMessage("The commercial number is already in use. Please use a different number.");
            setPopupImage(errorImage);
            setPopupVisible(true);
            setLoading(false); // Stop loading
            return; // Prevent sign-up if commercial number exists
        }
    
        //     const userCredential = await createUserWithEmailAndPassword(auth, user.Email, user.Password);
        // const newuser = userCredential.user;

        // Add a new document with an auto-generated ID
        const userRef = collection(db, 'Employer');
        await addDoc(userRef, {
            Fname: user.Fname,
            Lname: user.Lname,
            commercialNumber: user.commercialNumber,
            Email: user.Email,
            PhoneNumber: user.PhoneNumber,
            CompanyName: user.CompanyName,
            CompanyEmail: user.CompanyEmail,
            Password:user.Password,
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
        setError('Failed to sign up. Please try again.');
        setPopupMessage('Signup failed. Please try again.');
        setPopupImage(errorImage);
        setPopupVisible(true);
        } finally {
            setLoading(false);
            // Clear error messages
            setError('');
            setEmailError('');
            setCompanyEmailError('');
            setPhoneError('');
            setPasswordError('');
            setConfirmationError('');
            setCommercialNumberError('');
        }
    };


    // Validation functions
    const validateEmail = (email) => {
        if (email.trim() === '') {
            return '';
        }
        const emailRegex = /\S+@\S+\.\S+/;
        return emailRegex.test(email) ? '' : 'Invalid email address.';
    };

    const validatePhoneNumber = (phoneNumber) => {
        if (phoneNumber.trim() === '') {
            return '';
        }
        const phoneRegex =  /^\+966\d{9}$/; // Allows optional + followed by exactly 10 digits
        return phoneRegex.test(phoneNumber) ? '' : 'Phone number must start with +966 and be followed by 9 digits.';
    };

    const validatePassword = (Password) => {
        if (Password.trim() === '') {
            return '';
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=]).{8,}$/;
        return passwordRegex.test(Password) ? '' : 'Password must contain 8+ characters, including uppercase, \n lowercase, number, and special character.';
    };

    const validateCommercialNumber = (number) => {
        if (number.trim() === '') {
            return '';
        }
        const numberRegex = /^\d{10}$/; // Only digits and exactly 10 digits long
        return numberRegex.test(number) ? '' : 'Commercial number must be exactly 10 digits long.';
    };
    const handleClosePopup = () => {
        setPopupVisible(false);
    };

    return (
        <div className="login-container" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="signup-container">
                <h1>Welcome to SAIR! <br /> Your easy solution for managing delivery drivers.</h1><br></br>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form onSubmit={handleSignUp}>
                    <div className="profile-field">
                        <label>First Name</label><br />
                        <input
                            type="text"
                            name="Fname"
                            value={user.Fname}
                            onChange={handleChange}
                            required
                        /><br/>
                    </div>

                    <div className="profile-field">
                        <label>Last Name</label><br />
                        <input
                            type="text"
                            name="Lname"
                            value={user.Lname}
                            onChange={handleChange}
                            required
                        /><br/>
                    </div>

                    <div className="profile-field">
                        <label>Commercial Number</label><br />
                        <input
                            type="text"
                            name="commercialNumber"
                            value={user.commercialNumber}
                            onChange={handleChange}
                            required
                            pattern="\d{10}" // Restricts input to exactly 10 digits
                            title="Commercial number must be exactly 10 digits long."
                        />
                        {commercialNumberError && <p style={{ color: 'red' }}>{commercialNumberError}</p>}<br/>
                    </div>

                    <div className="profile-field">
                        <label>Email</label><br />
                        <input
                            type="email"
                            name="Email"
                            value={user.Email}
                            onChange={handleChange}
                            required
                        />
                        {emailError && <p style={{ color: 'red' }}>{emailError}</p>}<br/>
                    </div>

                    <div className="profile-field">
                        <label>Phone Number</label><br />
                        <input
                            type="tel"
                            name="PhoneNumber"
                            value={user.PhoneNumber}
                            onChange={handleChange}
                            required
                            pattern="\+966\d{9}"
                            title="Phone number must start with + followed by exactly 10 digits."
                        />
                        {phoneError && <p style={{ color: 'red' }}>{phoneError}</p>}<br/>
                    </div>

                    <div className="profile-field">
                        <label>Company Name</label><br />
                        <input
                            type="text"
                            name="CompanyName"
                            value={user.CompanyName}
                            onChange={handleChange}
                            required
                        /><br/>
                    </div>

                    <div className="profile-field">
                        <label>Company Email</label><br />
                        <input
                            type="email"
                            name="CompanyEmail"
                            value={user.CompanyEmail}
                            onChange={handleChange}
                            required
                        />
                        {companyEmailError && <p style={{ color: 'red' }}>{companyEmailError}</p>}<br/>
                    </div>

                    <div className="profile-field">
                        <label>Password</label><br />
                        <input
                            type="password"
                            name="Password"
                            value={user.Password}
                            onChange={handleChange}
                            required
                        />
                        {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}<br/>
                    </div>

                    <div className="profile-field">
                        <label>Confirm Password</label><br />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            required
                        />
                        {confirmationError && <p style={{ color: 'red' }}>{confirmationError}</p>}<br/>
                    </div>

                    <a id='login'
                     onClick={() => navigate('/')}
                     style={{ cursor: 'pointer' }}
                     >Already have an account? Log in here</a>

                    <button id='signsubmit1' type="submit" disabled={loading}>{loading ? 'Sign Up' : 'Sign Up'}</button>
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