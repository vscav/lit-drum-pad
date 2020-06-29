<template>
  <span
    class="stepbutton"
    :class="[
      { highlight: highlight, active: value },
      value ? 'color' + ((this.row % 9) + 1) : '',
    ]"
    @click="changeState"
    @mouseenter="playSound"
  >
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class StepButton extends Vue {
  @Prop({ required: true, type: Boolean, default: false })
  readonly value!: boolean;
  @Prop({ required: true, type: Boolean, default: false })
  readonly highlight!: boolean;
  @Prop({ required: true, type: String })
  readonly file!: string;
  @Prop({ required: true, type: Number })
  readonly row!: number;

  public changeState(): void {
    this.$emit("click", !this.value);
  }

  public playSound(): void {
    this.$emit("mouse-enter", this.file);
  }
}
</script>

<style lang="scss">
@import "@/scss/_colors.scss";

.stepbutton {
  //border: 1px solid rgba($lighter-grey, 0.1);
  text-align: center;
  flex: 1 0 auto;
  width: 70px;
  height: 70px;
  border-radius: 10px;

  &:before {
    content: "";
    float: left;
    padding-top: 100%;
  }

  &:nth-child(4n) {
    border-right: 1px solid $lighter-grey;
  }
  &:nth-child(4n + 1) {
    border-left: 1px solid $lighter-grey;
  }

  &.active {
    animation-name: stepAnimation;
    animation-duration: 0.4s;
    animation-timing-function: ease-out;
    animation-delay: 0;
    animation-direction: alternate;
    animation-iteration-count: 1;
    animation-play-state: running;
  }

  &.highlight {
    background-color: $grey;

    &.color1 {
      background-color: $green;
    }
    &.color2 {
      background-color: $darker-orange;
    }
    &.color3 {
      background-color: $orange;
    }
    &.color4 {
      background-color: $yellow;
    }
    &.color5 {
      background-color: $blue;
    }
    &.color6 {
      background-color: $coral;
    }
    &.color7 {
      background-color: $red;
    }
    &.color8 {
      background-color: $purple;
    }
    &.color9 {
      background-color: $pink;
    }
  }

  &.color1 {
    background-color: $light-green;
  }
  &.color2 {
    background-color: $dark-orange;
  }
  &.color3 {
    background-color: $light-orange;
  }
  &.color4 {
    background-color: $light-yellow;
  }
  &.color5 {
    background-color: $light-blue;
  }
  &.color6 {
    background-color: $light-coral;
  }
  &.color7 {
    background-color: $light-red;
  }
  &.color8 {
    background-color: $light-purple;
  }
  &.color9 {
    background-color: $light-pink;
  }

  @keyframes stepAnimation {
    0% {
      transform: scale(0.5);
    }

    50% {
      transform: scale(1.1);
    }

    100% {
      transform: scale(1);
    }
  }
}
</style>
