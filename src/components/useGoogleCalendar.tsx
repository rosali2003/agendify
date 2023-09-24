import { GoogleLogin } from "react-google-login";
import axios from "axios";
import {useState, useEffect} from 'react';
import { OAuth2Client } from 'google-auth-library';
import { gapi } from 'gapi-script';
let token = "";
const client_id="567748474164-pa6hirvi6nmgdtmi5s0ccs3gma7n9vc3.apps.googleusercontent.com";
export const useGoogleCalendar = () => {
  
  const loginGoogleCalendar = () => {
    const handleLoginSuccess = (response) => {
      console.log("login success", response.profileObj);
      token = response.accessToken;
    };

    const handleLoginFailure = (response) => {
      console.log("login failure", response);
    };
    console.log("client id", client_id)
    return (
      <GoogleLogin
        clientId={client_id}
        buttonText="Sign in & Authorize Google Calendar"
        onSuccess={handleLoginSuccess}
        onFailure={handleLoginFailure}
        cookiePolicy={"single_host_origin"}
        isSignedIn={true}
        scope="https://www.googleapis.com/auth/calendar"
      />
    );
  };

const GoogleOAuth2 = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  gapi.client.init({
    apiKey: 'AIzaSyA3WFHVN5huMPOjHhFD_T-q8EhHXGRTCk0',
    clientId: client_id,
    cookiePolicy: 'single_host_origin',
    scope: 'https://www.googleapis.com/auth/calendar',
  });

  
  useEffect(() => {
    // Check if user is already authenticated
    if (gapi.auth2) {
      const auth2 = gapi.auth2.getAuthInstance();
      setIsAuthenticated(auth2.isSignedIn.get());
    }
  }, []);

  const handleSignIn = async () => {
    const auth2 = gapi.auth2.getAuthInstance();
    await auth2.signIn();
    setIsAuthenticated(true);
  };

  const handleSignOut = async () => {
    const auth2 = gapi.auth2.getAuthInstance();
    await auth2.signOut();
    setIsAuthenticated(false);
  };

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={handleSignOut}>Sign Out</button>
      ) : (
        <button onClick={handleSignIn}>Sign In with Google</button>
      )}
    </div>
  );
};


  // const loginGoogleCalendar = () => {
  //   console.log("logging to googlge")
  //   return(
  //     <>
  //     <div className="g-signin2" data-onsuccess="onSignIn"></div>
  //       <div
  //         id="g_id_onload"
  //         data-client_id="567748474164-pa6hirvi6nmgdtmi5s0ccs3gma7n9vc3.apps.googleusercontent.com"
  //         data-context="signin"
  //         data-ux_mode="popup"
  //         data-login_uri="http://localhost:3000"
  //         data-itp_support="true"
  //       ></div>

  //       <div
  //         className="g_id_signin"
  //         data-type="standard"
  //         data-shape="rectangular"
  //         data-theme="outline"
  //         data-text="signin_with"
  //         data-size="large"
  //         data-logo_alignment="left"
  //       ></div>
  //     </>
  //   );
  // };

  const createGoogleCalendarEvent = () => {
    console.log("entering createGoogleCalendarEvent");
    const event = {
      summary: "Meeting with John",
      start: {
        dateTime: "2023-09-14T09:00:00-07:00",
        timeZone: "America/Los_Angeles",
      },
      end: {
        dateTime: "2023-09-14T10:00:00-07:00",
        timeZone: "America/Los_Angeles",
      },
    };

    axios
      .post(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        event,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        console.log("Event created: ", response.data);
      })
      .catch((error) => {
        console.error("Error creating event: ", error);
      });
  };

  return { loginGoogleCalendar, createGoogleCalendarEvent, GoogleOAuth2 };
};
