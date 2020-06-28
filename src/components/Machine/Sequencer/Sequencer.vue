<template>
  <div class="sequencer">
    <div class="track dark-grey">
      <led
        v-for="(step, i) in stepCount"
        :key="`stepCount-${i}`"
        :active="i == currentStep"
      ></led>
    </div>
    <div v-for="(drum, i) in drums" :key="i" class="track grey">
      <step-button
        v-for="(step, j) in stepCount"
        :key="`drumCount-${j}`"
        :file="drum.fileName"
        :value="pattern[i][j].active"
        :highlight="currentStep == j"
        :row="i"
        @click="(val) => (pattern[i][j].active = val)"
        @mouse-enter="handleMouseEnter"
      ></step-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import Led from "@/components/Machine/Led/Led.vue";
import StepButton from "@/components/Machine/StepButton/StepButton.vue";

import { TrackStateObject } from "@/types";

@Component({
  components: {
    Led,
    StepButton,
  },
})
export default class Sequencer extends Vue {
  @Prop({ required: false, type: Number, default: false })
  readonly stepCount!: number;
  @Prop({ required: false, type: Number, default: false })
  readonly currentStep!: number;
  @Prop({ required: false, type: Array, default: false })
  readonly drums!: Array<{ fileName: string }>;
  @Prop({ required: false, type: Array, default: false })
  readonly pattern!: Array<Array<{ active: boolean }>>;

  public handleMouseEnter(file: string): void {
    this.$emit("mouse-enter", file);
  }

  public handleClick(val: boolean): void {
    this.$emit("click", val);
  }
}
</script>

<style lang="scss">
@import "@/scss/_colors.scss";

.sequencer {
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
    box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.15),
      0 2px 2px 0 rgba(0, 0, 0, 0.01), 0 1px 5px 0 rgba(0, 0, 0, 0.085);
  }

  .track {
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
