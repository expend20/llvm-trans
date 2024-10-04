import React from 'react';
import ensureSignedInWithRedirect from '../api/redirect-to-signin';
import MultiWindowCppEditors from './windows';

const LandingPage = ({ currentUser }) => {

  return (
    <>
      <MultiWindowCppEditors />
    </>
  );
};

LandingPage.getInitialProps = async ( context, client, currentUser ) => {
  // currently this is exposed without any authentication
  // ensureSignedInWithRedirect(context, currentUser);
  return {};
};

export default LandingPage;

