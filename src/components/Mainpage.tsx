import {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useCallback,
} from "react";
import { TodoCard } from "./TodoCard";
import styles from "./Mainpage.module.css";
import React from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useOpenAIApi } from "./useOpenAIApi";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  getFirestore,
  CollectionReference,
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useGoogleCalendar } from "./useGoogleCalendar";
import Button from "./Button";
import { gapi } from 'gapi-script';


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
const analytics = getAnalytics(app);

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

  const [newTask, setNewTask] = useState<string>("");

  const [generatedIdea, setGeneratedIdea] = useState<string>("");

  const { loginGoogleCalendar } = useGoogleCalendar();
  const fetchGenerated = async () => {
    console.log("entering");
    try {
      const response = await api.post(
        "http://localhost:3000/pages/ai_request",
        {
          ai_request: {
            prompt: "create list of tasks",
            ai_model: "ada",
          },
        }
      );
      console.log("generated text", response.data.generated_idea);
      setGeneratedIdea(response.data.generated_idea);
    } catch (error) {
      console.error(error);
    }
  };

  // useEffect(() => {
  //   window.google.accounts.id.initialize({
  //     client_id: process.env.REACT_APP_CLIENT_ID,
  //     callback: handleGoogleSignIn,
  //   })
  // });

  const handleGoogleSignIn = (response) => {
    console.log("login success")
  }

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
        <div className={styles["auth"]}>
         <div>{loginGoogleCalendar()}</div>
        </div>
      </div>
    </section>
  );
};

export default Mainpage;
//add tests,
