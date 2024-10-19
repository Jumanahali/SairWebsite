import React, { useState } from 'react';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { EmailAuthProvider, updatePassword, reauthenticateWithCredential } from 'firebase/auth';
import successImage from '../../images/Sucess.png';
import errorImage from '../../images/Error.png';
// import phoneIcon from '../../images/phone-icon.png'; // Update with the path to your phone icon
import '../../App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const ForgetPassword = () => {
  const [state, setState] = useState('');
    const [step, setStep] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState('+966');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [validationMessages, setValidationMessages] = useState({
        phoneError: '',
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

    const handlePhoneChange = (e) => {
        let newPhoneNumber = e.target.value;
        if (newPhoneNumber.startsWith('+966')) {
            setPhoneNumber(newPhoneNumber);
        } else {
            newPhoneNumber = '+966' + newPhoneNumber.slice(3);
            setPhoneNumber(newPhoneNumber);
        }

        const phoneError = newPhoneNumber !== '+966' ? validatePhoneNumber(newPhoneNumber) : '';
        setValidationMessages((prev) => ({ ...prev, phoneError }));
    };

    const validatePhoneNumber = (phoneNumber) => {
        const phoneRegex = /^\+9665\d{8}$/;
        return phoneRegex.test(phoneNumber) ? '' : 'Phone number must start with +9665 and be followed by 8 digits.';
    };

    const handleOtpChange = (e, index) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Focus next input
            if (value && index < otp.length - 1) {
                document.getElementById(`otp-input-${index + 1}`).focus();
            }
        }
    };

    const handleVerifyOtp = () => {
        if (otp.join('') === '123456') {
            setStep(3); // Assuming '123456' is the correct OTP for demonstration
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
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(
                user.email,
                otp.join('') // In a real scenario, replace with the user's verified current password or OTP equivalent
            );

            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            setPopupMessage("Your password has been reset successfully!");
            setPopupImage(successImage);
            setPopupVisible(true);
            setTimeout(() => {
                setPopupVisible(false);
                navigate('/login'); // Redirect to login page after password reset
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
        <div className="forget-password-container">
            <h1 style={{ marginTop: '40px' }}>Reset Password</h1>
            {step === 1 && (
                <div>
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        style={{ borderColor: validationMessages.phoneError ? 'red' : 'green' }}
                    />
                    {validationMessages.phoneError && (
                        <p style={{ color: 'red' }}>{validationMessages.phoneError}</p>
                    )}
                    <button onClick={() => setStep(2)} style={{ marginTop: '20px' }}>Send OTP</button>
                </div>
            )}
            {step === 2 && (
                <div>
                    {/* <img src={phoneIcon} alt="Phone Icon" className="phone-icon" /> */}
                    <h2>Please check your phone</h2>
                    <p>We’ve sent a code to {phoneNumber}</p>
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
                            />
                        ))}
                    </div>
                    {validationMessages.otpError && (
                        <p style={{ color: 'red' }}>{validationMessages.otpError}</p>
                    )}
                    <button onClick={handleVerifyOtp} style={{ marginTop: '20px' }}>Verify OTP</button>
                </div>
            )}
            {step === 3 && (
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
            )}
            {popupVisible && (
                <div className="popup">
                    <img src={popupImage} alt="Popup" />
                    <p>{popupMessage}</p>
                </div>
            )}
        </div>
    );
};

export default ForgetPassword;
