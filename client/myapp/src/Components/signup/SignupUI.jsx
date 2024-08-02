import React, { useContext, useState } from 'react';
import { storeContext } from '../Context/storeContext';
import { useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from 'react-toastify'
import img from '../../images/default3.jpg'
const SignupUI = () => {
    const navigate = useNavigate();
    const { api } = useContext(storeContext);
    const [error, setError] = useState();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState()
    const [showToUser, setShowToUser] = useState()

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
    const [showPassword, setShowPassword] = useState(false);

    // getting the images from user and again showing back....
    const handleSubmitImage = (e) => {
        setErrors('')
        const file = e.target.files[0]
        if (file) {
            setFile(file)
            const reader = new FileReader()

            reader.onloadend = () => {
                setShowToUser(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

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

        if (!file) return error = "Picture is empty"
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

        // Validating firstname
        if (!file) {
            newErrors.file = "profile is required for signup"
        }
        if (inpVal.firstname.trim() === '') {
            newErrors.firstname = 'First name is required';
            formIsValid = false;
        } else if (inpVal.firstname.trim().length < 3) {
            newErrors.firstname = 'First name must be at least 3 characters';
            formIsValid = false;
        }

        // Validating lastname
        if (inpVal.lastname.trim() === '') {
            newErrors.lastname = 'Last name is required';
            formIsValid = false;
        } else if (inpVal.lastname.trim().length < 3) {
            newErrors.lastname = 'Last name must be at least 3 characters';
            formIsValid = false;
        }

        // Validating email
        if (inpVal.email.trim() === '') {
            newErrors.email = 'Email is required';
            formIsValid = false;
        } else if (!inpVal.email.includes('@')) {
            newErrors.email = 'Invalid email format';
            formIsValid = false;
        }

        // Validating password
        if (inpVal.password.trim() === '') {
            newErrors.password = 'Password is required';
            formIsValid = false;
        } else if (inpVal.password.length < 6) {
            newErrors.password = 'Password must be at least 8 characters';
            formIsValid = false;
        }

        // Updating errors state
        setErrors(newErrors);

        if (formIsValid) {
            setInpVal(inpVal);
            SubmitUserDetails();
        } else {
            setLoading(false)
            console.log('Form has validation errors. Please correct them.');
        }
    }
    // sending user details to backed
    const SubmitUserDetails = async () => {
        try {

            if (!file) return setLoading(false)
            const formData = new FormData();

            // sets file inside formData with key avatar....key-value pair
            formData.append('avatar', file);

            Object.keys(inpVal).forEach(key => {
                formData.append(key, inpVal[key]);
            });
            const sendDatas = await api.post('/signup', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
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
        <div className='flex justify-center items-center w-full min-h-screen h-full border-2 place-items-center'>
            <div className='w-full h-full sm:px-0 px-[4%] mx-auto mt-5 items-center flex flex-col gap-4'>
                <div className='w-full p-3 sm:p-8 max-w-[500px] h-fit flex flex-col gap-4 bg-white shadow-2xl rounded-xl text-start border-[1px]'>
                    <div className='w-full flex flex-row items-center justify-between gap-5'>
                        <div className='flex flex-col'>
                            <p className='sm:text-[38px] text-[28px] font-[700] font-sans text-[#1877F2]'>Connectify</p>
                            <p className='text-md text-slate-700 flex items-center'>Create a new account</p>
                        </div>
                        <div className='flex items-center lg:cursor-pointer flex-col gap-2'>
                            <input
                                type='file'
                                id='fileInput'
                                accept='image/jpeg, image/jpg, image/png'
                                className='hidden'
                                onChange={handleSubmitImage}
                            />
                            <label htmlFor='fileInput' className='flex md:cursor-pointer w-full h-fit justify-center items-center'>
                                <div className='flex justify-center h-[54px] w-[54px]'>
                                    <img src={showToUser || img} className='rounded-full w-full h-full object-cover' alt='' />
                                </div>
                            </label>
                            <p className='text-gray-500 font-mono'>update profile</p>
                        </div>

                    </div>
                    <form onSubmit={handleSubmit} className='mt-2 flex gap-3 flex-col'>
                        <div className="flex gap-3">
                            <div className="flex flex-col w-full">
                                <input required type="text" placeholder='First name' className='placeholder:text-neutral-400 p-3 text-black outline-none w-full rounded-lg h-12 border-[1px] border-gray-300' name="firstname" value={inpVal.firstname} onChange={handleChange} onBlur={handleBlur} />
                                {errors.firstname && <p className="text-xs font-[500] font-sans text-red-500 mt-1">{errors.firstname}</p>}
                            </div>
                            <div className="flex flex-col w-full">
                                <input required type="text" placeholder='Last name' className='placeholder:text-neutral-400 p-3 text-black outline-none w-full rounded-lg h-12 border-[1px] border-gray-300' name="lastname" value={inpVal.lastname} onChange={handleChange} onBlur={handleBlur} />
                                {errors.lastname && <p className="text-xs font-sans font-[500] text-red-500 mt-1">{errors.lastname}</p>}
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
                        {errors.email && <p className="text-xs font-sans font-[500] text-red-500 mt-1">{errors.email}</p>}
                        <div className="relative w-full">
                            <input required type={showPassword ? 'text' : 'password'} placeholder='New password' className='placeholder:text-neutral-400 p-3 text-black outline-none w-full rounded-lg h-12 border-[1px] border-gray-300' name="password" value={inpVal.password} onChange={handleChange} onBlur={handleBlur} />
                            <span className="absolute right-3 top-3 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                                {!showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        {errors.file && <p className="text-xs font-sans font-[500] text-red-500 mt-1">{errors.file}</p>}
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
        </div>
    )
}

export default SignupUI;
