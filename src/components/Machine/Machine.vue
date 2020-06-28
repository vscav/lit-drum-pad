<template>
  <div class="machine">
    <topbar
      :options="drumsKits"
      @load="loadKit"
      @randomize="randomize"
      @clear-steps="clearSteps"
      @restart="restart"
    />
    <div class="board">
      <div class="row dark-grey">
        <led
          v-for="(step, i) in stepCount"
          :key="`stepCount-${i}`"
          :active="i == currentStep"
        ></led>
      </div>
      <div v-for="(drum, i) in drums" :key="i" class="row grey">
        <step-button
          v-for="(step, j) in stepCount"
          :key="`drumCount-${j}`"
          :file="drum.fileName"
          :value="pattern[i][j].active"
          :highlight="currentStep == j"
          :row="i"
          @click="(val) => (pattern[i][j].active = val)"
          @mouse-enter="playSound"
        ></step-button>
      </div>
    </div>
    <mix-table :drums="drums" :tracksStates="tracksStates" />
    <bottombar
      :playing="playing"
      :dbfs="dbfs"
      :tempo="tempo"
      :mute="mute"
      @mute-master="muteMaster"
      @tempo-changed="updateTempo"
      @volume-changed="updateDbfs"
      @pause-play="pausePlay"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";

import webAudioTouchUnlock from "@/helpers/webAudioTouchUnlock";

import Bottombar from "@/components/Machine/Bottombar/Bottombar.vue";
import Led from "@/components/Machine/Led/Led.vue";
import MixTable from "@/components/Machine/MixTable/MixTable.vue";
import StepButton from "@/components/Machine/StepButton/StepButton.vue";
import Topbar from "@/components/Machine/Topbar/Topbar.vue";

import { KitObject, TrackStateObject } from "@/types";

const afBuffers = new Map();

const audioContext = new AudioContext();

const bufferSize = 2 * audioContext.sampleRate;

@Component({
  components: {
    Bottombar,
    Led,
    MixTable,
    StepButton,
    Topbar,
  },
})
export default class Machine extends Vue {
  // private componentKey = 0;
  private playing = false;
  private tempo = 105;
  private dbfs = -3;
  private mute = false;
  private stepCount = 24;
  private currentStep = 0;
  private audioTime = 0;
  private secondsPerStep = 0;
  private lastScheduledTime = 0;
  private nextStepTime = 0;
  private drums: Array<{ fileName: string }> = [];
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
  private tracksStates: Array<TrackStateObject> = [];
  private previousTracksStates: Array<TrackStateObject> = [];
  private pattern: Array<Array<{ active: boolean }>> = [];
  private mouseIsPressed = false;

  mounted() {
    if (!window.AudioContext) this.playing = false;
  }

