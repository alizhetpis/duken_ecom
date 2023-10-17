import React, { useContext, useReducer, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';
import QRCode from 'qrcode.react';

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };

    default:
      return state;
  }
};

export default function ProfileScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const [name, setName] = useState(userInfo.name);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enable2FA, setEnable2FA] = useState(
    JSON.parse(localStorage.getItem('enable2FA')) || false
  ); // Initialize with the value from local storage

  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  const [qrCodeDataUrl, setQRCodeDataUrl] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();
  
    // Данные, которые будут отправлены на сервер:
    const userData = {
      name,
      email,
      password,
      confirmPassword,
      enable2FA,
    };
  
    // Логируем эти данные:
    console.log("Sending the following data to the server:", userData);
  
    try {
      const { data } = await axios.put(
        '/api/users/profile',
        userData,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('User updated successfully');
    } catch (err) {
      dispatch({
        type: 'FETCH_FAIL',
      });
      toast.error(getError(err));
    }
  };
  

  const toggle2FAHandler = () => {
    if (!enable2FA) {
      // Generate a secret for 2FA (you can modify this as needed)
      const secret = 'your-secret-key';

      // Generate the 2FA QR code URL
      const qrCodeUrl = `otpauth://totp/Duken:${userInfo.email}?secret=${secret}&issuer=Duken`;

      // Set the QR code data URL in state
      setQRCodeDataUrl(qrCodeUrl);
    } else {
      // Clear the QR code data URL when disabling 2FA
      setQRCodeDataUrl('');
    }

    // Toggle the 2FA status
    setEnable2FA(!enable2FA);

    // Store the updated 'enable2FA' state in local storage
    localStorage.setItem('enable2FA', JSON.stringify(!enable2FA));
  };

  useEffect(() => {
    // Cleanup function to clear the 'qrCodeDataUrl' when unmounting the component
    return () => setQRCodeDataUrl('');
  }, []);

  return (
    <div className="container small-container">
      <Helmet>
        <title>User Profile</title>
      </Helmet>
      <h1 className="my-3">User Profile</h1>
      <form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="enable2FA">
          <Form.Check
            type="switch"
            id="custom-switch"
            label="Enable 2FA"
            checked={enable2FA}
            onChange={toggle2FAHandler}
          />
        </Form.Group>
        <div className="mb-3">
          {/* Render the QR code using the 'QRCode' component */}
          {qrCodeDataUrl && <QRCode value={qrCodeDataUrl} />}
        </div>
        <div className="mb-3">
          <Button type="submit">Update</Button>
        </div>
      </form>
    </div>
  );
}
