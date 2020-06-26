<template>
  <span
    class="stepbutton"
    :class="{ active: value, highlight: highlight }"
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

  public changeState(): void {
    this.$emit("click", !this.value);
  }

  public playSound(): void {
    this.$emit("mouse-enter", this.file);
  }
}
</script>

<style lang="scss">
.stepbutton {
  border: 1px solid rgba(41, 73, 255, 0.1);
  text-align: center;
  flex: 1 0 auto;
  height: auto;

  &:before {
    content: "";
    float: left;
    padding-top: 100%;
  }

  &:nth-child(4n) {
    border-right: 1px solid #bc84fb;
  }
  &:nth-child(4n + 1) {
    border-left: 1px solid #bc84fb;
  }

  &.active {
    background-color: #575e63;
  }
}
</style>
