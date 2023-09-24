import styles from "./TodoCard.module.css";
import axios from "axios";
import Button, { Colors } from "./Button";
import {getFirestore, doc, deleteDoc} from "firebase/firestore"
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { useGoogleCalendar } from "./useGoogleCalendar";
import { useEffect, useRef, useState } from "react";
import jwt_decode from "jwt-decode";
import { DateTimePicker } from 'react-datetime-picker';
declare var google: any;

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
interface TodoCardProps {
  id: number;
  message: string;
  completed: boolean;
  tasks: {
    id: number; message: string; completed: boolean 
}[];
  setTasks: React.Dispatch<
    React.SetStateAction<{ id: number; message: string; completed: boolean }[]>
  >;
}

export const TodoCard: React.FC<TodoCardProps> = ({
  id,
  message,
  completed,
  tasks,
  setTasks,
}) => {
  const accessTokenRef = useRef<string|null>(null)
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());

  // const { createGoogleCalendarEvent } = useGoogleCalendar();

  const handleDelete = async () => {
    tasks = tasks.filter((task) => task.id !== id);
    await deleteDoc(doc(db, "tasks", id.toString()));
    setTasks(tasks);
    console.log("deleted task id", id)
    console.log("tasks", tasks);
  };

  function handleCallbackResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    var userObject = jwt_decode(response.credential);
    console.log({ response });
    console.log("userObject", userObject);
    const client = google.accounts.oauth2.initTokenClient({
      client_id:
        "567748474164-pa6hirvi6nmgdtmi5s0ccs3gma7n9vc3.apps.googleusercontent.com",
      scope: "https://www.googleapis.com/auth/calendar.readonly",
      callback: (response) => {
        // alert(`cali or bust: ${JSON.stringify(response)}`);
        console.log({response, "AHHH":true})
        accessTokenRef.current = response.access_token;
      },
    });
    client.requestAccessToken();
  }

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id:
        "567748474164-pa6hirvi6nmgdtmi5s0ccs3gma7n9vc3.apps.googleusercontent.com",
      scope: "email profile https://www.googleapis.com/auth/calendar.events",
      callback: handleCallbackResponse,
    });

    google.accounts.id.renderButton(document.getElementById("auth"), {
      theme: "outline",
      size: "large",
    });
  }, []);

  const createCalendarEvent = async () => {
    console.log("access token in createCalendarEvent", accessTokenRef.current)
    // Define the calendar event
    console.log("creating calendar event");
    const event = {
      'summary': "test event",
      "description": "test event description",
      "start": {
        "dateTime": "2023-10-10T09:00:00-07:00",
        "timeZone": Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      "end": {
        "dateTime": "2023-11-10T09:00:00-07:00",
        "timeZone": Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    }
    await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${accessTokenRef.current}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      alert(data.toString())
      console.log("return data", data.toString())
    })
  };


  const handleCompleted = () => {
    if (completed === false) {
      completed = true;
    } else {
      completed = false;
    }
    console.log("completed", completed);

    const payload = {
      id,
      message,
      completed: true,
    };

    axios
      .put(`http://localhost:3000/tasks/${id}`, payload)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  return (
    <section className={styles["todo-body"]}>
      {message}
      <div>
        <label htmlFor="completed" className={styles["completed-label"]}>
          Completed:{" "}
        </label>
        <input
          type="checkbox"
          name="checkbox"
          value={completed.toString()}
          onChange={handleCompleted}
        ></input>
      </div>
      <Button color={Colors.Primary} onClick={handleDelete}>
        delete task
      </Button>
      <Button color={Colors.Secondary} onClick={createCalendarEvent}>
        Add to google calendar
      </Button>
    </section>
  );
};
