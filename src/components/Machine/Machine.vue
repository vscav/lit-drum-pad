<template>
  <div class="machine">
    <modal v-show="isModalVisible" @close-modal="closeModal">
      <template v-slot:header>
        <h1>About.</h1>
      </template>

      <template v-slot:body>
        <div>Details about Lit Drum Pad.</div>
      </template>
    </modal>
    <topbar
      :kits="drumsKits"
      @load="loadKit"
      @randomize="randomize"
      @clear-steps="clearSteps"
      @show-modal="showModal"
    />
    <sequencer
      :stepCount="stepCount"
      :currentStep="currentStep"
      :drums="drums"
      :pattern="pattern"
      @mouse-enter="playSound"
    />
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
import MixTable from "@/components/Machine/MixTable/MixTable.vue";
import Modal from "@/components/Machine/Modal/Modal.vue";
import Sequencer from "@/components/Machine/Sequencer/Sequencer.vue";
import Topbar from "@/components/Machine/Topbar/Topbar.vue";

import { KitObject, PresetObject, TrackStateObject } from "@/types";

import presets from "@/presets";

const afBuffers = new Map();

const audioContext = new AudioContext();

const bufferSize = 2 * audioContext.sampleRate;

@Component({
  components: {
    Bottombar,
    MixTable,
    Modal,
    Sequencer,
    Topbar,
  },
})
export default class Machine extends Vue {
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
  private presets: Array<PresetObject> = [];
  private isModalVisible = false;

  mounted() {
    if (!window.AudioContext) this.playing = false;
  }

  created() {
    this.readSoundsDirectory(this.currentKit.directory);

    this.presets = [...presets];

    if (this.currentKit.directory === this.presets[0].producer) {
      this.pattern = [...this.presets[0].pattern];
      this.tracksStates = [...this.presets[0].tracksStates];
    } else {
      this.setDefaultPattern(false);
      this.setDefaultTracksStates(false, false, -3);
    }

    this.previousTracksStates = JSON.parse(JSON.stringify(this.tracksStates));

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

  public get drumsCount(): number {
    return this.drums.length;
  }

  public get mutedTracks(): number {
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

  public showModal(): void {
    this.isModalVisible = true;
  }

  public closeModal(): void {
    this.isModalVisible = false;
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
