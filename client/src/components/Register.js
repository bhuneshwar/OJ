import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import axios from 'axios';
import '../assets/style.css';

function Register() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
  });

  const { firstname, lastname, email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/auth/register', formData);
      console.log('register response', response);
      console.log(response.data.message);
      // Redirect or show success message
    } catch (error) {
      console.error(error.response.data);
      // Handle errors (e.g., show error message)
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <input type="text" name="firstname" value={firstname} onChange={handleChange} placeholder="First Name" />
        <input type="text" name="lastname" value={lastname} onChange={handleChange} placeholder="Last Name" />
        <input type="email" name="email" value={email} onChange={handleChange} placeholder="Email" />
        <input type="password" name="password" value={password} onChange={handleChange} placeholder="Password" />
        <button type="submit" className="register-button">Register</button>
      </form>
      <div className="back-to-login-link">
        <Link to="/">Back to Login</Link> {/* Use the path you provided for the Register page */}
      </div>
    </div>
  );
}

export default Register;
