import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';
import { classNames } from 'primereact/utils';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';
import { useFormik } from 'formik';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';

// performs login request
export const LoginForm = ({ isSignup, toastRef }) => {
  console.log(`LoginForm.isSignup: ${isSignup} toastRef: ${toastRef}`);

  if (isSignup === undefined) {
    isSignup = false;
  }

  const { doRequest: doRequestSignup } = useRequest({
    url: '/api/users/signup',
    method: 'post',
    onSuccess: () => Router.push('/'),
    toastRef: toastRef
  });
  const { doRequest: doRequestSignin } = useRequest({
    url: '/api/users/signin',
    method: 'post',
    onSuccess: () => Router.push('/'),
    toastRef: toastRef
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validate: (data) => {
      let errors = {};

      if (!data.email) {
        errors.email = 'Email is required.';
      }
      else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(data.email)) {
        errors.email = 'Invalid email address.';
      }

      if (!data.password) {
        errors.password = 'Password is required.';
      }

      return errors;
    },
    onSubmit: (values, _actions) => {
      isSignup ? doRequestSignup(values) : doRequestSignin(values);
    }
  });

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <div className="p-error text-xs">{formik.errors[name]}</div>;
  };
  const passwordHeader = "";
  const passwordFooter = (
    <React.Fragment>
      <Divider />
      <p className="mt-2">Requirements</p>
      <ul className="pl-2 ml-2 mt-0" style={{ lineHeight: '1.5' }}>
        <li>At least one lowercase</li>
        <li>At least one uppercase</li>
        <li>At least one numeric</li>
        <li>Minimum 8 characters</li>
      </ul>
    </React.Fragment>
  );

  return (
    <div className="flex justify-content-center align-items-center">
      <div className="card">
        <h3 className="text-center">{isSignup ? 'Register' : 'Sign In'}</h3>
        <form onSubmit={formik.handleSubmit}>
          <div className="field pt-2">
            <IconField iconPosition="right" className="p-float-label">
              <InputIcon className="pi pi-envelope"> </InputIcon>
              <InputText
                id="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                className={classNames({
                  'p-invalid': isFormFieldValid('email')
                })} />
              <label htmlFor="email"
                className={classNames({
                  'p-error': isFormFieldValid('email')
                })}>Email*</label>
            </IconField>
            {getFormErrorMessage('email')}
          </div>
          <div className="field pt-2">
            <span className="p-float-label">
              <Password
                id="password" name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                toggleMask
                className={classNames({
                  'p-invalid': isFormFieldValid('password')
                })}
                header={isSignup ? passwordHeader : null}
                footer={isSignup ? passwordFooter : null}
              />
              <label htmlFor="password"
                className={classNames({
                  'p-error': isFormFieldValid('password')
                })}>Password</label>
            </span>
            {getFormErrorMessage('password')}
          </div>
          <Button type="submit" label="Submit" className="mt-2" />
          <Divider />
          {isSignup ? (
            <p className="mt-2">Already have an account?
              <a href="/auth/signin"
                className="ml-1"
                onClick={(e) => {
                  e.preventDefault();
                  Router.push('/auth/signin');
                }}>Sign In</a></p>
          ) : (
            <p className="mt-2">Don't have an account?
              <a href="/auth/signup"
                className="ml-1"
                onClick={(e) => {
                  e.preventDefault();
                  Router.push('/auth/signup');
                }}>Register</a></p>
          )}
        </form>
      </div>
    </div>
  );
}

export default LoginForm;

