import React, { useRef } from "react";
import axios from "axios";
import "./App.css";

axios.defaults.withCredentials = true; // Ensure credentials are included

function App() {
  const checkbox = useRef();
  const name = useRef();
  const email = useRef();
  const pass = useRef();
  const phoneNumber = useRef();

  const submitHandler = async () => {
    try {
      const response = await axios.post("http://localhost:3000/user/signUp", {
        name: name.current.value,
        email: email.current.value,
        password: pass.current.value,
        pNo: phoneNumber.current.value
      });
      console.log(response.data);
    } catch (error) {
      console.error("There was an error making the request:", error);
    }
  };

  const func = () => {
    if (checkbox.current.checked) {
      pass.current.type = "text";
    } else {
      pass.current.type = "password";
    }
  };

  return (
    <div id="container">
      <div id="minContainer">
        <h1>Sign Up</h1>
        <div id="inputBox">
          <input ref={name} type="text" placeholder="Enter Name" />
          <input ref={email} type="email" placeholder="Enter Email" />
          <input ref={pass} type="password" placeholder="Enter Password" />
          <div>
            <input onClick={func} ref={checkbox} type="checkbox" />
            <span>Show Password</span>
          </div>
          <input ref={phoneNumber} type="number" placeholder="Enter Phone Number" />
          <button onClick={submitHandler}>Submit</button>
        </div>
      </div>
    </div>
  );
}

export default App;
