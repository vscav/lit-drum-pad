<template>
  <div class="bottom-bar">
    <div class="controls">
      <machine-button :pressed="playing" @click="pausePlay"
        >Play</machine-button
      >
      <circle-slider
        v-model="speed"
        :min="0"
        :max="220"
        :step-size="1"
        :side="60"
        :circle-width-rel="30"
        :progress-width-rel="15"
        :knob-radius-rel="8"
        circle-color="#666"
        progress-color="#1adecb"
        knob-color="#1adecb"
      ></circle-slider>
      <div>{{ tempo }}</div>
      <circle-slider
        v-model="volume"
        :min="-80"
        :max="0"
        :step-size="1"
        :side="60"
        :circle-width-rel="30"
        :progress-width-rel="15"
        :knob-radius-rel="8"
        circle-color="#666"
        progress-color="#1adecb"
        knob-color="#1adecb"
      ></circle-slider>
      <div>{{ dbfs }} db</div>
      <switch-button v-model="muteMaster" :checked="mute"
        >Mute all</switch-button
      >
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from "vue-property-decorator";

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
  onMuteStateChange(muteState: string) {
    this.$emit("mute-master");
  }

  @Watch("speed")
  onTempoChange(tempo: string) {
    this.$emit("tempo-changed", tempo);
  }

  @Watch("volume")
  onVolumeChange(volume: string) {
    this.$emit("volume-changed", volume);
  }

  pausePlay(): void {
    this.$emit("pause-play");
  }
}
</script>

<style lang="scss" scoped>
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
  height: 90px;
  padding: 10px 5%;
  box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.02);
  background: #131313;
  color: #fff;

  .controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    > :not(:first-child) {
      margin-left: 25px;
    }
  }
}
</style>
