import { useEffect, useState, useRef } from "react";
import styles from "./getStarted.module.css";
import { gsap } from "gsap";

export default function GetStarted(props) {
  //const button = document.getElementById("button");
  const [animationCompletedObjects, setAnimationCompletedObjects] = useState(
    []
  );
  const allRef = useRef(null);
  const [areAnimationsCompleted, setAreAnimationsCompleted] = useState(false);

  const mapAllTextRef = useRef(null);
  const loopThroughElementsRef = useRef(null);

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

  function submitClicked() {
    mapAllTextRef.current(loopThroughElementsRef.current);
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
          <input
            id="input_1"
            className={[
              styles.name,
              styles.inputs,
              styles.input_1,
              styles.position_right,
              styles.animate,
            ].join(" ")}
            type="text"
            placeholder="Your Name"
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
          <button
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
          </button>
        </div>
      </div>
    </div>
  );
}
