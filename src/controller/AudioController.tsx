export default function AudioController() {
  new Promise((res) => {
    const aud = new Audio("/audio.mp3");

    aud.addEventListener("canplaythrough", () => {
      res(aud);
    });
  }).then((aud) => (aud as HTMLAudioElement).play());

  return null;
}
