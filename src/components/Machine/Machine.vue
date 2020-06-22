<template>
  <div class="machine">
    <h1>Machine component</h1>
    <div v-for="(drum, i) in drums" :key="i">
      <step-button
        v-for="(step, j) in stepCount"
        :key="`drumCount-${j}`"
        :file="drum.fileName"
        :value="pattern[i][j].active"
        :highlight="currentStep == j"
        @input="(val) => (pattern[i][j].active = val)"
        @fire="playSound"
      ></step-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import StepButton from "@/components/Machine/StepButton/StepButton.vue";

const afBuffers = new Map();
const audioContext = new AudioContext();
// const isUnlocked = false;

const bufferSize = 2 * audioContext.sampleRate;
const noiseBuffer = audioContext.createBuffer(
  1,
  bufferSize,
  audioContext.sampleRate
);
const output = noiseBuffer.getChannelData(0);

for (let i = 0; i < bufferSize; i += 1) {
  output[i] = Math.random() * 2 - 1;
}

@Component({
  components: {
    StepButton,
  },
})
export default class Machine extends Vue {
  private drums: Array<{ fileName: string }> = [];
  private stepCount = 16;
  private currentStep = 0;
  private mutes: Array<boolean> = [];
  private pattern: Array<Array<{ active: boolean }>> = [];
  private audioTime = 0;
  private tempo = 130;
  private playing = true;
  private secondsPerStep = 0;
  private lastScheduledTime = 0;
  private nextStepTime = 0;

  mounted() {
    if (!window.AudioContext) this.playing = false;
  }

  created() {
    this.readSounds();

    for (let i = 0; i < this.drumsCount; i += 1) {
      this.pattern.push([]);
      this.mutes.push(false);
      for (let j = 0; j < this.stepCount; j += 1) {
        this.pattern[i].push({ active: false });
      }
    }

    // Set active to true on a certain step (to test)
    this.pattern[0][0].active = true;
    this.pattern[1][1].active = true;
    this.pattern[2][5].active = true;

    this.updateAudioTime();
  }

  get drumsCount() {
    return this.drums.length;
  }

  // public decodeShim(arraybuffer: ArrayBuffer): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     audioContext.decodeAudioData(
  //       arraybuffer,
  //       (buffer) => {
  //         return resolve(buffer);
  //       },
  //       (err) => {
  //         return reject(err);
  //       }
  //     );
  //   });
  // }

  public async load(file: RequestInfo): Promise<AudioBuffer> {
    if (afBuffers.has(file)) {
      return afBuffers.get(file);
    }
    const _file = await fetch(file);
    console.log(_file);
    const arraybuffer = await _file.arrayBuffer();
    const audiobuffer = await audioContext.decodeAudioData(arraybuffer);
    console.log(audiobuffer);
    afBuffers.set(file, audiobuffer);
    return audiobuffer;
  }

  public playSound(file: string) {
    file = require(`../../assets/sounds/${file}`);
    return this.load(file).then((audioBuffer) => {
      const sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(audioContext.destination);
      sourceNode.start();

      return sourceNode;
    });
  }

  public pausePlay(): void {
    this.playing = !this.playing;
  }

  public readSounds(): void {
    const filenames = require.context("../../assets/sounds", false, /\.wav$/);
    const files: { [char: string]: string } = {};
    filenames.keys().forEach((filename) => {
      filename = filename.slice(2);
      this.drums.push({ fileName: filename });
    });
    console.log(this.drums);
  }

  public getSchedule(step: number, currentTime: number): number {
    let stepTime =
      step * this.secondsPerStep +
      (currentTime - (currentTime % (this.secondsPerStep * this.stepCount)));
    if (stepTime < currentTime) {
      stepTime += this.secondsPerStep * this.stepCount;
    }
    return stepTime;
  }

  public updateAudioTime(): void {
    if (this.playing) {
      const LOOK_AHEAD = 0.1;
      this.secondsPerStep = 60 / this.tempo / 4;
      this.audioTime = audioContext.currentTime;
      this.currentStep = Math.floor(
        (this.audioTime / this.secondsPerStep) % this.stepCount
      );
      for (const inst in this.pattern) {
        if (!this.mutes[inst]) {
          for (const step in this.pattern[inst]) {
            if (this.pattern[inst][step].active) {
              const schedule = this.getSchedule(parseInt(step), this.audioTime);
              // console.log(schedule);
              // if (
              //   schedule > 0 &&
              //   schedule - this.audioTime < LOOK_AHEAD &&
              //   schedule > this.lastScheduledTime
              // ) {
              //   this.scheduleNote(this.instruments[inst], schedule);
              // }
            }
          }
        }
      }
      this.lastScheduledTime = this.audioTime + LOOK_AHEAD;
    }
    // Recursive
    requestAnimationFrame(this.updateAudioTime);
  }
}
</script>

<style></style>
