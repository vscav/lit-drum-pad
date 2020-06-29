<template>
  <button
    :name="icon"
    @click="click"
    :class="[
      {
        primary: primary,
        secondary: secondary,
        'btn-small': small,
        'btn-medium': medium,
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
  readonly medium!: boolean;
  @Prop({ required: false, type: Boolean, default: false })
  readonly large!: boolean;
  @Prop({ required: false, type: Boolean, default: false })
  readonly pressed!: boolean;
  @Prop({ required: false, type: String, default: false })
  readonly icon!: string;

  public click(): void {
    this.$emit("clicked");
  }
}
</script>

<style lang="scss">
@import "@/scss/_colors.scss";

.btn {
  letter-spacing: 0.1ex;
  border: none;
  outline: none;
  position: relative;
  display: inline-block;
  cursor: pointer;
  background: transparent;
  color: $white;

  &::before {
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
    -webkit-transition: background-color 0.25s ease-out;
    -moz-transition: background-color 0.25s ease-out;
    -o-transition: background-color 0.25s ease-out;
    transition: background-color 0.25s ease-out;
    box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.15),
      0 2px 2px 0 rgba(0, 0, 0, 0.01), 0 1px 5px 0 rgba(0, 0, 0, 0.085);
  }

  &.primary {
    &::before {
      background-color: $green;
    }
  }
  &.secondary {
    &::before {
      background-color: $grey;
    }
  }
  &.primary:hover:before {
    background-color: $light-green;
  }
  &.secondary:hover:before {
    background-color: $light-grey;
  }

  &.btn-small {
    padding-left: 40px;
    &::before {
      width: 30px;
      height: 30px;
      background-size: 50%;
    }
  }
  &.btn-medium {
    padding-left: 50px;
    &::before {
      width: 45px;
      height: 45px;
      background-size: 40%;
    }
  }
  &.btn-large {
    padding-left: 60px;
    &::before {
      width: 60px;
      height: 60px;
      background-size: 30%;
    }
  }

  &.icon-play {
    &::before {
      background-image: url(../../../assets/icons/icon-play.svg);
    }
  }
  &.icon-stop {
    &::before {
      background-image: url(../../../assets/icons/icon-stop.svg);
    }
  }
  &.icon-random {
    &::before {
      background-image: url(../../../assets/icons/icon-random-small.svg);
    }
  }
  &.icon-clear {
    &::before {
      background-image: url(../../../assets/icons/icon-clear-small.svg);
    }
  }
  &.icon-menu {
    &::before {
      background-image: url(../../../assets/icons/icon-menu-small.svg);
    }
  }
  &.icon-check {
    &::before {
      background-image: url(../../../assets/icons/icon-check-medium.svg);
    }
  }
  &.icon-restart {
    &::before {
      background-image: url(../../../assets/icons/icon-restart-small.svg);
    }
  }
  &.icon-about {
    &::before {
      background-image: url(../../../assets/icons/icon-about-small.svg);
    }
  }
}
</style>
