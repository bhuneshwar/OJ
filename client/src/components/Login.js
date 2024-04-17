import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../assets/style.css';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/auth/login', formData);
      console.log(response.data.message);
      localStorage.setItem('token', response.data.token);
      if (response.data.token) {
        navigate('/problems');
      }
    } catch (error) {
      console.error(error.response.data);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" value={email} onChange={handleChange} placeholder="Email" />
        <input type="password" name="password" value={password} onChange={handleChange} placeholder="Password" />
        <button type="submit" className="login-button">Login</button>
      </form>
      <div className="register-link">
        <Link to="/register">Register</Link>
      </div>
    </div>
  );
}

export default Login;