  created() {
    this.readSoundsDirectory(this.currentKit.directory);
    this.setDefaultTracksStates(false, false, this.dbfs);
    this.setDefaultPattern(false);

    this.previousTracksStates = JSON.parse(JSON.stringify(this.tracksStates));

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

  @Watch("tracksStates", { deep: true })
  public tracksStatesChanged(after) {
    after.filter((p, index) => {
      Object.keys(p).some((prop) => {
        if (
          prop === "solo" &&
          p[prop] !== this.previousTracksStates[index][prop]
        ) {
          this.soloTrack(index);
        }
      });
    });
    this.previousTracksStates = JSON.parse(JSON.stringify(after));
  }

  get drumsCount(): number {
    return this.drums.length;
  }

  get mutedTracks(): number {
    let count = 0;
    if (this.tracksStates.length) {
      this.tracksStates.forEach((drum) => {
        if (drum.mute === true) count++;
      });
      return count;
    } else return -1;
  }

  public getFolderNameByKitName(
    drumsKit: KitObject,
    kitName: string
  ): string | undefined {
    return Object.keys(drumsKit).find((key) => drumsKit[key] === kitName);
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

  public setDefaultPattern(state: boolean): void {
    if (this.pattern.length) this.pattern.splice(0, this.pattern.length);
    for (let i = 0; i < this.drumsCount; i++) {
      this.pattern.push([]);
      for (let j = 0; j < this.stepCount; j++) {
        this.pattern[i].push({ active: state });
      }
    }
  }

  public setDefaultTracksStates(
    mute: boolean,
    solo: boolean,
    volume: number
  ): void {
    for (let i = 0; i < this.drumsCount; i++) {
      this.tracksStates.push({
        mute: mute,
        solo: solo,
        volume: volume,
      });
    }
  }

  public DBFSToGain(dbfs: number): number {
    return Math.pow(10, dbfs / 20);
  }

  public pausePlay(): void {
    this.playing = !this.playing;

    if (this.playing) {
      audioContext.resume();
      this.updateAudioTime();
    } else audioContext.suspend();
  }

  public restart(): void {
    console.log("restart not available");
    // if (audioContext.state === "running") audioContext.suspend();
    // this.$emit("restart");
  }

  public muteMaster(): void {
    this.mute = !this.mute;

    if (!this.tracksStates.every((obj, i, arr) => obj.solo === arr[0].solo)) {
      for (let i = 0; i < this.tracksStates.length; i++) {
        if (this.tracksStates[i].solo === true)
          this.tracksStates[i].mute = this.mute ? true : false;
      }
    } else {
      this.tracksStates.forEach((track) => {
        track.mute = this.mute ? true : false;
      });
    }
  }

  public soloTrack(index: number): void {
    if (this.tracksStates[index].mute === true) {
      this.tracksStates[index].mute = false;
    }

    this.updateTracksStatesOnAction();
  }

  public randomize() {
    for (let i = 0; i < this.pattern.length; i++) {
      for (let j = 0; j < this.pattern[i].length; j++) {
        this.pattern[i][j].active = Math.random() > 0.75;
      }
    }
  }

  public clearSteps(): void {
    for (let i = 0; i < this.pattern.length; i++) {
      for (let j = 0; j < this.pattern[i].length; j++) {
        this.pattern[i][j].active = false;
      }
    }

    for (let i = 0; i < this.tracksStates.length; i++) {
      this.tracksStates[i].mute = false;
    }
  }

  public updatePattern(state: boolean): void {
    if (this.drumsCount > this.pattern.length) {
      const rowToAdd = this.drumsCount - this.pattern.length;
      for (let i = 0; i < rowToAdd; i++) {
        const last = this.pattern.push([]);
        for (let j = 0; j < this.stepCount; j++) {
          this.pattern[last - 1].push({ active: state });
        }
      }
    } else if (this.drumsCount < this.pattern.length) {
      const rowToDelete = this.pattern.length - this.drumsCount;
      for (let i = 0; i < rowToDelete; i++) {
        this.pattern.pop();
      }
    }
  }

  public updateTracksStatesOnChange(state: boolean, volume = -3): void {
    if (this.drumsCount > this.tracksStates.length) {
      const rowToAdd = this.drumsCount - this.tracksStates.length;
      for (let i = 0; i < rowToAdd; i++) {
        this.tracksStates.push({
          mute: state,
          solo: state,
          volume: volume,
        });
      }
    } else if (this.drumsCount < this.tracksStates.length) {
      const rowToDelete = this.tracksStates.length - this.drumsCount;
      for (let i = 0; i < rowToDelete; i++) {
        this.tracksStates.pop();
      }
    }
    this.previousTracksStates = JSON.parse(JSON.stringify(this.tracksStates));
  }

  public updateTracksStatesOnAction(): void {
    if (!this.tracksStates.every((obj, i, arr) => obj.solo === arr[0].solo)) {
      for (let i = 0; i < this.tracksStates.length; i++) {
        if (this.tracksStates[i].solo === false)
          this.tracksStates[i].mute = true;
      }
    } else {
      for (let i = 0; i < this.tracksStates.length; i++) {
        this.tracksStates[i].mute = this.tracksStates[i].solo;
      }
    }
  }

  public updateTempo(newTempo: number): void {
    this.tempo = newTempo;
  }

  public updateDbfs(newDbfs: number): void {
    this.dbfs = newDbfs;
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
        if (!this.tracksStates[inst].mute) {
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
                  this.tracksStates[i].volume,
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

    this.updatePattern(false);
    this.updateTracksStatesOnChange(false);
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
    if (this.drumsCount) this.drums.splice(0, this.drumsCount);
    if (filenames !== undefined)
      filenames.keys().forEach((filename) => {
        filename = filename.slice(2);
        this.drums.push({ fileName: filename });
      });
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
}
</script>

<style lang="scss">
@import "@/scss/_colors.scss";

.board {
  height: calc(100vh - (90px + 60px));
  margin-top: 60px;
  margin-bottom: 90px;
  margin-right: 200px;
  overflow: scroll;

  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  &::-webkit-scrollbar-track {
    background: $dark-grey;
  }
  &::-webkit-scrollbar-thumb {
    background: $green;
    border-radius: 25px;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
  }

  .row {
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: nowrap;
    width: min-content;

    &.dark-grey {
      background: $dark-grey;
    }

    &.grey {
      background: $light-grey;
    }
  }
}
</style>
