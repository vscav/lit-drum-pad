export default function webAudioTouchUnlock(context: AudioContext) {
  return new Promise<boolean>((resolve, reject) => {
    if (!context || !(context instanceof (window.AudioContext as any))) {
      reject(
        "WebAudioTouchUnlock: You need to pass an instance of AudioContext to this method call."
      );
      return;
    }

    if (context.state === "suspended" && "ontouchstart" in window) {
      const unlock = () => {
        context.resume().then(
          () => {
            document.body.removeEventListener("touchstart", unlock);
            document.body.removeEventListener("touchend", unlock);

            resolve(true);
          },
          reason => {
            reject(reason);
          }
        );
      };

      document.body.addEventListener("touchstart", unlock, false);
      document.body.addEventListener("touchend", unlock, false);
    } else {
      resolve(false);
    }
  });
}
