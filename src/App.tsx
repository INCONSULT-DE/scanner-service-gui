import React, { useState } from 'react';
import Login from './sections/Login';
import ApplicationOverview from './sections/ApplicationOverview';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { ThemeProvider, loadTheme } from '@fluentui/react';
import theme from './theme';

initializeIcons();

export const App: React.FunctionComponent = () => {
  const [token, setToken] = useState<string>();
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [timedOut, setTimedOut] = useState<boolean>(false);

  const state = {
    loggedIn: false,
    token: "",
    timedOut: false,
  };
  loadTheme(theme);

  function timedOutSession() {
    setToken("");
    setLoggedIn(false);
    setTimedOut(true);
  }

  function loggedOut() {
    setToken("");
    setLoggedIn(false);
    setTimedOut(false);
  }

  // if the state token is not set 
  if (!token) {
    // check if there is one in the session storage
    const authToken = window.sessionStorage.getItem("similarity_auth_token");
    // if the session has an storage
    if (authToken) {
      setToken(authToken);
      setLoggedIn(true);
    }
  }

  return (
    <div style={{ height: "100%" }}>
      <ThemeProvider theme={theme} style={{ height: "100%" }}>
        {loggedIn ?
          <ApplicationOverview timedOutSession={() => timedOutSession()} token={token} loggedOut={() => loggedOut()} style={{ height: "100%" }} />
          :
          <Login timedOut={timedOut} loginSucceded={(token: string) => { setToken(token); setLoggedIn(true); }} />
        }
      </ThemeProvider>
    </div>
  );
};
