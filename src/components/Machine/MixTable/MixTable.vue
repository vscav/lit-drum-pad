<template>
  <div class="mix-table" :class="{ visible: show }">
    <div
      class="track"
      :class="{ highlight: hoveredIndex === i }"
      v-for="(drum, i) in drums"
      :key="i"
      @mouseenter="handleMouseEnter(i)"
      @mouseleave="handleMouseLeave"
    >
      <circle-slider
        v-model="tracksStates[i].volume"
        :min="-80"
        :max="0"
        :step-size="1"
        :side="35"
        :circle-width-rel="30"
        :progress-width-rel="15"
        :knob-radius-rel="8"
        circle-color="#213354"
        progress-color="#3fc1d3"
        knob-color="#3fc1d3"
      ></circle-slider>
      <div class="track-states">
        <switch-button
          v-model="tracksStates[i].mute"
          :checked="tracksStates[i].mute"
          >M</switch-button
        >
        <switch-button
          v-model="tracksStates[i].solo"
          :checked="tracksStates[i].solo"
          >S</switch-button
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import SwitchButton from "@/components/Machine/SwitchButton/SwitchButton.vue";

import { TrackStateObject } from "@/types";

@Component({
  components: {
    SwitchButton
  }
})
export default class MixTable extends Vue {
  @Prop({ required: false, type: Array, default: false })
  readonly drums!: Array<{ fileName: string }>;
  @Prop({ required: false, type: Array, default: false })
  readonly tracksStates!: Array<TrackStateObject>;
  @Prop({ required: false, type: Number, default: false })
  readonly hoveredIndex!: number;
  @Prop({ required: false, type: Boolean, default: false })
  readonly show!: boolean;

  public handleMouseEnter(index: number): void {
    this.$emit("mouse-enter", index);
  }

  public handleMouseLeave(): void {
    this.$emit("mouse-leave");
  }
}
</script>

<style lang="scss">
.mix-table {
  position: fixed;
  top: 60px;
  right: -200px;
  height: $window-height;
  width: 200px;
  background: $gradient-grey;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  transition: right 0.15s ease-in-out;

  @include rwd(875) {
    top: 118px;
    height: calc(100vh - (90px + 118px));
  }

  @include rwd(620) {
    top: 163px;
    height: calc(100vh - (90px + 163px));
  }

  &.visible {
    right: 0;
  }

  &::-webkit-scrollbar {
    width: 5px;
    height: 0px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: $green;
    border-radius: 25px;
    box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.15),
      0 2px 2px 0 rgba(0, 0, 0, 0.01), 0 1px 5px 0 rgba(0, 0, 0, 0.085);
  }

  .track {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    width: 100%;
    padding: 10px;
    height: $step-height;

    &:hover {
      background: $black;
    }

    &.highlight {
      background: $black;
    }

    &:first-child {
      margin-top: 15px;
    }

    > :first-child {
      height: 50px;
    }

    > div {
      display: flex;
      align-items: center;
    }

    .track-states {
      > :not(:first-child) {
        margin-left: 10px;
      }
    }
  }
}
</style>
