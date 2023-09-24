import { useState, useEffect, ChangeEvent, FormEvent, useRef } from "react";
import { TodoCard } from "./TodoCard";
import styles from "./Mainpage.module.css";
import React from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useOpenAIApi } from "./useOpenAIApi";
import { initializeApp } from "firebase/app";
import { collection, getDocs, addDoc, getFirestore } from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useGoogleCalendar } from "./useGoogleCalendar";
import Button from "./Button";
import { gapi } from "gapi-script";
import jwt_decode from "jwt-decode";
declare var google: any;
// var accessToken = "";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();


const auth = getAuth();
const handleLogin = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      // IdP data available using getAdditionalUserInfo(result)
      // ...
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
};

// Set up a listener for the auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, redirect to the desired page
    window.location.href = "localhost:3001";
  } else {
    // User is not signed in
  }
});

const csrfToken = Cookies.get("CSRF-TOKEN");

axios.defaults.headers.common["X-CSRF-Token"] = csrfToken;

const Mainpage = () => {
  const [tasks, setTasks] = useState([]);

  const api = axios.create();

  // const accessTokenRef = useRef<string|null>(null)
  const [newTask, setNewTask] = useState<string>("");

  const [generatedIdea, setGeneratedIdea] = useState<string>("");

  const { loginGoogleCalendar } = useGoogleCalendar();
  // const fetchGenerated = async () => {
  //   console.log("entering");
  //   try {
  //     const response = await api.post(
  //       "http://localhost:3000/pages/ai_request",
  //       {
  //         ai_request: {
  //           prompt: "create list of tasks",
  //           ai_model: "ada",
  //         },
  //       }
  //     );
  //     console.log("generated text", response.data.generated_idea);
  //     setGeneratedIdea(response.data.generated_idea);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // function handleCallbackResponse(response) {
  //   console.log("Encoded JWT ID token: " + response.credential);
  //   var userObject = jwt_decode(response.credential);
  //   console.log({ response });
  //   console.log("userObject", userObject);
  //   const client = google.accounts.oauth2.initTokenClient({
  //     client_id:
  //       "567748474164-pa6hirvi6nmgdtmi5s0ccs3gma7n9vc3.apps.googleusercontent.com",
  //     scope: "https://www.googleapis.com/auth/calendar.readonly",
  //     callback: (response) => {
  //       // alert(`cali or bust: ${JSON.stringify(response)}`);
  //       console.log({response, "AHHH":true})
  //       accessTokenRef.current = response.access_token;
  //     },
  //   });
  //   client.requestAccessToken();
  // }

  // useEffect(() => {
  //   /* global google */
  //   google.accounts.id.initialize({
  //     client_id:
  //       "567748474164-pa6hirvi6nmgdtmi5s0ccs3gma7n9vc3.apps.googleusercontent.com",
  //     scope: "email profile https://www.googleapis.com/auth/calendar.events",
  //     callback: handleCallbackResponse,
  //   });

  //   google.accounts.id.renderButton(document.getElementById("auth"), {
  //     theme: "outline",
  //     size: "large",
  //   });
  // }, []);

  // const createCalendarEvent = async () => {
  //   console.log("access token in createCalendarEvent", accessTokenRef.current)
  //   // Define the calendar event
  //   console.log("creating calendar event");
  //   const event = {
  //     'summary': "test event",
  //     "description": "test event description",
  //     "start": {
  //       "dateTime": "2023-10-10T09:00:00-07:00",
  //       "timeZone": Intl.DateTimeFormat().resolvedOptions().timeZone,
  //     },
  //     "end": {
  //       "dateTime": "2023-11-10T09:00:00-07:00",
  //       "timeZone": Intl.DateTimeFormat().resolvedOptions().timeZone,
  //     },
  //   }
  //   await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
  //     method: "POST",
  //     headers: {
  //       'Authorization': `Bearer ${accessTokenRef.current}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(event),
  //   }).then((data) => {
  //     return data.json();
  //   }).then((data) => {
  //     console.log(data);
  //     alert(data.toString())
  //     console.log("return data", data.toString())
  //   })
  // };

  const fetchTasks = async () => {
    const allTasks = [];
    const querySnapshot = await getDocs(collection(db, "tasks"));
    querySnapshot.forEach((task) => {
      // console.log("tasks.id", task.id);
      // console.log("task.data()", task.data())
      allTasks.push(task.data());
    });

    setTasks(allTasks);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  //create a new task
  const createTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTask.length === 0) return;
    const id = tasks[tasks.length - 1].id + 1;

    const data = {
      id,
      message: newTask,
      completed: false,
    };

    setTasks((prevTasks) => [...prevTasks, data]);

    await addDoc(collection(db, "tasks"), data);
    setNewTask("");
  };

  return (
    <section className={styles["mainpage-body"]}>
      <div className={styles["navbar"]}>
        <img
          width="80px"
          src="./agendify-logo-yellow.png"
          alt="agendify logo"
        />
      </div>
      <div className={styles["widgets-container"]}>
        <div>
          <form data-testid="task-form" onSubmit={createTask}>
            <input
              type="text"
              className="task-input"
              data-testid="task-input"
              value={newTask}
              onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                setNewTask(event.target.value);
              }}
            />
            <button type="submit">Create Task</button>
          </form>
          <div className="col-md-4">
            {tasks.map((task, index) => (
              <TodoCard
                key={index}
                id={task.id}
                message={task.message}
                completed={task.completed}
                tasks={tasks}
                setTasks={setTasks}
              />
            ))}
          </div>
        </div>
        {/* <section className={styles["quote-container"]}>
          <button onClick={fetchGenerated}>Quote of the day</button>
          <p>{generatedIdea}</p>
        </section> */}
        <div id="auth"></div>
      </div>
      {/* <button onClick={createCalendarEvent}>create calendar event</button> */}
    </section>
  );
};

export default Mainpage;
//add tests,
