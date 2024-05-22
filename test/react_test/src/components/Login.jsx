import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Login.module.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // Add state for toggling between login and register
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = {
      username,
      email,
      password
    };

    const url = isRegistering ? 'https://7gff8xytf4.execute-api.us-east-2.amazonaws.com/register' : 'https://7gff8xytf4.execute-api.us-east-2.amazonaws.com/login';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(result.message);
        setError('');
        console.log(isRegistering ? 'Registration successful:' : 'Login successful:', result.user);
        if (!isRegistering) {
          navigate('/home');
        }
      } else {
        setError(result.message);
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
        <h1>{isRegistering ? 'Register' : 'Welcome!'}</h1>
      </div>
      <form onSubmit={handleSubmit}>
        {isRegistering && (
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
        )}
        <div className={styles.formGroup}>
          <i className={`fas fa-envelope ${styles.icon}`}></i>
          <input
            type="email"
            id="email"
            className={styles.input}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <button type="submit" className={styles.button}>
          {isRegistering ? 'Register' : 'Login'}
        </button>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <div className={styles.link}>
          <a href="#" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Already have an account? Login' : 'Register'}
          </a>
        </div>
      </form>
    </div>
  );
};

export default Login;
