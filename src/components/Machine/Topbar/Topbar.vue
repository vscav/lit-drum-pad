<template>
  <div class="top-bar">
    <div class="title">
      Lit Drum Pad.
    </div>
    <div class="controls">
      <div>
        <dropdown
          :placeholder="'Drums Kit'"
          :options="kits"
          @interface="load"
        />
      </div>
      <div>
        <machine-button @clicked="randomize" icon="random" small secondary>
          Random
        </machine-button>
        <machine-button @clicked="clearSteps" icon="clear" small secondary>
          Clear
        </machine-button>
        <machine-button @clicked="showModal" icon="about" small secondary>
          About
        </machine-button>
        <machine-button @clicked="showMixTable" icon="menu" small secondary />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import Dropdown from "@/components/Machine/Dropdown/Dropdown.vue";
import MachineButton from "@/components/Machine/MachineButton/MachineButton.vue";
import Modal from "@/components/Machine/Modal/Modal.vue";

import { KitObject } from "@/types";

@Component({
  components: {
    Dropdown,
    MachineButton,
    Modal,
  },
})
export default class Topbar extends Vue {
  @Prop({ required: true, type: Object, default: {} })
  readonly kits!: KitObject;

  public load(kit: string): void {
    this.$emit("load", kit);
  }

  public randomize(): void {
    this.$emit("randomize");
  }

  public clearSteps(): void {
    console.log(this);
    this.$emit("clear-steps");
  }

  public showModal(): void {
    this.$emit("show-modal");
  }

  public showMixTable(): void {
    this.$emit("show-mix-table");
  }
}
</script>

<style lang="scss">
@import "@/scss/_sizes.scss";
@import "@/scss/_media.scss";
@import "@/scss/_colors.scss";

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
  height: $top-menu-height;
  padding: 10px 5%;
  box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.25);
  background: $gradient-black-top;

  @include rwd(875) {
    height: auto;
    flex-direction: column;
    padding: 10px;
  }

  .title {
    margin-right: auto;
    font-family: "Quicksand", sans-serif;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 20px;
    letter-spacing: 4px;

    @include rwd(875) {
      margin-right: 0;
      margin-top: 10px;
    }
  }

  .controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    @include rwd(620) {
      flex-direction: column;
    }

    > div {
      @include rwd(620) {
        margin-top: 15px;
      }

      @include rwd(875) {
        margin: 15px 0;
      }

      &:not(:first-child) {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        margin-left: 25px;

        @include rwd(620) {
          margin-left: 0;
        }

        > :not(:first-child) {
          margin-left: 25px;
        }
      }
    }
  }
}
</style>
