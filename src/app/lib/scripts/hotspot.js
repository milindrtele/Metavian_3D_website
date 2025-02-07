// import * as THREE from "three";
// import {
//   CSS3DRenderer,
//   CSS3DObject,
// } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

class Hotspot {
  constructor(
    cssScene,
    position,
    childHtmlUrl,
    buttonTextContent,
    stemHeight,
    buttonWidth,
    angle,
    flagPosition,
    callbackFunction,
    videoEmbedFunction,
    videoID,
    webURL
  ) {
    this.cssScene = cssScene;
    this.container_div = null;
    this.iframe = null;
    this.css2dObject = null;
    this.position = position;
    this.childHtmlUrl = childHtmlUrl;

    this.child = null;
    this.buttonTextContent = buttonTextContent;
    this.stemHeight = stemHeight;
    this.buttonWidth = buttonWidth;
    this.angle = angle;
    this.flagPosition = flagPosition;

    this.callbackFunction = callbackFunction;

    this.videoEmbedFunction = videoEmbedFunction;
    this.videoID = videoID || null;
    this.webURL = webURL || null;

    this.init();
  }

  init() {
    this.css2dObjectReady = new Promise((resolve, reject) => {
      this.container_div = document.createElement("div");
      this.container_div.style.width = "max-content";
      this.container_div.style.height = "max-content";
      this.container_div.style.pointerEvents = "none";
      this.container_div.style.position = "fixed";
      this.container_div.style.zIndex = 1000;

      // Fetch HTML content from a separate file and add it to the child element
      fetch(this.childHtmlUrl)
        .then((response) => response.text())
        .then((data) => {
          this.child = document.createElement("div");
          this.child.style.width = "max-content";
          this.child.style.height = "max-content";
          this.child.style.background = "0xffffff00";
          this.child.style.pointerEvents = "none";

          this.child.innerHTML = String(data);
          this.container_div.appendChild(this.child);

          this.css2dObject = new CSS2DObject(this.container_div);
          this.css2dObject.position.set(
            this.position.x,
            this.position.y,
            this.position.z
          );
          this.css2dObject.center.set(0, 0);
          this.css2dObject.rotation.set(0, (Math.PI / 180) * 214.48, 0);
          this.css2dObject.scale.set(0.1, 0.1, 0.1);

          this.detectCenter(this.child, this.stemHeight, this.buttonWidth);
          this.positionStemAndFlag(this.child);

          if (this.videoID != null || this.webURL != null) {
            this.addEventListnerToChild(this.child);
          }

          resolve(); // Signal that the css2dObject is ready
        })
        .catch((error) => {
          console.error("Error loading HTML content:", error);
          reject(error);
        });
    });
  }

  addEventListnerToChild(child) {
    const flag = child.querySelector("#button_closed");
    flag.style.pointerEvents = "auto";
    flag.addEventListener("click", () => {
      //console.log("entered event");
      // this.callbackFunction();
      if (this.videoID != null) {
        this.videoEmbedFunction(this.videoID); //"esWJ3uXxZaY"
      } else if (this.webURL != null) {
        window.open(this.webURL, "_blank");
      }
    });
  }

  positionStemAndFlag(child) {
    if (this.angle) {
      const stem = child.querySelector("#point");
      stem.style.transform = `rotate(${this.angle}deg)`;

      const button_bar = child.querySelector("#button_bar");
      const angleInRadiansForSin = Math.abs(this.angle * (Math.PI / 180));
      const angleInRadiansForCos = Math.abs(this.angle * (Math.PI / 180));
      const widthToTranslate = Math.sin(angleInRadiansForSin) * this.stemHeight;
      const heightToTranslate =
        Math.cos(angleInRadiansForCos) * this.stemHeight;

      if (this.flagPosition == "end") {
        button_bar.style.transform = `translate(calc((${widthToTranslate}px + 100%) * -1), calc((${heightToTranslate}px - 100% + 12.5px) * -1))`;
      } else if (this.flagPosition == "start") {
        button_bar.style.transform = `translate(calc((${widthToTranslate}px - 5px)), calc((${heightToTranslate}px - 100% + 12.5px) * -1))`;
      }
    }
  }

  detectCenter(child, stemHeight, buttonWidth) {
    const checkPosition = () => {
      const rect = child.getBoundingClientRect();

      // Get viewport center
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;

      // Get the div's center position
      const divCenterX = rect.left + rect.width / 2;
      const divCenterY = rect.top + rect.height / 2;

      //Get the div's reference point (left edge)
      const leftEdge = rect.left;
      const topEdge = rect.top;

      // Define a threshold for how close to the center you want the div to be
      let threshold = 300; // Adjust this as needed

      if (window.innerWidth <= window.innerHeight) {
        threshold = 150; // Adjust this as needed
      } else {
        threshold = 300; // Adjust this as needed
      }

      if (
        Math.abs(viewportCenterX - leftEdge) <= threshold &&
        Math.abs(viewportCenterY - topEdge) <= threshold
      ) {
        // Modify the button's text content
        const point = this.child.querySelector("#point");
        if (point) {
          point.style.height = stemHeight + "px"; //"125px";
        }
        const button = this.child.querySelector("#button_closed");
        if (button) {
          if (window.innerWidth <= window.innerHeight) {
            button.style.width = (buttonWidth * 2) / 0.8 + "vw"; //"120px";
          } else {
            button.style.width = buttonWidth + "vw"; //"180px";
          }

          button.style.height = "25px";
        }
        const button_span = this.child.querySelector("#button_closed span");
        if (button_span) {
          button_span.textContent = this.buttonTextContent; // Change this to the desired text
        }
      } else {
        const point = this.child.querySelector("#point");
        if (point) {
          point.style.height = "3px";
        }
        const button = this.child.querySelector("#button_closed");
        if (button) {
          button.style.width = "0px";
          button.style.height = "0px";
        }
        const button_span = this.child.querySelector("#button_closed span");
        if (button_span) {
          // button_span.textContent = "+"; // Change this to the desired text
        }
      }

      // Call checkPosition on the next frame
      requestAnimationFrame(checkPosition);
    };

    // Start checking position in the next animation frame
    requestAnimationFrame(checkPosition);
  }

  async addToScene() {
    try {
      await this.css2dObjectReady; // Wait until css2dObject is created
      this.cssScene.add(this.css2dObject);
    } catch (error) {
      console.error("Failed to add to scene:", error);
    }
  }

  async removeFromScene() {
    await this.cssScene.remove(this.css2dObject);
  }

  hideiFrame() {
    if (this.container_div) {
      this.container_div.style.display = "none";
    }
  }

  showiFrame() {
    if (this.container_div) {
      this.container_div.style.display = "block";
    }
  }
}

export default Hotspot;
