import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { EmailAuthProvider, updatePassword, reauthenticateWithCredential, sendPasswordResetEmail, getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, where, query } from 'firebase/firestore';
import successImage from '../../images/Sucess.png';
import errorImage from '../../images/Error.png';
import { sendEmail } from '../../utils/email';
import '../../ForgotPassword.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const ForgetPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [validationMessages, setValidationMessages] = useState({
    emailError: '',
    otpError: '',
    confirmPasswordError: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupImage, setPopupImage] = useState('');
  const navigate = useNavigate();

  function validEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  const handleResetPassword = async () => {
    try {
// VERIFY EMAIL
      if (!validEmail(email)) {
        setValidationMessages((prev) => ({
          ...prev,
          emailError: 'Please enter valid email.',
        }));
        return
      }
// check if email exists
      try {
        const q = query(collection(db, 'Employer'), where('EmployeerEmail', '==', email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log('No user found with this email.');
          setValidationMessages((prev) => ({
            ...prev,
            emailError: 'The email does not match our records.',
          }));
        } else {
          querySnapshot.forEach((doc) => {
            console.log(doc.id, '=>', doc.data());
          });
          // send reset email
          const auth = getAuth();
          sendPasswordResetEmail(auth, email)
            .then(() => {
              // Password reset email sent! 
              setPopupVisible(true);
              setPopupImage(successImage);
              setPopupMessage("Password reset email sent!");
              setTimeout(() => {
                navigate('/');
              }, 2000);
            })
            .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              console.log(errorCode, errorMessage); 
            });

        }
      } catch (error) {
        console.error('Error checking email existence:', error);
      }
 
    } catch (error) {
      console.error('Error verifying email:', error);
      setPopupMessage('Failed to verify email. Please try again.');
      setPopupImage(errorImage);
      setPopupVisible(true);
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }

      if (!value && index > 0) {
        document.getElementById(`otp-input-${index - 1}`).focus();
      }
    }
  };

  const handleVerifyOtp = () => {
    if (otp.join('') === sessionStorage.getItem('otp').toString()) {
      sessionStorage.removeItem('otp');
      setStep(3);
    } else {
      setValidationMessages((prev) => ({
        ...prev,
        otpError: 'Invalid OTP. Please try again.',
      }));
    }
  };

  const handleNewPasswordChange = (e) => {
    const { value } = e.target;
    setNewPassword(value);
    setPasswordRequirements({
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    });
  };

  const handleConfirmPasswordChange = (e) => {
    const { value } = e.target;
    setConfirmNewPassword(value);
    const confirmPasswordError = value !== newPassword ? 'Passwords do not match.' : '';
    setValidationMessages((prev) => ({
      ...prev,
      confirmPasswordError,
    }));
  };

  const handleSubmitNewPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setValidationMessages((prev) => ({
        ...prev,
        confirmPasswordError: 'Passwords do not match.',
      }));
      return;
    }

    try {

      setPopupMessage("Your password has been reset successfully!");
      setPopupImage(successImage);
      setPopupVisible(true);
      setTimeout(() => {
        setPopupVisible(false);
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setPopupMessage('Failed to reset password. Please try again.');
      setPopupImage(errorImage);
      setPopupVisible(true);
    }
  };

  const togglePasswordVisibility = (type) => {
    if (type === 'new') {
      setShowNewPassword(!showNewPassword);
    } else if (type === 'confirm') {
      setShowConfirmNewPassword(!showConfirmNewPassword);
    }
  };

  return (
    <div className="f-container">
      {step === 1 && (
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
            onChange={(e) => setEmail(e.target.value)}
            style={{ borderColor: validationMessages.emailError ? 'red' : 'green' }}
          />

          {validationMessages.emailError && (
            <p style={{ color: 'red' }}>{validationMessages.emailError}</p>
          )}

          <button className='send-code'
            onClick={handleResetPassword}  >
            Send Reset Email
          </button>

        </div>
      )}
      {/* {step === 2 && (
        <div>
          <h2>Please check your email</h2>
          <p>We’ve sent a code to {email}</p>
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(e, index)}
                id={`otp-input-${index}`}
                className="otp-input"
                style={{
                  width: '40px',
                  height: '40px',
                  textAlign: 'center',
                  margin: '5px',
                  fontSize: '18px',
                  borderColor: validationMessages.otpError ? 'red' : 'green'
                }}
              />
            ))}
          </div>
          {validationMessages.otpError && (
            <p style={{ color: 'red' }}>{validationMessages.otpError}</p>
          )}
          <button onClick={handleVerifyOtp} style={{ marginTop: '20px' }}>Verify OTP</button>
        </div>
      )} */}
      {/* {step === 3 && (
        <div>
          <label>New Password</label>
          <input
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={handleNewPasswordChange}
            style={{ borderColor: validationMessages.confirmPasswordError ? 'red' : 'green', paddingRight: '30px' }}
          />
          <span
            onClick={() => togglePasswordVisibility('new')}
            className="password-toggle-icon"
            style={{
              position: 'absolute',
              right: '10px',
              top: '25px',
              cursor: 'pointer'
            }}
          >
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
          <label>Confirm New Password</label>
          <input
            type={showConfirmNewPassword ? 'text' : 'password'}
            value={confirmNewPassword}
            onChange={handleConfirmPasswordChange}
            style={{ borderColor: validationMessages.confirmPasswordError ? 'red' : 'green', paddingRight: '30px' }}
          />
          <span
            onClick={() => togglePasswordVisibility('confirm')}
            className="password-toggle-icon"
            style={{
              position: 'absolute',
              right: '10px',
              top: '25px',
              cursor: 'pointer'
            }}
          >
            <i className={showConfirmNewPassword ? 'far fa-eye' : 'far fa-eye-slash'}></i>
          </span>
          {validationMessages.confirmPasswordError && (
            <p style={{ color: 'red' }}>{validationMessages.confirmPasswordError}</p>
          )}
          <button onClick={handleSubmitNewPassword} style={{ marginTop: '20px' }}>Reset Password</button>
        </div>
      )} */}
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
