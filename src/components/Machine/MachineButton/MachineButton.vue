<template>
  <span
    class="button"
    :class="{ active: pressed || tempPressed }"
    @click="clickAction"
  >
    <slot></slot>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class MachineButton extends Vue {
  @Prop({ required: true, type: Boolean, default: false })
  readonly pressed!: boolean;

  private tempPressed = false;

  public clickAction(): void {
    if (!this.pressed) {
      this.tempPressed = true;
      setTimeout(() => {
        this.tempPressed = false;
      }, 200);
    }
    this.$emit("click");
  }
}
</script>

<style lang="scss">
.button {
  display: inline-block;
  height: 32px;
  border-radius: 7px;
  border: 0px solid rgba(0, 0, 0, 0.5);
  border-width: 0px 1px 4px 1px;
  box-shadow: 0px 5px 1px 1px rgba(0, 0, 0, 0.3),
    inset 0px 0px 0px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  margin: 16px 3px;
  transition: all 0.1s ease-in-out;
  font-size: 13px;
  line-height: 32px;
  padding: 0px 10px;
  color: #666;

  &.active {
    border-bottom-width: 1px;
    box-shadow: 0px 1px 0px 1px rgba(0, 0, 0, 0.3),
      inset 0px 0px 0px 3px rgba(0, 0, 0, 0.1);
  }
}
</style>
