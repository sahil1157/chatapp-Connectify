import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeContext } from '../Context/storeContext';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from "react-icons/fa";


const LoginUi = () => {
    const navigate = useNavigate();
    const { api } = useContext(storeContext);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [getError, setGetError] = useState()

    const success = () => {
        toast.success("Login Successful");
    };

    const [inpVal, setInpVal] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInpVal(prevState => ({
            ...prevState,
            [name]: value
        }));

        validateField(name, value);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'email':
                if (value.trim() !== '' && !value.includes('@')) {
                    error = 'Invalid email format';
                }
                break;
            case 'password':
                if (value.trim() !== '' && value.length < 6) {
                    error = 'Password must be at least 6 characters';
                }
                break;
            default:
                break;
        }

        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: error
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let formIsValid = true;
        const newErrors = {};

        if (inpVal.email.trim() === '') {
            newErrors.email = 'Email is required';
            formIsValid = false;
        } else if (!inpVal.email.includes('@')) {
            newErrors.email = 'Invalid email format';
            formIsValid = false;
        }

        if (inpVal.password.trim() === '') {
            newErrors.password = 'Password is required';
            formIsValid = false;
        } else if (inpVal.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            formIsValid = false;
        }

        setErrors(newErrors);

        if (formIsValid) {
            setLoading(true);
            handleSubmitLoginDetails();
        } else {
            console.log('Form has validation errors. Please correct them.');
        }
    };

    const handleSubmitLoginDetails = async () => {
        try {
            const submitDetails = await api.post('/login', inpVal);
            if (submitDetails.data.valid) 
                success();
            setGetError('')
            setLoading(false);
        } catch (error) {
            setLoading(false)
            setGetError(error.response.data.message);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className='w-full sm:px-0 px-[4%] mt-20 mx-auto items-center flex flex-col gap-4'>
            <div>
                <p className='sm:text-[38px] text-[28px] font-[700] font-sans text-[#1877F2]'>Connectify</p>
            </div>
            <div className='w-full p-3  sm:p-8 max-w-[400px] h-fit flex flex-col gap-4 bg-white shadow-2xl rounded-xl text-center border-[1px]'>
                <p className='text-lg'>Log into Connectify</p>
                <form onSubmit={handleSubmit} className='mt-2 text-start flex gap-3 flex-col'>
                    <input required type="email" placeholder='Email or phone number' className='placeholder:text-neutral-400 p-3 text-black outline-none w-full rounded-lg h-12 border-[1px] border-gray-300' name="email" value={inpVal.email} onChange={handleChange} onBlur={handleBlur} />
                    {errors.email && <p className="text-sm font-[500] text-red-500">{errors.email}</p>}
                    <div className='relative'>
                        <input required type={showPassword ? 'text' : 'password'} placeholder='Password' className='placeholder:text-neutral-400 p-3 text-black outline-none w-full rounded-lg h-12 border-[1px] border-gray-300' name="password" value={inpVal.password} onChange={handleChange} onBlur={handleBlur} />
                        <span onClick={togglePasswordVisibility} className='absolute inset-y-0 right-4 flex items-center cursor-pointer'>
                            {showPassword ? (
                                <FaEye />
                            ) : (
                                <FaEyeSlash />
                            )}
                        </span>
                    </div>
                    {errors.password && <p className="text-sm font-[500] text-red-500">{errors.password}</p>}
                    {getError && <p className="text-red-500 text-sm font-[500]">{getError}</p>}
                    <button type="submit" className='w-full font-sans h-12 rounded-lg bg-[#1877F2] hover:bg-[#1f6bcd] duration-300 text-white text-xl font-[700] flex justify-center items-center'>
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>
                <p className='text-md md:cursor-pointer text-[#1f63bb]'>Forgot account?</p>
                <div className="flex flex-row w-full items-center justify-center">
                    <hr className="flex-grow border-t-1 items-center flex border-gray-300 mx-2" />
                    <p>or</p>
                    <hr className="flex-grow border-t-1 items-center flex border-gray-300 mx-2" />
                </div>

                <div className='w-full flex items-center justify-center'>
                    <button onClick={() => navigate('/signup')} className='w-fit p-3 rounded-lg bg-[#42b72a] text-white flex items-center duration-300 justify-center hover:bg-[#3ca527] h-12'>
                        Create new account
                    </button>
                </div>

            </div>
        </div>
    );
}

export default LoginUi;
