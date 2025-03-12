import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const VITE_API_URL = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginPayload = new FormData();
      loginPayload.append('username', formData.email)
      loginPayload.append('password', formData.password)

      const response = await axios.post(
        `${VITE_API_URL}/api/v1/signin/access-token`,
        loginPayload
      );

      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Incorrect username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
