<template>
  <div class="sequencer" :class="{ wide: alone }">
    <div class="track dark-grey">
      <led
        v-for="(step, i) in stepCount"
        :key="`stepCount-${i}`"
        :active="i == currentStep"
      ></led>
    </div>
    <div
      v-for="(drum, i) in drums"
      :key="i"
      class="track grey"
      @mouseenter="handleMouseEnterOnTrack(i)"
      @mouseleave="handleMouseLeaveTrack"
    >
      <step-button
        v-for="(step, j) in stepCount"
        :key="`drumCount-${j}`"
        :file="drum.fileName"
        :value="pattern[i][j].active"
        :highlight="currentStep == j || hoveredIndex == i"
        :row="i"
        @click="(val) => (pattern[i][j].active = val)"
        @mouse-enter="handleMouseEnterOnStep"
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
  @Prop({ required: false, type: Number, default: false })
  readonly hoveredIndex!: number;
  @Prop({ required: false, type: Boolean, default: false })
  readonly alone!: boolean;

  public handleMouseEnterOnStep(file: string): void {
    this.$emit("mouse-enter-on-step", file);
  }

  public handleMouseEnterOnTrack(index: number): void {
    this.$emit("mouse-enter-on-track", index);
  }

  public handleMouseLeaveTrack(): void {
    this.$emit("mouse-leave-track");
  }
}
</script>

<style lang="scss">
@import "@/scss/_media.scss";
@import "@/scss/_colors.scss";

.sequencer {
  height: calc(100vh - (90px + 60px));
  margin-top: 60px;
  margin-bottom: 90px;
  margin-right: 200px;
  overflow: scroll;
  transition: margin-right 0.15s ease-in-out;

  @include rwd(875) {
    margin-top: 118px;
    height: calc(100vh - (90px + 118px));
  }

  @include rwd(620) {
    margin-top: 163px;
    height: calc(100vh - (90px + 163px));
  }

  &.wide {
    margin-right: 0;
  }

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

      &:hover {
        background: $grey;
      }
    }
  }
}
</style>
