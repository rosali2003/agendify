import { GoogleLogin } from "react-google-login";
import axios from "axios";
import {useState, useEffect} from 'react';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';

let token = "";
const REACT_APP_CLIENT_ID="567748474164-pa6hirvi6nmgdtmi5s0ccs3gma7n9vc3.apps.googleusercontent.com";
export const useGoogleCalendar = () => {
  
  const loginGoogleCalendar = () => {
    const handleLoginSuccess = (response) => {
      console.log("login success", response.profileObj);
      token = response.accessToken;
    };

    const handleLoginFailure = (response) => {
      console.log("login failure", response);
    };
    console.log("client id", REACT_APP_CLIENT_ID)
    return (
      <GoogleLogin
        clientId={REACT_APP_CLIENT_ID}
        buttonText="Sign in & Authorize Google Calendar"
        onSuccess={handleLoginSuccess}
        onFailure={handleLoginFailure}
        cookiePolicy={"Cross-Origin-Opener-Policy"}
        isSignedIn={true}
        scope="https://www.googleapis.com/auth/calendar"
      />
    );
  };


const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const GoogleOAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const initializeOauth = async () => {
    let creds = null;
    const tokenPath = "token.json";
    const credentialsPath = 'credentials.json';

    if (fs.existsSync(tokenPath)) {
      const token = fs.readFileSync(tokenPath, 'utf8');
      creds = JSON.parse(token);
    }

    const { client_id, client_secret, redirect_uris } = JSON.parse(fs.readFileSync(credentialsPath, 'utf8')).installed;
    const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

    if (creds && oAuth2Client.isTokenValid(creds)) {
      setIsAuthenticated(true);
      return creds;
    } else {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
      window.location.href = authUrl;
    }
  };

  const getAccessToken = async (code) => {
    const { client_id, client_secret, redirect_uris } = JSON.parse(fs.readFileSync('credentials.json', 'utf8')).installed;
    const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);
    const { tokens } = await oAuth2Client.getToken(code);
    fs.writeFileSync('token.json', JSON.stringify(tokens));
    setIsAuthenticated(true);
    return tokens;
  };

  // Assuming the code will be in the URL query params after redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      getAccessToken(code);
    }
  }, []);
return (
    <div>
      { isAuthenticated ? (
          <div>Authenticated</div>
        ) : (
          <button onClick={initializeOauth}>Authenticate with Google</button>
        )
      }
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

  return { loginGoogleCalendar, createGoogleCalendarEvent, GoogleOAuth };
};
