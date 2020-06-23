<template>
  <div class="machine">
    <h1>Machine component</h1>
    <div>
      <machine-button :pressed="playing" @click="pausePlay"
        >Play</machine-button
      >
      <machine-button @click="randomize">Random</machine-button>
      <machine-button @click="clearSteps">Clear</machine-button>
    </div>
    <led
      v-for="(step, i) in stepCount"
      :key="`stepCount-${i}`"
      :active="i == currentStep"
    ></led>
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
      <machine-button
        :pressed="mutes[i]"
        @click="mutes[i] = !mutes[i]"
        style="float: right;"
        >M</machine-button
      >
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import webAudioTouchUnlock from "@/helpers/webAudioTouchUnlock";
import Led from "@/components/Machine/Led/Led.vue";
import MachineButton from "@/components/Machine/MachineButton/MachineButton.vue";
import StepButton from "@/components/Machine/StepButton/StepButton.vue";

// Audio files dictionary
const afBuffers = new Map();
// Audio context
const audioContext = new AudioContext();

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
    Led,
    MachineButton,
    StepButton,
  },
})
export default class Machine extends Vue {
  private drums: Array<{ fileName: string }> = [];
  private stepCount = 24;
  private currentStep = 0;
  private mutes: Array<boolean> = [];
  private pattern: Array<Array<{ active: boolean }>> = [];
  private audioTime = 0;
  private tempo = 128;
  private playing = false;
  private secondsPerStep = 0;
  private lastScheduledTime = 0;
  private nextStepTime = 0;

  mounted() {
    if (!window.AudioContext) this.playing = false;
  }

  created() {
    this.readSoundsDirectory();

    this.feedPattern();

    // TEST (metro-boomin kit)
    this.pattern[0][0].active = true;
    this.pattern[0][14].active = true;
    this.pattern[2][0].active = true;
    this.pattern[2][1].active = true;
    this.pattern[2][2].active = true;
    this.pattern[2][3].active = true;
    this.pattern[2][4].active = true;
    this.pattern[2][5].active = true;
    this.pattern[2][6].active = true;
    this.pattern[2][7].active = true;
    this.pattern[2][8].active = true;
    this.pattern[2][9].active = true;
    this.pattern[2][12].active = true;
    this.pattern[2][13].active = true;
    this.pattern[2][14].active = true;
    this.pattern[2][16].active = true;
    this.pattern[2][17].active = true;
    this.pattern[2][18].active = true;
    this.pattern[2][19].active = true;
    this.pattern[2][20].active = true;
    this.pattern[2][21].active = true;
    this.pattern[2][22].active = true;
    this.pattern[2][23].active = true;
    this.pattern[3][9].active = true;
    this.pattern[3][11].active = true;
    this.pattern[3][15].active = true;
    this.pattern[6][12].active = true;
    this.pattern[6][14].active = true;
    this.pattern[7][7].active = true;
    this.pattern[7][8].active = true;
    this.pattern[7][10].active = true;
    this.pattern[7][17].active = true;
    this.pattern[7][18].active = true;

    webAudioTouchUnlock(audioContext).then(
      (unlocked: boolean) => {
        if (unlocked) {
          console.log(
            "AudioContext was unlocked from an explicit user action."
          );
        } else {
          console.log(
            "There was no need for unlocking devices (other than IOS)."
          );
        }
      },
      (reason: any) => {
        console.error(reason);
      }
    );
    this.updateAudioTime();
  }

  get drumsCount(): number {
    return this.drums.length;
  }

  public pausePlay(): void {
    this.playing = !this.playing;
    audioContext.createBufferSource().start(0, 0, 0.1);
  }

  public playSound(file: string, time: number): Promise<AudioBufferSourceNode> {
    file = require(`../../assets/sounds/metro-boomin/${file}`);

    return this.load(file).then((audioBuffer) => {
      const sourceNode = audioContext.createBufferSource();

      sourceNode.buffer = audioBuffer;
      sourceNode.connect(audioContext.destination);
      sourceNode.start(time);

      return sourceNode;
    });
  }

  public feedPattern(): void {
    for (let i = 0; i < this.drumsCount; i += 1) {
      this.pattern.push([]);
      this.mutes.push(false);
      for (let j = 0; j < this.stepCount; j += 1) {
        this.pattern[i].push({ active: false });
      }
    }
  }

  public readSoundsDirectory(): void {
    const filenames = require.context(
      "../../assets/sounds/metro-boomin",
      false,
      /\.wav$/
    );

    filenames.keys().forEach((filename) => {
      filename = filename.slice(2);
      this.drums.push({ fileName: filename });
    });
  }

  public async load(file: RequestInfo): Promise<AudioBuffer | null> {
    if (afBuffers.has(file)) {
      return afBuffers.get(file);
    }

    const _file = await fetch(file);
    const arrayBuffer = await _file.arrayBuffer();
    let audioBuffer;

    try {
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } catch (e) {
      audioBuffer = await this.decodeShim(arrayBuffer);
    }

    afBuffers.set(file, audioBuffer);

    return audioBuffer;
  }

  public decodeShim(arrayBuffer: ArrayBuffer): Promise<AudioBuffer | null> {
    return new Promise((resolve, reject) => {
      audioContext.decodeAudioData(
        arrayBuffer,
        (buffer) => {
          return resolve(buffer);
        },
        (err) => {
          return reject(err);
        }
      );
    });
  }

  public clearSteps(): void {
    for (let i = 0; i < this.pattern.length; i += 1) {
      for (let j = 0; j < this.pattern[i].length; j += 1) {
        this.pattern[i][j].active = false;
      }
    }
    for (let i = 0; i < this.mutes.length; i += 1) {
      this.mutes[i] = false;
    }
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
      const INCREMENT = 0.1;
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
              if (
                schedule > 0 &&
                schedule - this.audioTime < INCREMENT &&
                schedule > this.lastScheduledTime
              ) {
                this.playSound(this.drums[inst].fileName, schedule);
              }
            }
          }
        }
      }

      this.lastScheduledTime = this.audioTime + INCREMENT;
    }

    requestAnimationFrame(this.updateAudioTime);
  }
}
</script>

<style lang="scss"></style>
