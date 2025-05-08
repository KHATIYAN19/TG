import React, { useState, useRef, useEffect } from 'react';
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios'; // Import axios
import { useNavigate } from 'react-router-dom'; 
import { useDispatch } from "react-redux"; 
import { login } from "../Redux/authSlice"; 
import BASE_URL from '../utils/Url'; 
import { Eye, EyeOff, ArrowLeft, Lock, Mail, Loader2, User as UserIcon, Phone, RefreshCw } from 'lucide-react'; // Added RefreshCw


const identifierSchema = z.union([
    z.string().email({ message: 'Invalid email address' }),
    z.string().regex(/^[6-9]\d{9}$/, { message: 'Invalid 10-digit Indian mobile number' })
]);

// Combined login schema
const loginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

// --- Component ---
const LoginPage = () => {
  const [stage, setStage] = useState('login'); 
  const [loginFormData, setLoginFormData] = useState({ identifier: '', password: '' });
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [loginFormErrors, setLoginFormErrors] = useState({}); 
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState('');

  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const timerIntervalRef = useRef(null); 

  const otpInputRefs = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  
  const startResendCooldown = () => {
    setIsResendDisabled(true);
    setResendCooldown(60); 

    if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current); 
    }

    timerIntervalRef.current = setInterval(() => {
      setResendCooldown(prevCooldown => {
        if (prevCooldown <= 1) {
          clearInterval(timerIntervalRef.current);
          setIsResendDisabled(false);
          return 0;
        }
        return prevCooldown - 1;
      });
    }, 1000); 
  };


  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginFormData(prev => ({ ...prev, [name]: value }));
    if (loginFormErrors[name]) {
      setLoginFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginFormErrors({}); // Clear previous client-side errors
    setIsSubmittingLogin(true);
    const toastId = toast.loading('Signing in...');

    const identifierValidation = identifierSchema.safeParse(loginFormData.identifier);
    if (!identifierValidation.success) {
         toast.error('Please enter a valid Email or 10-digit Mobile Number.', { id: toastId });
         setLoginFormErrors({ identifier: ['Invalid Email or Mobile Number'] });
         setIsSubmittingLogin(false);
         return;
    }

    const validationResult = loginSchema.safeParse(loginFormData);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      setLoginFormErrors(errors); // Set local errors for input highlights
      const firstError = Object.values(errors).flat()[0];
      toast.error(firstError || 'Please check your input.', { id: toastId });
      setIsSubmittingLogin(false);
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/admin/login`, {
        identifier: validationResult.data.identifier,
        password: validationResult.data.password,
      });

      toast.success(response.data.message || 'Login successful! Please enter OTP.', { id: toastId });
      setUserIdentifier(validationResult.data.identifier);
      setStage('otp');
      setLoginFormData({ identifier: '', password: '' }); 
      setTimeout(() => otpInputRefs.current[0]?.focus(), 0);
      startResendCooldown(); 

    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Login failed. Please check credentials.';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value) || element.value.length > 1) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
        if (!otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    } else if (e.key >= '0' && e.key <= '9') {
         if (otp[index] && index < 5) {
             const newOtp = [...otp];
             newOtp[index] = e.key;
             setOtp(newOtp);
             otpInputRefs.current[index + 1]?.focus();
             e.preventDefault();
         }
    } else if (e.key === 'ArrowLeft' && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
    }
  };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(paste)) {
            setOtp(paste.split(''));
            setTimeout(() => otpInputRefs.current[5]?.focus(), 0);
        }
        e.preventDefault();
    };


  const handleOtpSubmit = async (e) => {
      e.preventDefault();
      const enteredOtp = otp.join('');
      if (enteredOtp.length !== 6) {
          toast.error('Please enter all 6 digits of the OTP.');
          return;
      }
      setIsSubmittingOtp(true);
      const toastId = toast.loading('Verifying OTP...');

      try {
          const response = await axios.post(`${BASE_URL}/admin/verify-otp`, {
              identifier: userIdentifier,
              otp: enteredOtp,
          });

           const { user, token } = response.data;
           dispatch(login({ user, token }));
           toast.success('OTP Verified! Logged in.', { id: toastId });
           navigate('/');

      } catch(error) {
          console.error('OTP Verification error:', error);
          const errorMsg = error.response?.data?.message || error.message || 'Invalid OTP. Please try again.';
          toast.error(errorMsg, { id: toastId });
          otpInputRefs.current[0]?.focus();
      } finally {
          setIsSubmittingOtp(false);
      }
  };

  const handleResendOtp = async () => {
      if (isResendDisabled) return; 

      setIsResendingOtp(true);
      const toastId = toast.loading('Resending OTP...');
      try {
           await axios.post(`${BASE_URL}/admin/resend-otp`, {
              identifier: userIdentifier,
          });
          toast.success('New OTP sent successfully.', { id: toastId });
          setOtp(new Array(6).fill('')); 
          otpInputRefs.current[0]?.focus();
          startResendCooldown(); 

      } catch (error) {
          console.error('Resend OTP error:', error);
          const errorMsg = error.response?.data?.message || error.message || 'Failed to resend OTP.';
          toast.error(errorMsg, { id: toastId });
      } finally {
          setIsResendingOtp(false);
      }
  };


  const handleGoBack = () => {
    setStage('login');
    setOtp(new Array(6).fill(''));
    setLoginFormErrors({});
    setUserIdentifier('');
     if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
     }
     setIsResendDisabled(false);
     setResendCooldown(0);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 p-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 md:p-8 relative overflow-hidden">

        {stage === 'otp' && (
          <button onClick={handleGoBack} className="absolute top-4 left-4 text-gray-500 hover:text-blue-600 transition-colors duration-200 z-10 p-1 rounded-full hover:bg-gray-100" title="Go back to login">
            <ArrowLeft size={20} />
          </button>
        )}

        {/* Login Stage */}
        {stage === 'login' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">Admin Login</h2>
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Identifier (Email or Mobile) */}
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">Email or Mobile Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    
                    {loginFormData.identifier.includes('@') ? <Mail size={18} /> : <Phone size={18} />}
                  </span>
                  <input
                    type="text" id="identifier" name="identifier"
                    value={loginFormData.identifier} onChange={handleLoginInputChange}
                    disabled={isSubmittingLogin}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${loginFormErrors.identifier ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:border-blue-500'}`}
                    placeholder="Enter email or mobile" 
                  />
                </div>
                {/* Only show Zod validation error below field */}
                {loginFormErrors.identifier && <p className="mt-1 text-xs text-red-500">{loginFormErrors.identifier[0]}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"> <Lock size={18} /> </span>
                  <input
                    type={showPassword ? 'text' : 'password'} id="password" name="password"
                    value={loginFormData.password} onChange={handleLoginInputChange}
                    disabled={isSubmittingLogin}
                    className={`w-full pl-10 pr-10 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${loginFormErrors.password ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:border-blue-500'}`}
                    placeholder="Enter your password" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-600 cursor-pointer" title={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Only show Zod validation error below field */}
                 {loginFormErrors.password && <p className="mt-1 text-xs text-red-500">{loginFormErrors.password[0]}</p>}
              </div>

              {/* Removed API Error Message Area */}
              {/* {loginFormErrors.api && <p className="text-xs text-red-500 text-center">{loginFormErrors.api}</p>} */}


              {/* Submit Button */}
              <div className="pt-2">
                <button type="submit" disabled={isSubmittingLogin} className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out">
                  {isSubmittingLogin ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                  {isSubmittingLogin ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>
             <div className="text-center mt-4">
                <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
             </div>
          </div>
        )}

      
        {stage === 'otp' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">Enter OTP</h2>
            <p className="text-center text-sm text-gray-600 mb-6">
              An OTP has been sent to <span className="font-medium">{userIdentifier}</span>.
            </p>
            <div className="flex justify-center gap-2 md:gap-3 mb-6" dir="ltr" onPaste={handlePaste}>
              {otp.map((data, index) => (
                <input
                  key={index}
                  ref={el => otpInputRefs.current[index] = el}
                  type="text" inputMode="numeric" pattern="[0-9]*" name="otp" maxLength="1"
                  value={data}
                  onChange={e => handleOtpChange(e.target, index)}
                  onKeyDown={e => handleOtpKeyDown(e, index)}
                  onFocus={e => e.target.select()}
                  disabled={isSubmittingOtp}
                  className="w-10 h-12 md:w-12 md:h-14 text-center text-lg md:text-xl font-semibold border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                />
              ))}
            </div>
             <div className="pt-2">
                <button onClick={handleOtpSubmit} disabled={isSubmittingOtp || otp.join('').length !== 6} className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out">
                  {isSubmittingOtp ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                  {isSubmittingOtp ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            <div className="text-center mt-4">
                <button
                    onClick={handleResendOtp}
                    disabled={isResendingOtp || isResendDisabled} // Disable if sending or in cooldown
                    className="text-sm text-blue-600 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                >
                     {isResendingOtp
                        ? 'Sending...'
                        : isResendDisabled
                            ? `Resend OTP in ${resendCooldown}s`
                            : 'Resend OTP'
                     }
                </button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield; /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
