import React from 'react';
import Router from 'next/router';
import { Button } from 'primereact/button';
import ThemeChanger from './theme-changer';

const TopPanel = ({ currentUser }) => {

  const buttonClassName = "p-button-text m-1 custom-hover-effect";

  return (
    <nav className="flex flex-wrap align-items-center justify-content-between shadow-3">
      <div className="flex items-center">
        <Button className={buttonClassName}
          icon="pi pi-home"
          tooltip="Home"
          tooltipOptions={{ showDelay: 500, hideDelay: 150 }}
          onClick={() => Router.push('/')}
        />
        <Button className={buttonClassName}
          icon="pi pi-shield"
          tooltip="Obfuscate your code"
          tooltipOptions={{ showDelay: 500, hideDelay: 150 }}
          onClick={() => Router.push('/obfuscate')}
        />
        <Button className={buttonClassName}
          icon="pi pi-envelope"
          tooltip="Contact us"
          tooltipOptions={{ showDelay: 500, hideDelay: 150 }}
          onClick={() => Router.push('/contact')}
        />
      </div>
      <div className="flex items-center">
        <ThemeChanger />
        {currentUser && (
          <Button className={buttonClassName}
            icon="pi pi-user"
            tooltip={`Logged in as ${currentUser.email}`}
            tooltipOptions={{ position: 'left', showDelay: 500, hideDelay: 150 }}
          />
        )}
        {currentUser ? (
          <Button className={buttonClassName}
            icon="pi pi-sign-out"
            onClick={() => Router.push('/auth/signout')}
            tooltip="Signout"
            tooltipOptions={{ position: 'left', showDelay: 500, hideDelay: 150 }}
          />
        ) : (
          <Button className={buttonClassName}
            icon="pi pi-sign-in"
            onClick={() => Router.push('/auth/signin')}
            tooltip="Signin"
            tooltipOptions={{ position: 'left', showDelay: 500, hideDelay: 150 }}
          />
        )}
      </div>
    </nav>
  );
};

export default TopPanel;
