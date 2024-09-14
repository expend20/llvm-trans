import React from 'react';
import LoginForm from './login-shared';

export const Signup = ({ toastRef }) => {
  return (
    <LoginForm isSignup={true} toastRef={toastRef}/>
  );
}

export default Signup;
