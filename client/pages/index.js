import React from 'react';
import LandingPage from '../components/LandingPage';

const IndexPage = () => {

  return (
    <>
      <LandingPage />
    </>
  );
};

IndexPage.getInitialProps = async ( context, client ) => {
  return {};
};

export default IndexPage;

