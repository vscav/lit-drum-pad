<template>
  <div class="top-bar">
    <div class="title">
      Lit Drum Pad.
    </div>
    <div class="controls">
      <switch-button v-model="muteMaster" :checked="mute"
        >Mute all</switch-button
      >
      <machine-button @click="randomize">Random</machine-button>
      <machine-button @click="clearSteps">Clear</machine-button>
      <machine-button @click="restart">Restart</machine-button>
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
export default class Topbar extends Vue {
  @Prop({ required: true, type: Boolean, default: false })
  readonly mute!: boolean;

  private muteMaster = this.mute;

  @Watch("muteMaster")
  onMuteStateChange(muteState: string) {
    this.$emit("mute-master");
  }

  randomize() {
    this.$emit("randomize");
  }

  clearSteps() {
    this.$emit("clear-steps");
  }

  restart() {
    this.$emit("restart");
  }
}
</script>

<style lang="scss" scoped>
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  height: 60px;
  padding: 10px 5%;
  box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.02);
  background: #131313;

  .title {
    margin-right: auto;
    font-family: "Quicksand", sans-serif;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 20px;
    letter-spacing: 2px;
    color: #fff;
  }

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
