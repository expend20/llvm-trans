import React from 'react';
import LLVMRiscy from './llvm-riscy';
import ensureSignedInWithRedirect from '../api/redirect-to-signin';

const LandingPage = ({ currentUser }) => {

  return (
    <>
      <LLVMRiscy />
    </>
  );
};

LandingPage.getInitialProps = async ( context, client, currentUser ) => {
  // currently this is exposed without any authentication
  // ensureSignedInWithRedirect(context, currentUser);
  return {};
};

export default LandingPage;

