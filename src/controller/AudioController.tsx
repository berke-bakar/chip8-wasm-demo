export default function AudioController() {
  new Promise((res, rej) => {
    const aud = new Audio("/audio.mp3");

    aud.addEventListener("canplaythrough", (e) => {
      res(aud);
    });
  }).then((aud) => aud.play());

  return null;
}
