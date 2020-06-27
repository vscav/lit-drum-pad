<template>
  <label class="switch">
    <input
      type="checkbox"
      :checked="checked"
      :disabled="disabled"
      v-model="value"
    />
    <span><slot></slot></span>
  </label>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class SwitchButton extends Vue {
  @Prop({ required: false, type: Boolean, default: false })
  readonly disabled!: boolean;
  @Prop({ required: false, type: Boolean, default: false })
  readonly checked!: boolean;

  private value: boolean = this.checked;

  beforeMount() {
    this.value = this.checked;
  }
  mounted() {
    this.$emit("input", this.value);
  }

  @Watch("value")
  valueChanged(newVal) {
    this.$emit("input", newVal);
  }
  @Watch("checked")
  checkStateChanged(newVal) {
    this.value = newVal;
  }
}
</script>

<style lang="scss">
label.switch {
  input[type="checkbox"] {
    display: none;
    &:checked {
      + span {
        &:before {
          background-color: rgba(#1adecb, 0.5);
        }
        &:after {
          background-color: #1adecb;
          transform: translate(80%, -50%);
        }
      }
    }
    + span {
      position: relative;
      display: inline-block;
      cursor: pointer;
      font-weight: 500;
      text-align: left;
      margin: 0px;
      padding: 0 0 0 44px;
      color: #fff;
      &:before,
      &:after {
        content: "";
        cursor: pointer;
        position: absolute;
        margin: 0;
        outline: 0;
        top: 50%;
        transform: translate(0, -50%);
        transition: all 200ms ease-out;
      }
      &:before {
        left: 1px;
        width: 34px;
        height: 14px;
        background-color: #383838;
        border-radius: 8px;
      }
      &:after {
        left: 0;
        width: 20px;
        height: 20px;
        background-color: #535353;
        border-radius: 50%;
        box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.14),
          0 2px 2px 0 rgba(0, 0, 0, 0.098), 0 1px 5px 0 rgba(0, 0, 0, 0.084);
      }
    }
    &:checked + span &:after {
      transform: translate(80%, -50%);
    }
  }
}
</style>