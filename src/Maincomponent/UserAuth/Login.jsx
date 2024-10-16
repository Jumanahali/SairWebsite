import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { db } from '../../firebase'; 
import { collection, query, where, getDocs } from 'firebase/firestore'; 
import '../../App.css'; 
import successImage from '../../images/Sucess.png'; 
import errorImage from '../../images/Error.png'; 
import backgroundImage from '../../images/Background.png'; 

const Login = () => {
    const navigate = useNavigate(); 
    const [role, setRole] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [commercialRegNumber, setCommercialRegNumber] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({
        phoneStartError: '',
        phoneLengthError: '',
        commercialError: '',
    });
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [popupImage, setPopupImage] = useState('');

    useEffect(() => {
        validatePhoneNumber(phoneNumber);
    }, [phoneNumber]);

    useEffect(() => {
        if (role === 'employee') {
            validateCommercialNumber(commercialRegNumber);
        } else {
            setErrors((prev) => ({ ...prev, commercialError: '' }));
        }
    }, [commercialRegNumber, role]);

    const handleRoleChange = (event) => {
        const selectedRole = event.target.value;
        setRole(selectedRole);
        setPhoneNumber('');
        setCommercialRegNumber('');
        setPassword('');
        setErrors({ phoneStartError: '', phoneLengthError: '', commercialError: '' });
    };

    const validatePhoneNumber = (phoneValue) => {
        let phoneStartError = '';
        let phoneLengthError = '';

        if (!phoneValue.startsWith('+9665') && phoneValue.length > 0) {
            phoneStartError = 'Phone number must start with +9665.';
        }
        
        if (phoneValue.length !== 13 && phoneValue.length > 0) {
            phoneLengthError = 'Phone number must be exactly 13 digits.';
        }

        setErrors((prev) => ({
            ...prev,
            phoneStartError,
            phoneLengthError,
        }));
    };

    const validateCommercialNumber = (commercialValue) => {
        const numberRegex = /^\d{10}$/; // Only digits and exactly 10 digits long
        if (commercialValue.trim() === '') {
            setErrors((prev) => ({ ...prev, commercialError: '' })); // Clear error if input is empty
        } else {
            const commercialError = numberRegex.test(commercialValue) ? '' : 'Commercial registration number must be exactly 10 digits long.';
            setErrors((prev) => ({
                ...prev,
                commercialError,
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        if (!errors.phoneStartError && !errors.phoneLengthError && !errors.commercialError) {
            try {
                let userFound = false;

                if (role === 'gdtAdmin' || role === 'gdtStaff') {
                    const q = query(collection(db, 'GDT'), where('PhoneNumber', '==', phoneNumber));
                    const querySnapshot = await getDocs(q);
                    
                    if (!querySnapshot.empty) {
                        const docSnap = querySnapshot.docs[0];
                        const data = docSnap.data();

                        if (data.Password === password) {
                            userFound = true;
                            setPopupMessage("Login successful!");
                            setPopupImage(successImage);
                            setPopupVisible(true);
                            setTimeout(() => {
                                navigate(role === 'gdtAdmin' ? '/Adminhomepage' : '/Staffhomepage');
                            }, 1500);
                        } else {
                            setPopupMessage('Incorrect password for Admin/Staff.');
                            setPopupImage(errorImage);
                            setPopupVisible(true);
                        }
                    } else {
                        setPopupMessage('Admin/Staff user not found.');
                        setPopupImage(errorImage);
                        setPopupVisible(true);
                    }
                }

                if (role === 'employee') {
                    const q = query(collection(db, 'Employer'), where('commercialNumber', '==', commercialRegNumber));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const docSnap = querySnapshot.docs[0];
                        const data = docSnap.data();

                        if (data.Password === password) {
                            userFound = true;
                            const employerUID = docSnap.id;
                            sessionStorage.setItem('employerUID', employerUID); 
                            setPopupMessage("Login successful!");
                            setPopupImage(successImage);
                            setPopupVisible(true);
                            setTimeout(() => {
                                navigate('/employer-home');
                            }, 1500);
                        } else {
                            setPopupMessage('Incorrect password for Employee.');
                            setPopupImage(errorImage);
                            setPopupVisible(true);
                        }
                    } else {
                        setPopupMessage('Employee not found.');
                        setPopupImage(errorImage);
                        setPopupVisible(true);
                    }
                }

                if (!userFound) {
                    setPopupMessage("Incorrect credentials.");
                    setPopupImage(errorImage);
                    setPopupVisible(true);
                }
            } catch (error) {
                console.error("Error fetching user: ", error);
            }
        } else {
            console.log("Validation failed");
        }
    };

    const handleClosePopup = () => {
        setPopupVisible(false);
    };

    return (
        <div 
            className="login-container" 
            style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
            <h1>Welcome to SAIR!</h1>
            <p>Please Select a Role</p>
            <select id="roleSelect" onChange={handleRoleChange}>
                <option value="">-- Select a Role --</option>
                <option value="gdtAdmin">GDT Admin</option>
                <option value="gdtStaff">GDT Staff</option>
                <option value="employee">Employee</option>
            </select>
            <br /><br />

            <div className="form-container" style={{ display: role ? 'block' : 'none' }}>
                <form id="dynamicForm" onSubmit={handleSubmit}>
                    {role === 'gdtAdmin' || role === 'gdtStaff' ? (
                        <div>
                            <p className='fill'>Please fill in the following information to log in to your account.</p>
                            <br />
                            <label htmlFor="phoneNumber">Phone Number:</label><br />
                            <input 
                                type="text" 
                                id="phoneNumber" 
                                value={phoneNumber} 
                                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ''))} 
                            /><br />
                            <span className={`error-message ${errors.phoneStartError ? 'visible' : ''}`}>{errors.phoneStartError}</span><br />
                            <span className={`error-message ${errors.phoneLengthError ? 'visible' : ''}`}>{errors.phoneLengthError}</span><br />
                            <label htmlFor="password">Password:</label><br />
                            <input 
                                type={showPassword ? "text" : "password"}
                                id="password" 
                                name="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            /><br />
                        </div>
                    ) : role === 'employee' ? (
                        <div>
                            <div>
                            <p className='fill'>Please fill in the following information to log in to your account.</p>
                            <br />
                            <label htmlFor="commercialRegNumber">Commercial Registration Number:</label><br />
                            <input 
                                type="text" 
                                id="commercialRegNumber" 
                                value={commercialRegNumber} 
                                onChange={(e) => setCommercialRegNumber(e.target.value.replace(/[^0-9]/g, ''))} 
                            /><br />
                            {/* {commercialNumberError && <p style={{ color: 'red' }}>{commercialNumberError}</p>} */}
                            {errors.commercialError && (
                          <p style={{ color: 'red' }}>
                                    {errors.commercialError}
                                   </p>
                                       )}  <br/>    
                              </div>
                              <div>                         
                            <label htmlFor="password">Password:</label><br />
                            <input 
                                type={showPassword ? "text" : "password"}
                                id="password" 
                                name="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            /><br />
                            </div>  
                        </div>
                    ) : null}
                    <div className="link-container">
                        <a id='forget' href="Forgetpassword.jsx">Forget Password?</a> 
                        <br />
                        {role === 'employee' && (
                            <a 
                                id='signup' 
                                onClick={() => navigate('/Signup')} 
                                style={{ cursor: 'pointer' }}
                            >
                                Don't have a company account? Sign up here
                            </a>
                        )}
                    </div>
                    <button id='signsubmit2' type="submit">Login</button>
                </form>
            </div>

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

export default Login;