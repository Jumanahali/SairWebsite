import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
import { collection, getDocs, where, query } from 'firebase/firestore';
import successImage from '../../images/Sucess.png';
import errorImage from '../../images/Error.png';
import '../../ForgotPassword.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [validationMessages, setValidationMessages] = useState({
    emailError: '',
  });
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupImage, setPopupImage] = useState('');
  const navigate = useNavigate();

  function validEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Real-time validation
    if (!validEmail(value)) {
      setValidationMessages({ emailError: 'Please enter a valid email.' });
    } else {
      setValidationMessages({ emailError: '' }); // Clear error if valid
    }
  };

  const handleResetPassword = async () => {
    if (!validEmail(email)) {
      return; // Prevent submission if invalid
    }

    try {
      const q = query(collection(db, 'Employer'), where('EmployeerEmail', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setValidationMessages({ emailError: 'The email does not exist.' });
      } else {
        const auth = getAuth();
        sendPasswordResetEmail(auth, email)
          .then(() => {
            setPopupVisible(true);
            setPopupImage(successImage);
            setPopupMessage("Password reset email sent!");
            setTimeout(() => {
              navigate('/');
            }, 2000);
          })
          .catch((error) => {
            console.error('Error sending email:', error);
          });
      }
    } catch (error) {
      setPopupMessage('Failed to verify email. Please try again.');
      setPopupImage(errorImage);
      setPopupVisible(true);
    }
  };


  
  return (
    <div className="f-container">
        <div className='f-inner'>
          <h1 className='f-title'>Forgot Password?</h1>
          <p className='info'>
            Don't worry! It occurs. Please enter your email that is linked with your account.
          </p>
          <label style={{ visibility: "hidden" }}>
            Enter your email
          </label>

          <input
            className='email'
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={handleEmailChange}
            style={{ borderColor: validationMessages.emailError ? 'red' : 'green' }}
          />

          {validationMessages.emailError && (
            <p style={{ color: 'red', textAlign:'left' , marginLeft:'90px' }}>{validationMessages.emailError}</p>
          )}

          <button className='send-code'
            onClick={handleResetPassword}  >
            Send Reset Email
          </button>

        </div>
      

      {popupVisible && (
        <div className="popup">
          <button
            onClick={() => setPopupVisible(false)}
            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
          ><i className="fas fa-times"></i></button>
          <img src={popupImage} alt="Popup" />
          <p>{popupMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ForgetPassword;
