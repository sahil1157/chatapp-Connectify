import React, { useContext, useState } from 'react';
import { storeContext } from '../Context/storeContext';
import { useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from 'react-toastify'

const SignupUI = () => {
    const navigate = useNavigate();
    const { api } = useContext(storeContext);
    const [error, setError] = useState();
    const [loading, setLoading] = useState(false);

    const success = () => {
        toast.success("Signedin successful")
    }
    const [inpVal, setInpVal] = useState({
        firstname: '',
        lastname: '',
        gender: '',
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        errorFromBackend: ""
    });
    const [showPassword, setShowPassword] = useState(false); // State to manage password visibility

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInpVal(prevState => ({
            ...prevState,
            [name]: value
        }));

        // Validate on change
        validateField(name, value);
    }

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    }

    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'firstname':
            case 'lastname':
                if (value.trim() !== '' && value.trim().length < 3) {
                    error = `${name === 'firstname' ? 'First name' : 'Last name'} must be at least 3 characters`;
                }
                break;
            case 'email':
                if (value.trim() !== '' && !value.includes('@')) {
                    error = 'Invalid email format';
                }
                break;
            case 'password':
                if (value.trim() !== '' && value.length < 8) {
                    error = 'Password must be at least 8 characters';
                }
                break;
            default:
                break;
        }

        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: error
        }));
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true)

        // Form validation logic
        let formIsValid = true;
        const newErrors = {};

        // Validate firstname
        if (inpVal.firstname.trim() === '') {
            newErrors.firstname = 'First name is required';
            formIsValid = false;
        } else if (inpVal.firstname.trim().length < 3) {
            newErrors.firstname = 'First name must be at least 3 characters';
            formIsValid = false;
        }

        // Validate lastname
        if (inpVal.lastname.trim() === '') {
            newErrors.lastname = 'Last name is required';
            formIsValid = false;
        } else if (inpVal.lastname.trim().length < 3) {
            newErrors.lastname = 'Last name must be at least 3 characters';
            formIsValid = false;
        }

        // Validate email
        if (inpVal.email.trim() === '') {
            newErrors.email = 'Email is required';
            formIsValid = false;
        } else if (!inpVal.email.includes('@')) {
            newErrors.email = 'Invalid email format';
            formIsValid = false;
        }

        // Validate password
        if (inpVal.password.trim() === '') {
            newErrors.password = 'Password is required';
            formIsValid = false;
        } else if (inpVal.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
            formIsValid = false;
        }

        // Update errors state
        setErrors(newErrors);

        if (formIsValid) {
            setInpVal(inpVal);
            SubmitUserDetails();
        } else {
            console.log('Form has validation errors. Please correct them.');
        }
    }

    // sending user details to backed
    const SubmitUserDetails = async () => {
        try {
            const sendDatas = await api.post('/signup', inpVal);
            if (sendDatas.ok)
                setLoading(false)
            setError('')
            success()
            navigate('/login');
        } catch (error) {
            setLoading(false)
            setError(error.response.data.message);
        }
    }

    return (
        <div className='w-full sm:px-0 px-[4%] mt-12 mx-auto items-center flex flex-col gap-4'>
            <div>
                <p className='sm:text-[38px] text-[28px] font-[700] font-sans text-[#1877F2]'>Connectify</p>
            </div>
            <div className='w-full p-3 sm:p-8 max-w-[490px] h-fit flex flex-col gap-4 bg-white shadow-2xl rounded-xl text-start border-[1px]'>
                <p className='text-lg'>Create a new account</p>
                <form onSubmit={handleSubmit} className='mt-2 flex gap-3 flex-col'>
                    <div className="flex gap-3">
                        <div className="flex flex-col w-full">
                            <input required type="text" placeholder='First name' className='placeholder:text-neutral-400 p-3 text-black outline-none w-full rounded-lg h-12 border-[1px] border-gray-300' name="firstname" value={inpVal.firstname} onChange={handleChange} onBlur={handleBlur} />
                            {errors.firstname && <p className="text-sm font-[500] font-sans text-red-500 mt-1">{errors.firstname}</p>}
                        </div>
                        <div className="flex flex-col w-full">
                            <input required type="text" placeholder='Last name' className='placeholder:text-neutral-400 p-3 text-black outline-none w-full rounded-lg h-12 border-[1px] border-gray-300' name="lastname" value={inpVal.lastname} onChange={handleChange} onBlur={handleBlur} />
                            {errors.lastname && <p className="text-sm font-sans font-[500] text-red-500 mt-1">{errors.lastname}</p>}
                        </div>
                    </div>
                    <p className='text-left text-sm font-semibold text-gray-400'>Gender</p>
                    <div className="sm:flex-row flex flex-col items-center w-full justify-center gap-3 -mt-1">
                        <button type="button" className='flex justify-between items-center w-full p-3 rounded-lg border-[1px] border-gray-300' onClick={() => setInpVal(prevState => ({ ...prevState, gender: 'male' }))}>
                            Male
                            <input required type="radio" name="gender" value="male" checked={inpVal.gender === 'male'} onChange={handleChange} className="form-radio ml-2" />
                        </button>
                        <button type="button" className='flex justify-between items-center w-full p-3 rounded-lg border-[1px] border-gray-300' onClick={() => setInpVal(prevState => ({ ...prevState, gender: 'female' }))}>
                            Female
                            <input required type="radio" name="gender" value="female" checked={inpVal.gender === 'female'} onChange={handleChange} className="form-radio ml-2" />
                        </button>
                    </div>
                    <input required type="email" placeholder='Email ' className='placeholder:text-neutral-400 p-3 text-black outline-none w-full rounded-lg h-12 border-[1px] border-gray-300' name="email" value={inpVal.email} onChange={handleChange} onBlur={handleBlur} />
                    {errors.email && <p className="text-sm font-sans font-[500] text-red-500 mt-1">{errors.email}</p>}
                    <div className="relative w-full">
                        <input required type={showPassword ? 'text' : 'password'} placeholder='New password' className='placeholder:text-neutral-400 p-3 text-black outline-none w-full rounded-lg h-12 border-[1px] border-gray-300' name="password" value={inpVal.password} onChange={handleChange} onBlur={handleBlur} />
                        <span className="absolute right-3 top-3 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                            {!showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    {errors.password && <p className="text-sm font-sans font-[500] text-red-500 mt-1">{errors.password}</p>}
                    {error && <p className="text-sm text-red-500 font-[500] font-sans -mt-1">{error}</p>}
                    <button type="submit" className='w-full font-sans h-12 rounded-lg bg-[#1877F2] hover:bg-[#1f6bcd] duration-300 text-white text-xl font-[700] flex justify-center items-center'>
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                        ) : (
                            'Signin'
                        )}
                    </button>
                </form>
                <p className='text-md md:cursor-pointer text-[#1f63bb]'>Forgot account?</p>
                <div className="flex flex-row w-full items-center justify-center">
                    <hr className="flex-grow border-t-1 items-center flex border-gray-300 mx-2" />
                    <p>or</p>
                    <hr className="flex-grow border-t-1 items-center flex border-gray-300 mx-2" />
                </div>
                <p onClick={() => navigate('/login')} className='text-md md:cursor-pointer text-[#1f63bb]'>Already have an account?</p>
            </div>
        </div >
    )
}

export default SignupUI;
