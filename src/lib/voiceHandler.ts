import { OpenAIApi } from "openai";

declare global {
  interface Window {
    vad: {
      MicVAD: { new: (x: any) => any };
      utils: { encodeWAV: (audio: Float32Array) => string };
    };
  }
}

export async function getVoiceInput(api: OpenAIApi) {
  var xs = await window.vad.MicVAD.new({
    onSpeechStart: () => {
      console.info("Speech start detected");
    },
    onSpeechEnd: async (floatArr) => {
      console.log("Speech end detected");
      const wavfile = new File(
        [window.vad.utils.encodeWAV(floatArr)],
        `input.wav`
      );
      xs.pause();
      let a = await api.createTranscription(
        wavfile,
        "whisper-1",
        "extract ingredients for recipe preparation",
        "text"
      );
      console.log("text", a);
      return a;
    },
  }).catch((err) => {
    console.error(err);
  });
  xs.start();
}
