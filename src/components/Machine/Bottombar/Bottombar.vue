<template>
  <div class="bottom-bar">
    <div class="controls">
      <machine-button
        @clicked="pausePlay"
        :icon="playing ? 'stop' : 'play'"
        large
        primary
      />
      <div class="slider">
        <circle-slider
          v-model="speed"
          :min="0"
          :max="220"
          :step-size="1"
          :side="60"
          :circle-width-rel="30"
          :progress-width-rel="15"
          :knob-radius-rel="8"
          circle-color="#213354"
          progress-color="#3fc1d3"
          knob-color="#3fc1d3"
        ></circle-slider>
        <div class="value">{{ tempo }} <span class="unit">bpm</span></div>
      </div>
      <div class="slider">
        <circle-slider
          v-model="volume"
          :min="-80"
          :max="0"
          :step-size="1"
          :side="60"
          :circle-width-rel="30"
          :progress-width-rel="15"
          :knob-radius-rel="8"
          circle-color="#213354"
          progress-color="#3fc1d3"
          knob-color="#3fc1d3"
        ></circle-slider>
        <div class="value">{{ dbfs }} <span class="unit">db</span></div>
      </div>
      <switch-button v-model="muteMaster" :checked="mute"
        >Mute all</switch-button
      >
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import MachineButton from "@/components/Machine/MachineButton/MachineButton.vue";
import SwitchButton from "@/components/Machine/SwitchButton/SwitchButton.vue";

@Component({
  components: {
    MachineButton,
    SwitchButton,
  },
})
export default class Bottombar extends Vue {
  @Prop({ required: true, type: Boolean, default: false })
  readonly playing!: boolean;
  @Prop({ required: true, type: Number, default: -3 })
  readonly dbfs!: number;
  @Prop({ required: true, type: Number, default: 100 })
  readonly tempo!: number;
  @Prop({ required: true, type: Boolean, default: false })
  readonly mute!: boolean;

  private speed: number = this.tempo;
  private volume: number = this.dbfs;
  private muteMaster = this.mute;

  @Watch("muteMaster")
  public onMuteStateChange(muteState: string): void {
    this.$emit("mute-master");
  }

  @Watch("speed")
  public onTempoChange(tempo: string): void {
    this.$emit("tempo-changed", tempo);
  }

  @Watch("volume")
  public onVolumeChange(volume: string): void {
    this.$emit("volume-changed", volume);
  }

  public pausePlay(): void {
    this.$emit("pause-play");
  }
}
</script>

<style lang="scss">
@import "@/scss/_sizes.scss";
@import "@/scss/_media.scss";
@import "@/scss/_colors.scss";

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  height: $bottom-menu-height;
  padding: 10px 5%;
  box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.02);
  background: $black;

  @include rwd(620) {
    justify-content: space-around;
  }

  .controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    > :not(:first-child) {
      margin-left: 25px;
    }

    .slider {
      position: relative;

      .value {
        font-size: 14px;

        .unit {
          font-size: 10px;
          color: $mute;
        }
      }

      > div:first-child {
        display: flex;
        align-items: center;
      }
      > div:last-child {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
}
</style>
