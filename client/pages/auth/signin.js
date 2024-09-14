import React from 'react';
import LoginForm from './login-shared';

export const Signin = ({ toastRef }) => {
  return (<LoginForm isSignup={false} toastRef={toastRef} />);
}

export default Signin;
