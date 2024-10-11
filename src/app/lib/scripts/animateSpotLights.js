export default function animateSpotLights(lights, progress) {
  // Reset all lights initially
  lights.forEach((element) => {
    element.intensity = 0;
  });

  // Update lights based on progress
  if (progress > 0.53) {
    lights[3].intensity = 3000;
  }
  if (progress > 0.48) {
    lights[2].intensity = 3000;
  }
  if (progress > 0.43) {
    lights[1].intensity = 3000;
  }
  if (progress > 0.38) {
    lights[0].intensity = 3000;
  }

  console.log(lights[0].intensity + "   " + progress);
}
