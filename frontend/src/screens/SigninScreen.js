import Axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Helmet } from 'react-helmet-async';
import { useContext, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';

export default function SigninScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [show2FAModal, setShow2FAModal] = useState(false);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const finalizeLogin = (data) => {
    ctxDispatch({ type: 'USER_SIGNIN', payload: data });
    localStorage.setItem('userInfo', JSON.stringify(data));
    navigate(redirect || '/');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await Axios.post('/api/users/signin', { email, password });
      console.log("Server Response:", data);
  
      if (data.require2FA) {
        console.log("2FA is required. Showing modal...");
        setShow2FAModal(true);  // Показать модальное окно 2FA
      } else {
        console.log("2FA is not required. Finalizing login...");
        finalizeLogin(data);  // Завершение процесса входа и перенаправление
      }
    } catch (err) {
      console.log("Error during sign in:", err);
      toast.error(getError(err));
    }
  };
  
  
  const handle2FASubmission = async () => {
    try {
      const { data } = await Axios.post('/api/users/verify-2fa', {
        email,
        twoFactorToken
      });
      finalizeLogin(data);  // Завершение процесса входа после успешной проверки 2FA
      setShow2FAModal(false);
    } catch (err) {
      toast.error("Invalid 2FA code");
    }
  };
  
  return (
    <Container className="small-container">
      <Helmet>
        <title>Sign In</title>
      </Helmet>
      <h1 className="my-3">Sign In</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">Sign In</Button>
        </div>
        <div className="mb-3">
          New customer?{' '}
          <Link to={`/signup?redirect=${redirect}`}>Create your account</Link>
        </div>
        <div className="mb-3">
          Forget Password? <Link to={`/forget-password`}>Reset Password</Link>
        </div>
      </Form>

      <Modal show={show2FAModal} onHide={() => setShow2FAModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Two-factor authentication code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="twoFactorToken">
            <Form.Label>Enter code</Form.Label>
            <Form.Control
              type="text"
              required
              onChange={(e) => setTwoFactorToken(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow2FAModal(false)}>
            Закрыть
          </Button>
          <Button variant="primary" onClick={async () => {
            try {
              const { data } = await Axios.post('/api/users/signin', {
                email,
                password,
                twoFactorToken
              });
              finalizeLogin(data);
              setShow2FAModal(false);
            } catch (err) {
              toast.error(getError(err));
            }
          }}>
            Войти
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
