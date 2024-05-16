// src/components/Login.js
import React, { useState } from 'react';
import { Home } from './Home';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Login.module.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]= useState('');
  const [success, setSuccess]= useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const loginData = {
      email: username,
      password: password
    };

    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setError('');
        console.log('Login successful:', data.user);
        navigate('/home');
      } else {
        setError(data.message);
        setSuccess('');
      }
    } catch (error) {
      setError('Server error');
      setSuccess('');
      console.error('Error:', error);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.heading}>
        <h1>Welcome !</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <i className={`fas fa-user ${styles.icon}`}></i>
          <input
            type="text"
            id="username"
            className={styles.input}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <i className={`fas fa-lock ${styles.icon}`}></i>
          <input
            type="password"
            id="password"
            className={styles.input}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.button}>login</button>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <div className={styles.link}>
          <a href="#">Forgot your password?</a>
          <a href='#'>register</a>
        </div>
      </form>
    </div>
  );
};

export default Login;
