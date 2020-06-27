<template>
  <button
    @click="click"
    :class="[
      {
        active: pressed || tempPressed,
        primary: primary,
        secondary: secondary,
        'btn-small': small,
        'btn-large': large,
      },
      icon ? 'icon-' + icon : '',
    ]"
    class="btn"
  >
    <slot />
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class VButton extends Vue {
  @Prop({ required: false, type: Boolean, default: false })
  readonly primary!: boolean;
  @Prop({ required: false, type: Boolean, default: false })
  readonly secondary!: boolean;
  @Prop({ required: false, type: Boolean, default: false })
  readonly small!: boolean;
  @Prop({ required: false, type: Boolean, default: false })
  readonly large!: boolean;
  @Prop({ required: false, type: Boolean, default: false })
  readonly pressed!: boolean;
  @Prop({ required: false, type: String, default: false })
  readonly icon!: string;

  private tempPressed = false;

  public click(): void {
    if (!this.pressed) {
      this.tempPressed = true;
      setTimeout(() => {
        this.tempPressed = false;
      }, 200);
    }
    this.$emit("clicked");
  }
}
</script>

<style lang="scss" scoped>
.btn {
  letter-spacing: 0.1ex;
  color: #fff;
  border: none;
  outline: none;
  position: relative;
  display: inline-block;
  cursor: pointer;
  background: transparent;
}

.btn:active {
  outline: none;
}

.btn::before {
  top: 50%;
  transform: translate(0, -50%);
  position: absolute;
  display: block;
  content: "\a";
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  left: 0;
  border-radius: 50%;
  background-color: #2e2e2e;
  background-size: 50%;
  -webkit-transition: background-color 0.25s ease-out;
  -moz-transition: background-color 0.25s ease-out;
  -o-transition: background-color 0.25s ease-out;
  transition: background-color 0.25s ease-out;
}
.btn-small {
  padding-left: 40px;
}
.btn-small::before {
  width: 30px;
  height: 30px;
}
.btn-large {
  padding-left: 60px;
}
.btn-large::before {
  width: 50px;
  height: 50px;
}

.icon-play::before {
  background-image: url(../../../assets/icons/icon-restart-small.svg);
}

.btn:hover:before {
  background-color: #383838;
}
</style>
