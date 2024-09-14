import React from 'react';
import ensureSignedInWithRedirect from '../../api/redirect-to-signin';

const RiscVmIndex = ({ currentUser, toastRef }) => {

  return (
    <>
      risc vm
    </>
  );
};

RiscVmIndex.getInitialProps = async (context, client, currentUser) => {
  ensureSignedInWithRedirect(context, currentUser);
  return {};
};

export default RiscVmIndex;
