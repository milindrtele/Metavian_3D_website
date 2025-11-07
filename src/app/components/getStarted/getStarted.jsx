import { useEffect, useState, useRef } from "react";
import styles from "./getStarted.module.css";
import { gsap } from "gsap";
import { div } from "three/examples/jsm/nodes/Nodes";

export default function GetStarted(props) {
  //const button = document.getElementById("button");
  const [animationCompletedObjects, setAnimationCompletedObjects] = useState(
    []
  );
  const allRef = useRef(null);
  const [areAnimationsCompleted, setAreAnimationsCompleted] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  const mapAllTextRef = useRef(null);
  const loopThroughElementsRef = useRef(null);

  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const res = await fetch("/api/me");
      const data = await res.json();

      if (data.authenticated) {
        console.log("Logged in user:", data.user);
        setUser(data.user);
        setIsLoggedIn(true);
        // redirect if needed
      } else {
        console.log("Not logged in");
        setIsLoggedIn(false);
      }
    }

    checkUser();
  }, []);

  useEffect(() => {
    // document.getElementById("input_1").style.position = "absolute";
    // document.getElementById("input_2").style.position = "absolute";
    mapAllTextRef.current = (callback) => {
      const textElement = document.getElementById("text-content");
      const text = textElement.textContent;
      const words = text.split(" ");

      textElement.innerHTML = words
        .map((word) => `<span>${word}</span>`)
        .join(" ");

      if (callback) {
        callback();
      }
    };

    function animateElements(element, random, bottom) {
      let position = { x: 0, y: bottom / 10 };
      gsap.to(position, {
        x: 0,
        y: 0,
        duration: 2.5,
        delay: random,
        ease: "bounce.out",
        onUpdate: () => {
          element.style.bottom = `${position.y}vh`;
        },
        onComplete: () => {
          setAnimationCompletedObjects((prevObjects) => [...prevObjects, true]);
        },
      });
    }

    function animateWords(element, random, bottom) {
      element.classList.add(styles.setInactive);
      let position = { x: 0, y: bottom / 10 };
      gsap.to(position, {
        x: 0,
        y: -70,
        duration: 2.5,
        delay: random,
        ease: "bounce.out",
        onUpdate: () => {
          element.style.bottom = `${position.y}vh`;
        },
        onComplete: () => {
          setAnimationCompletedObjects((prevObjects) => [...prevObjects, true]);
        },
      });
    }

    loopThroughElementsRef.current = () => {
      // Get all direct children of the right_container
      let rightContainerChildren = Array.from(
        document.getElementById("right_container").children
      );

      // Filter out the text-content element from rightContainerChildren
      rightContainerChildren = rightContainerChildren.filter(
        (element) => element.id !== "text-content"
      );

      // Get all <span> elements inside the text-content element
      const textContentSpans = Array.from(
        document.getElementById("text-content").querySelectorAll("span")
      );

      // Combine both arrays into one
      allRef.current = [...rightContainerChildren, ...textContentSpans];

      // Loop through all elements and apply animations
      textContentSpans.forEach((element) => {
        element.style.position = "relative";
        const computedStyle = window.getComputedStyle(element);
        const bottom = parseFloat(computedStyle.bottom); // || 1000; // Default to 0 if bottom is not set
        const random = Math.random();

        // setTimeout(() => {
        animateWords(element, random, bottom);
        // }, 2000);
      });
      // Loop through all elements and apply animations
      rightContainerChildren.forEach((element) => {
        const computedStyle = window.getComputedStyle(element);
        const bottom = parseFloat(computedStyle.bottom); // Default to 0 if bottom is not set
        const random = Math.random();

        // setTimeout(() => {
        animateElements(element, random, bottom);
        // }, 3000);
      });
    };

    //mapAllText(loopThroughElements);

    // button.addEventListener("click", animate);

    // return () => {
    //   button.removeEventListener("click", animate);
    // };
  }, []); // Empty dependency array ensures this effect runs only once when the component mounts

  useEffect(() => {
    if (
      allRef.current != null &&
      allRef.current.length == animationCompletedObjects.length
    ) {
      console.log("All animations completed");
      setAreAnimationsCompleted(true);
    }
  }, [animationCompletedObjects]);

  useEffect(() => {
    console.log(areAnimationsCompleted);
    if (areAnimationsCompleted) {
      props.continue();
    }
  }, [areAnimationsCompleted]);

  useEffect(() => {
    let rightContainerChildren = Array.from(
      document.getElementById("right_container").children
    );

    let delay = 200;
    rightContainerChildren.forEach((element) => {
      setTimeout(() => {
        element.classList.add(styles.translate_left);
      }, delay);
      delay = delay + 200;
    });
  }, []);




  // function submitClicked() {
  //   mapAllTextRef.current(loopThroughElementsRef.current);
  //   setIsButtonClicked(true);
  // }

  async function submitClicked(buttonType) {
    const name = document.getElementById("input_1")?.value;
    const email = document.getElementById("input_2")?.value;
    const password = document.getElementById("input_3")?.value;
    const phone = document.getElementById("input_4")?.value;
    let res;
    if (buttonType === "login") {
      res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    }
    else if (buttonType === "register") {
      res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });
    }
    else if (buttonType === "skip") {
      // just proceed
      mapAllTextRef.current(loopThroughElementsRef.current);
      setIsButtonClicked(true);
      return;
    }

    const data = await res.json();
    console.log(data);

    if (res.status === 200 || res.status === 201) {
      mapAllTextRef.current(loopThroughElementsRef.current);
      setIsButtonClicked(true);
    } else {
      alert(data.error || data.message || "Something went wrong");
    }
  }

  return (
    <div className={styles.get_started_container}>
      <div className={styles.right_container}>
        <div id="right_container" className={styles.right_containts}>
          <p
            className={[
              styles.title,
              styles.position_right,
              styles.animate,
            ].join(" ")}
          >
            Welcome to Metavian
          </p>
          <p
            className={[
              styles.text,
              styles.position_right,
              styles.animate,
            ].join(" ")}
            id="text-content"
          >
            A Venture into Infinite Possibilities in AR, VR, and Spatial
            Computing.
          </p>
          {isLoggedIn && user ? (<><div className={[
            styles.welcome_back_text,
            styles.position_right,
            styles.animate,
          ].join(" ")}>welcome back {user.name}</div>
            <button
              className={[
                styles.skip_button_style,
                styles.cssbuttons_io_button,
                styles.position_right,
                isButtonClicked ? styles.grey_out : "",
                styles.animate,
              ].join(" ")}
              onClick={() => {
                submitClicked("skip");
              }}
            >
              Continue
              <div className={styles.icon}>
                <svg
                  height="24"
                  width="24"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M0 0h24v24H0z" fill="none"></path>
                  <path
                    d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
            </button></>) :
            (<><input
              id="input_1"
              className={
                [
                  styles.name,
                  styles.inputs,
                  styles.input_1,
                  styles.position_right,
                  styles.animate,
                ].join(" ")}
              type="text"
              placeholder="Your Name / Username"
            />
              <input
                id="input_2"
                className={[
                  styles.email,
                  styles.inputs,
                  styles.input_2,
                  styles.position_right,
                  styles.animate,
                ].join(" ")}
                type="text"
                placeholder="Email"
              />
              <input
                id="input_3"
                className={[
                  styles.password,
                  styles.inputs,
                  styles.input_3,
                  styles.position_right,
                  styles.animate,
                ].join(" ")}
                type="password"
                placeholder="Password"
              />
              <input
                id="input_4"
                className={[
                  styles.phone,
                  styles.inputs,
                  styles.input_4,
                  styles.position_right,
                  styles.animate,
                ].join(" ")}
                type="tel"
                placeholder="Phone Number"
                pattern="^(\+91|0091|0|91)?[6-9]\d{9}$"
              />
              {/* <button
            id="button"
            className={[
              styles.get_started_button,
              styles.animate,
              styles.position_right,
              styles.animate,
            ].join(" ")}
            onClick={() => {
              submitClicked();
            }}
          >
            Get Started
          </button> */}
              {/* get started / login */}
              <button
                className={[
                  styles.get_started_button_style,
                  styles.cssbuttons_io_button,
                  styles.position_right,
                  isButtonClicked ? styles.grey_out : "",
                  styles.animate,
                ].join(" ")}
                onClick={() => { submitClicked("login") }}
              >
                Log in
                <div className={styles.icon}>
                  <svg
                    height="24"
                    width="24"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path
                      d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
              </button>

              {/* register new user */}
              <button
                className={[
                  styles.register_button_style,
                  styles.cssbuttons_io_button,
                  styles.position_right,
                  isButtonClicked ? styles.grey_out : "",
                  styles.animate,
                ].join(" ")}
                onClick={() => { submitClicked("register") }}
              >
                Register new user
                <div className={styles.icon}>
                  <svg
                    height="24"
                    width="24"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path
                      d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
              </button>

              {/* skip */}
              <button
                className={[
                  styles.skip_button_style,
                  styles.cssbuttons_io_button,
                  styles.position_right,
                  isButtonClicked ? styles.grey_out : "",
                  styles.animate,
                ].join(" ")}
                onClick={() => {
                  submitClicked("skip");
                }}
              >
                Skip
                <div className={styles.icon}>
                  <svg
                    height="24"
                    width="24"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path
                      d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
              </button>

              {/* <button
            id="button"
            className={[
              styles.skip_button,
              styles.animate,
              styles.position_right,
              styles.animate,
            ].join(" ")}
            onClick={() => {
              submitClicked();
            }}
          >
            <p>Skip</p>
          </button> */}
            </>)}

        </div>
      </div>
    </div>
  );
}
