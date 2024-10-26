import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import '../../App.css';
import successImage from '../../images/Sucess.png';
import errorImage from '../../images/Error.png';
import backgroundImage from '../../images/sairbackground.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Form, Input } from 'antd';



const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState(''); 
  const [email, setEmail] = useState('');
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

  // useEffect(() => {
  //     if (role === 'employer') {
  //         validateCommercialNumber(email);
  //     } else {
  //         setErrors((prev) => ({ ...prev, commercialError: '' }));
  //     }
  // }, [email, role]);

  const handleRoleChange = (event) => {
    const selectedRole = event.target.value;
    setRole(selectedRole);
    setPhoneNumber('');
    setEmail('');
    setPassword('');
    setErrors({ phoneStartError: '', phoneLengthError: '', commercialError: '' });
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

  //const validateCommercialNumber = (commercialValue) => {
   // const numberRegex = /^\d{10}$/;
    //const commercialError = numberRegex.test(commercialValue) ? '' : 'Commercial registration number must be exactly 10 digits long.';
    //setErrors((prev) => ({
    //  ...prev,
      //commercialError,
   // }));
 // };

 const handleSubmit = async (event) => {
    // event.preventDefault();
    if (!email || !password) {
      return;
    }
  
    try {
      const auth = getAuth();
      let userFound = false;
  
      if (role === 'gdtAdmin' || role === 'gdtStaff') {
        const q = query(collection(db, 'GDT'), where('PhoneNumber', '==', phoneNumber));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          try {
            const userCredential = await signInWithEmailAndPassword(auth, phoneNumber, password);
            const user = userCredential.user;
  
            // Check if the user's email is verified
            if (!user.emailVerified) {
              setPopupMessage("Please verify your email before logging in.");
              setPopupImage(errorImage);
              setPopupVisible(true);
              return;
            }
  
            // If the email is verified, proceed with login
            userFound = true;
            setPopupMessage("Login successful!");
            setPopupImage(successImage);
            setPopupVisible(true);
            setTimeout(() => {
              navigate(role === 'gdtAdmin' ? '/Adminhomepage' : '/Staffhomepage');
            }, 1500);
          } catch (error) {
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
  
      if (role === 'employer') {
        const q = query(collection(db, 'Employer'), where('CompanyEmail', '==', email));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
  
            // Check if the user's email is verified
            if (!user.emailVerified) {
              setPopupMessage("Please verify your email before logging in.");
              setPopupImage(errorImage);
              setPopupVisible(true);
              return;
            }
  
            // If the email is verified, proceed with login
            userFound = true;
            const employerUID = querySnapshot.docs[0].id;
            sessionStorage.setItem('employerUID', employerUID);
            setPopupMessage("Login successful!");
            setPopupImage(successImage);
            setPopupVisible(true);
            setTimeout(() => {
              navigate('/employer-home');
            }, 1500);
          } catch (error) {
            setPopupMessage('Incorrect email or password.');
            setPopupImage(errorImage);
            setPopupVisible(true);
          }
        } else {
          setPopupMessage('Incorrect email or password.');
          setPopupImage(errorImage);
          setPopupVisible(true);
        }
      }
  
      if (!userFound) {
        setPopupMessage("Incorrect Email or password.");
        setPopupImage(errorImage);
        setPopupVisible(true);
      }
    } catch (error) {
      console.error("Error fetching user: ", error);
    }
  };
  
  

  const handleClosePopup = () => {
    setPopupVisible(false);
  };

  return (
    <div
      className="login-container"
    >
      <div >
        <img src={backgroundImage} alt="Top Right Image" className="top-right-image" />

      </div>

      <h1 style={{ marginTop: '40px' }}>Welcome to SAIR!</h1>
      <p style={{ marginLeft: '120px', marginTop: '38px', color: '#211d1d', fontSize: "20px" }}>Please Select your Role</p><br></br>


      <select id="roleSelect" onChange={handleRoleChange}>
        <option style={{ fontSize: "15px" }} value="">-- Select a Role --</option>
        <option style={{ fontSize: "15px" }} value="gdtAdmin">GDT Admin</option>
        <option style={{ fontSize: "15px" }} value="gdtStaff">GDT Staff</option>
        <option style={{ fontSize: "15px" }} value="employer">Employer</option>
      </select>
      <br /><br />

      <div className="form-container" style={{
        display: role ? 'block' : 'none', marginLeft: '100px'
      }}>
        <Form id="dynamicForm" onSubmit={handleSubmit}>
          {role === 'gdtAdmin' || role === 'gdtStaff' ? (
            <div>
              <p style={{ fontSize: "20px" }} >Please fill in the following information to log in to your account.</p>
              <br />
              <label htmlFor="phoneNumber">Phone Number:</label><br />
              <input
                type="text"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ''))}
              />
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
          ) : role === 'employer' ? (
            <div >
              <p style={{ marginLeft: '24px', marginBottom: '1px', color: '#211d1d', fontSize: "18px" }}>Please fill in the following information to log in to your account.</p>
              <style>
                {`
          input::placeholder {
            font-size: 14px;
            padding-left: 15px;

          }
        `}
              </style>

                {/* <Form.Item 
                  name="Email"
               
                >
                  <Input 
                    type="email" 
                    placeholder='Enter your Company Email'
                    value={email}
                    onFocus={(e) => e.target.placeholder = ''} // Clear placeholder on focus
                    onBlur={(e) => e.target.placeholder = 'Enter your Email'} // Restore placeholder on blur if empty
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Item> */}
                
              <input
                type="email"
                id="email"
                placeholder='Enter your Company email'
                value={email}
                onFocus={(e) => e.target.placeholder = ''} // Clear placeholder on focus
                onBlur={(e) => e.target.placeholder = 'Enter your Company email'} // Restore placeholder on blur if empty
                onChange={(e) => setEmail(e.target.value )}
              /><br></br>
              <label htmlFor="password"></label><br />
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  placeholder='Enter your password'
                  value={password}
                  onFocus={(e) => e.target.placeholder = ''} // Clear placeholder on focus
                  onBlur={(e) => e.target.placeholder = 'Enter your password'} // Restore placeholder on blur if empty
                  onChange={(e) => setPassword(e.target.value)}
                  required
                /><br />
                <span onClick={togglePasswordVisibility} className="password-toggle-icon">
                  <i className={showPassword ? 'far fa-eye' : 'far fa-eye-slash'}></i>
                </span>
              </div>
            </div>
          ) : null}
          <br></br>
          <div className="link-container">
            <a
              id='forget'
              onClick={() => navigate('/ForgotPassword')}
              style={{ cursor: 'pointer' }}
            >
              Forget password?
            </a>
            <br />
            {role === 'employer' && (
              <a
                id='signup'
                onClick={() => navigate('/Signup')}
                style={{ cursor: 'pointer' }}
              >
                Don't have a employer account? Sign up here
              </a>
            )}
          </div>
          <button id='signsubmit2' onClick={handleSubmit} type="submit">Log in</button>
        </Form>
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