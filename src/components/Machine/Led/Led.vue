<template>
  <span class="led" :class="{ lit: active }"> </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Led extends Vue {
  @Prop({ required: true, type: Boolean, default: false })
  readonly active!: boolean;
}
</script>

<style lang="scss">
@import "@/scss/_sizes.scss";
@import "@/scss/_colors.scss";

.led {
  text-align: center;
  height: auto;
  transition: all 0.2s ease-in-out;
  padding: 0;
  width: $step-width;

  &:before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 10px;
    background-color: $light-grey;
    box-shadow: inset 0px 0px 1px 2px rgba(0, 0, 0, 0.1);
  }

  &.lit {
    &:before {
      background-color: $green;
      box-shadow: 0px 0px 7px 0px $green;
    }
  }
}
</style>
