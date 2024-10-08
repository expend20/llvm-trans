
import React from 'react';
import ensureSignedInWithRedirect from '../../api/redirect-to-signin';
import MultiWindowCppEditors from '../../components/Windows';

const ObfuscatePage = ({ currentUser }) => {

  return (
    <>
      <MultiWindowCppEditors />
    </>
  );
};

ObfuscatePage.getInitialProps = async ( context, client, currentUser ) => {
  // currently this is exposed without any authentication
  // ensureSignedInWithRedirect(context, currentUser);
  return {};
};

export default ObfuscatePage;

