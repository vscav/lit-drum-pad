<template>
  <div class="machine">
    <h1>Machine component</h1>
    <div>
      <machine-button :pressed="playing" @click="pausePlay"
        >Play</machine-button
      >
      <machine-button @click="randomize">Random</machine-button>
      <machine-button @click="clearSteps">Clear</machine-button>
      <machine-button
        v-for="(kit, i) in drumsKits"
        :key="i"
        :pressed="currentKit.name === kit"
        @click="loadKit(kit)"
        >{{ kit }}</machine-button
      >
      <machine-button :pressed="mute" @click="muteMaster"
        >Mute all</machine-button
      >
      <circle-slider
        v-model="tempo"
        :min="0"
        :max="220"
        :step-size="1"
        :side="60"
        :circle-width-rel="30"
        :progress-width-rel="15"
        :knob-radius-rel="8"
        circle-color="#cecece"
        progress-color="#575e63"
        knob-color="#575e63"
      ></circle-slider>
      <div>{{ tempo }}</div>
      <circle-slider
        v-model="dbfs"
        :min="-80"
        :max="0"
        :step-size="1"
        :side="60"
        :circle-width-rel="30"
        :progress-width-rel="15"
        :knob-radius-rel="8"
        circle-color="#cecece"
        progress-color="#575e63"
        knob-color="#575e63"
      ></circle-slider>
      <div>{{ dbfs }} db</div>
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
      <circle-slider
        v-model="volumes[i]"
        :min="-80"
        :max="0"
        :step-size="1"
        :side="35"
        :circle-width-rel="30"
        :progress-width-rel="15"
        :knob-radius-rel="8"
        circle-color="#cecece"
        progress-color="#575e63"
        knob-color="#575e63"
      ></circle-slider>
      <div>{{ volumes[i] }} db</div>
      <machine-button :pressed="mutes[i]" @click="muteTrack(i)"
        >M</machine-button
      >
      <machine-button :pressed="solos[i]" @click="soloTrack(i)"
        >S</machine-button
      >
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import webAudioTouchUnlock from "@/webAudioTouchUnlock";
import Led from "@/components/Machine/Led/Led.vue";
import MachineButton from "@/components/Machine/MachineButton/MachineButton.vue";
import StepButton from "@/components/Machine/StepButton/StepButton.vue";

interface KitObject {
  [char: string]: string;
}

const afBuffers = new Map();

const audioContext = new AudioContext();

