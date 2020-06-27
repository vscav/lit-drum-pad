<template>
  <span
    class="stepbutton"
    :class="[
      { highlight: highlight },
      value ? 'active' + ((this.row % 9) + 1) : '',
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

  created() {
    if (this.row === 9) console.log((this.row % 8) + 1);
  }

  public changeState(): void {
    this.$emit("click", !this.value);
  }

  public playSound(): void {
    this.$emit("mouse-enter", this.file);
  }
}
</script>

<style lang="scss">
@import "@/scss/_variables.scss";

.stepbutton {
  border: 1px solid rgba($lighter-grey, 0.1);
  text-align: center;
  flex: 1 0 auto;
  height: auto;

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

  &.highlight {
    background-color: $grey;

    &.active1 {
      background-color: $green;
    }
    &.active2 {
      background-color: $darker-orange;
    }
    &.active3 {
      background-color: $orange;
    }
    &.active4 {
      background-color: $yellow;
    }
    &.active5 {
      background-color: $blue;
    }
    &.active6 {
      background-color: $coral;
    }
    &.active7 {
      background-color: $red;
    }
    &.active8 {
      background-color: $purple;
    }
    &.active9 {
      background-color: $pink;
    }
  }

  &.active1 {
    background-color: $light-green;
  }
  &.active2 {
    background-color: $dark-orange;
  }
  &.active3 {
    background-color: $light-orange;
  }
  &.active4 {
    background-color: $light-yellow;
  }
  &.active5 {
    background-color: $light-blue;
  }
  &.active6 {
    background-color: $light-coral;
  }
  &.active7 {
    background-color: $light-red;
  }
  &.active8 {
    background-color: $light-purple;
  }
  &.active9 {
    background-color: $light-pink;
  }
}
</style>
