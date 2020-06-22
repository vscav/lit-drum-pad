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
.led {
  display: inline-block;
  width: 34px;
  height: 20px;
  text-align: center;
  margin: 2px 3px;
  transition: all 0.2s ease-in-out;

  &:before {
    content: "";
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 10px;
    background-color: #bbb;
    box-shadow: inset 0px 0px 1px 2px rgba(0, 0, 0, 0.1);
  }

  &.lit {
    &:before {
      background-color: #1fcb02;
      box-shadow: 0px 0px 7px 0px #1fcb02;
    }
  }
}
</style>
