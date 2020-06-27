<template>
  <div class="top-bar">
    <div class="title">
      Lit Drum Pad.
    </div>
    <div class="controls">
      <dropdown
        :placeholder="'Drums Kit'"
        :options="options"
        @interface="load"
      />
      <machine-button @clicked="randomize" icon="random" small secondary>
        Random
      </machine-button>
      <machine-button @clicked="clearSteps" icon="clear" small secondary>
        Clear
      </machine-button>
      <machine-button @clicked="restart" icon="restart" small secondary>
        Restart
      </machine-button>
      <!-- <machine-button @clicked="modal" icon="about" small secondary>
        About
      </machine-button> -->
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from "vue-property-decorator";

import Dropdown from "@/components/Machine/Dropdown/Dropdown.vue";
import MachineButton from "@/components/Machine/MachineButton/MachineButton.vue";

import { KitObject } from "@/types";

@Component({
  components: {
    Dropdown,
    MachineButton,
  },
})
export default class Topbar extends Vue {
  @Prop({ required: true, type: Object, default: {} })
  readonly options!: KitObject;

  load(kit: string): void {
    this.$emit("load", kit);
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

<style lang="scss">
@import "@/scss/_variables.scss";

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
  background: $black;

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
