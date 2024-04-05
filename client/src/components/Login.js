import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../assets/style.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;
  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/auth/login', formData);
      console.log(response.data.message);
      localStorage.setItem('token', response.data.token);
      // Redirect or handle login success (e.g., store token, redirect to dashboard)
      if(response.data.token){
        navigate('/problems');
      }
      
    } catch (error) {
      console.error(error.response.data);
      // Handle errors (e.g., show error message)
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" value={email} onChange={handleChange} placeholder="Email" />
        <input type="password" name="password" value={password} onChange={handleChange} placeholder="Password" />
        <button type="submit" className="login-button">Login</button>
      </form>
      {/* Add a Link to navigate to the Register page */}
      <div className="register-link">
        <Link to="/register">Register</Link> {/* Use the path you provided for the Register page */}
      </div>
    </div>
  );
}

export default Login;