const bufferSize = 2 * audioContext.sampleRate;

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
  private solos: Array<boolean> = [];
  private volumes: Array<number> = [];
  private pattern: Array<Array<{ active: boolean }>> = [];
  private audioTime = 0;
  private tempo = 105;
  private playing = false;
  private mute = false;
  private dbfs = -3;
  private secondsPerStep = 0;
  private lastScheduledTime = 0;
  private nextStepTime = 0;
  private drumsKits: KitObject = {
    "metro-boomin": "Metro Boomin",
    "murda-beatz": "Murda Beatz",
    "pierre-bourne": "Pierre Bourne",
    "travis-scott": "Travis Scott",
  };
  private currentKit: KitObject = {
    name: "Metro Boomin",
    directory: "metro-boomin",
  };

  mounted() {
    if (!window.AudioContext) this.playing = false;
  }

  created() {
    this.readSoundsDirectory(this.currentKit.directory);

    this.setDefaultPattern(false);
    this.setDefaultAudioStates(false);
    this.setDefaultVolumes(this.dbfs);

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
  }

  get drumsCount(): number {
    return this.drums.length;
  }

  get mutedTracks(): number {
    let count = 0;
    if (this.mutes.length) {
      this.mutes.forEach((drum) => {
        if (drum === true) count++;
      });
      return count;
    } else return -1;
  }

  public setDefaultPattern(state: boolean): void {
    //if (this.pattern.length > 0) this.pattern.splice(0, this.pattern.length);
    for (let i = 0; i < this.drumsCount; i++) {
      this.pattern.push([]);
      for (let j = 0; j < this.stepCount; j++) {
        this.pattern[i].push({ active: state });
      }
    }
  }

  public setDefaultAudioStates(state: boolean): void {
    for (let i = 0; i < this.drumsCount; i++) {
      this.mutes[i] = false;
      this.solos[i] = false;
    }
  }

  public setDefaultVolumes(volume: number): void {
    for (let i = 0; i < this.drumsCount; i++) {
      this.volumes[i] = volume;
    }
  }

  public DBFSToGain(dbfs: number): number {
    return Math.pow(10, dbfs / 20);
  }

  public getFolderNameByKitName(
    drumsKit: KitObject,
    kitName: string
  ): string | undefined {
    return Object.keys(drumsKit).find((key) => drumsKit[key] === kitName);
  }

  public pausePlay(): void {
    this.playing = !this.playing;

    if (this.playing) {
      audioContext.resume();
      this.updateAudioTime();
    } else audioContext.suspend();
  }

  public muteMaster(): void {
    this.mute = !this.mute;

    if (!this.solos.every((val, i, arr) => val === arr[0])) {
      for (let i = 0; i < this.solos.length; i++) {
        if (this.solos[i] === true) this.mutes[i] = this.mute ? true : false;
      }
    } else {
      if (this.mutes.length) this.mutes.splice(0, this.mutes.length);
      for (let i = 0; i < this.drumsCount; i++) {
        this.mutes.push(this.mute ? true : false);
      }
    }
  }

  public muteTrack(index: number): void {
    this.mutes[index] = !this.mutes[index];
    const mutedTracks = this.mutedTracks;
    if (this.mutedTracks !== this.drums.length) this.mute = false;
  }

  public soloTrack(index: number): void {
    this.solos[index] = !this.solos[index];
    if (this.mutes[index] === true) this.mutes[index] = false;
    this.updateTracksState();
  }

  public updateTracksState(): void {
    if (!this.solos.every((val, i, arr) => val === arr[0])) {
      for (let i = 0; i < this.solos.length; i++) {
        if (this.solos[i] === false) this.mutes[i] = true;
      }
    } else {
      for (let i = 0; i < this.mutes.length; i++) {
        this.mutes[i] = this.solos[i];
      }
    }
  }

  public playSound(
    file: string,
    directory: string = this.currentKit.directory,
    volume = -3,
    time = 0
  ): Promise<AudioBufferSourceNode> {
    file = require(`../../assets/sounds/${directory}/${file}`);
    return this.load(file).then((audioBuffer) => {
      const sourceNode = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.setValueAtTime(
        this.DBFSToGain(this.dbfs) * this.DBFSToGain(volume),
        audioContext.currentTime
      );
      sourceNode.start(time);

      return sourceNode;
    });
  }

  public readSoundsDirectory(directoryName: string): void {
    let filenames: __WebpackModuleApi.RequireContext | undefined;
    switch (directoryName) {
      case "metro-boomin":
        filenames = require.context(
          "../../assets/sounds/metro-boomin",
          false,
          /\.wav$/
        );
        break;
      case "murda-beatz":
        filenames = require.context(
          "../../assets/sounds/murda-beatz",
          false,
          /\.wav$/
        );
        break;
      case "pierre-bourne":
        filenames = require.context(
          "../../assets/sounds/pierre-bourne",
          false,
          /\.wav$/
        );
        break;
      case "travis-scott":
        filenames = require.context(
          "../../assets/sounds/travis-scott",
          false,
          /\.wav$/
        );
        break;
    }
    if (this.drums.length) this.drums.splice(0, this.drums.length);
    if (filenames !== undefined)
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

  public loadKit(kit: string): void {
    const key = this.getFolderNameByKitName(this.drumsKits, kit);

    if (kit && key) {
      this.currentKit.name = kit;
      this.currentKit.directory = key;
    }

    this.readSoundsDirectory(this.currentKit.directory);
    this.setDefaultPattern(false);
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

  public randomize() {
    for (let i = 0; i < this.pattern.length; i++) {
      for (let j = 0; j < this.pattern[i].length; j++) {
        this.pattern[i][j].active = Math.random() > 0.5;
      }
    }
  }

  public clearSteps(): void {
    for (let i = 0; i < this.pattern.length; i++) {
      for (let j = 0; j < this.pattern[i].length; j++) {
        this.pattern[i][j].active = false;
      }
    }

    for (let i = 0; i < this.mutes.length; i++) {
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

      let i = 0;
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
                this.playSound(
                  this.drums[inst].fileName,
                  this.currentKit.directory,
                  this.volumes[i],
                  schedule
                );
              }
            }
          }
        }
        i++;
      }

      this.lastScheduledTime = this.audioTime + INCREMENT;
    }

    requestAnimationFrame(this.updateAudioTime);
  }
}
</script>

<style lang="scss"></style>
