import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '../styles/globals.css';
import { Toast } from 'primereact/toast';
import Background from '../components/background';

import React from 'react';
import buildClient from '../api/build-client';
import TopPanel from '../components/top-panel';

//import { PrimeReactContext } from 'primereact/api';
//import { useContext } from 'react';

import { ThemeProvider } from '../context/theme-context';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

MyApp.getInitialProps = async appContext => {

  const client = buildClient({ req: appContext.ctx.req });
  const { data } = await client.get('/api/users/currentuser');
  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx, client, data.currentUser);
  }
  return { pageProps, ...data };
}


function MyApp({ Component, pageProps, currentUser }) {
  const toastRef = React.createRef();
  const router = useRouter();

  useEffect(() => {
    // Redirect to HTTPS if accessed via HTTP
    if (typeof window !== 'undefined' && window.location.protocol === 'http:') {
      window.location.href = window.location.href.replace('http:', 'https:');
    }
  }, []);

  return (
    <ThemeProvider>
      <Toast ref={toastRef} />
      <Background />
      <div className="flex flex-column h-screen">
        <TopPanel currentUser={currentUser} />
        <div className="flex-grow-1 overflow-auto">
          <Component
            currentUser={currentUser}
            toastRef={toastRef}
            {...pageProps}
          />
        </div>
      </div>
    </ThemeProvider>
  )
}


export default MyApp
