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

// Update getInitialProps to fetch tickets
LandingPage.getInitialProps = async ( context, client, currentUser ) => {
  ensureSignedInWithRedirect(context, currentUser);
  // ensure user is logged in
  return {};
};

export default LandingPage;

