import { useEffect, useRef } from "react";
import styles from "./diwali_wishes.module.css";

export default function DiwaliWishes(props) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 8,
        };
        this.alpha = 0.5;
        this.friction = 0.98; // Slightly slower for smoother trails
      }

      draw() {
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      update() {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
      }
    }

    class Firework {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = { x: 0, y: Math.random() * -2.5 - 0.5 };
        this.particles = [];
        this.lifespan = 180;
        this.hasExploded = false;
      }

      draw() {
        if (!this.hasExploded) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        }
      }

      explode() {
        for (let i = 0; i < 50; i++) {
          this.particles.push(new Particle(this.x, this.y, this.color));
        }
      }

      update() {
        this.lifespan--;
        if (this.lifespan <= 0 && !this.hasExploded) {
          this.explode();
          this.velocity = { x: 0, y: 0 };
          this.hasExploded = true;
        } else if (this.lifespan > 0) {
          this.y += this.velocity.y;
        }

        this.particles.forEach((p) => {
          p.update();
          p.draw();
        });
      }
    }

    let fireworks = [];
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Transparent canvas with trails
      ctx.globalCompositeOperation = "source-over"; // normal drawing
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"; // low alpha for fading trails
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = "lighter"; // for glowing fireworks

      // Update fireworks
      fireworks.forEach((firework, index) => {
        firework.update();
        firework.draw();

        if (
          firework.lifespan <= 0 &&
          firework.particles.every((p) => p.alpha <= 0)
        ) {
          fireworks.splice(index, 1);
        }
      });

      // Occasionally spawn new firework
      if (Math.random() < 0.02) {
        const x = Math.random() * canvas.width;
        const color = `hsl(${Math.random() * 360}, 80%, 60%)`;
        fireworks.push(new Firework(x, canvas.height, color));
      }
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      containerRef.current.classList.add(styles.add_opacity);
    }, 1000); // 0.1s delay
  }, []);

  return (
    <div
      className={styles.wishes_container}
      ref={containerRef}
      onClick={() => {
        props.close();
      }}
    >
      <canvas ref={canvasRef} className={[styles.fireworks].join(" ")}></canvas>
      {/* <p className={styles.text}>Happy Diwali from Metavian!!!</p> */}
      <div className={styles.happy_diwali}></div>
      <div className={styles.kandil}></div>
      <div className={styles.rangoli}></div>
    </div>
  );
}
