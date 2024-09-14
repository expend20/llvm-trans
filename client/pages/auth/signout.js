import React from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';
import { useEffect } from 'react';

export const Signout = ({ toastRef }) => {
  const { doRequest } = useRequest({
    url: '/api/users/signout',
    method: 'post',
    body: {},
    onSuccess: () => Router.push('/'),
    toastRef: toastRef,
  });

  useEffect(() => {
    doRequest();
  });

  return (
    <>
      <h1>Signing you out...</h1>
    </>
  );
}

export default Signout;
