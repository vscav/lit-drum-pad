<template>
  <div class="select" @click="toggleDropdown">
    <span
      @click="activeDrop"
      class="selected-option"
      :class="{ active: active }"
    >
      {{ currentPlaceholder }}
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path
          d="M11.404,16.407l-6.826,-6.826c-0.329,-0.329 -0.329,-0.863 0,-1.192l0.796,-0.796c0.329,-0.329 0.861,-0.329 1.191,-0.002l5.435,5.41l5.435,-5.41c0.33,-0.327 0.862,-0.327 1.191,0.002l0.796,0.796c0.329,0.329 0.329,0.863 0,1.192l-6.826,6.826c-0.329,0.329 -0.863,0.329 -1.192,0Z"
        />
      </svg>
    </span>
    <transition name="slide">
      <div
        class="dropdown-options-container"
        v-show="showDropdown"
        :style="{ height: 35 * numberOfOptions + 'px' }"
      >
        <div
          class="dropdown-options"
          v-for="option in options"
          :class="{ selected: option === selected }"
          :key="option"
        >
          <div class="dropdown-options--cell" @click="selectOption(option)">
            <span class="option-text">{{ option }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Prop, Vue, Component } from "vue-property-decorator";

import { KitObject } from "@/types";

@Component
export default class VDropdown extends Vue {
  @Prop({ required: true, type: Object, default: {} })
  readonly options!: KitObject;
  @Prop({ required: false, type: String, default: "Select from the dropdown" })
  readonly placeholder!: string;

  private currentPlaceholder: string = this.placeholder;
  private selected = "Select an option";
  private showDropdown = false;
  private active = false;

  mounted() {
    this.currentPlaceholder = Object.values(this.options)[0];
    this.selected = Object.values(this.options)[0];
  }

  get numberOfOptions(): number {
    return Object.values(this.options).length;
  }

  public toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  public activeDrop(): void {
    this.active = !this.active;
  }

  public selectOption(option: string): void {
    this.active = !this.active;
    this.selected = option;
    this.currentPlaceholder = option;
    this.$emit("interface", this.selected);
  }
}
</script>

<style lang="scss">
@import "@/scss/_colors.scss";

.select {
  position: relative;
  width: 180px;
  background-color: $grey;
  display: inline-block;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.15),
    0 2px 2px 0 rgba(0, 0, 0, 0.01), 0 1px 5px 0 rgba(0, 0, 0, 0.085);
  border-radius: 4px;
  transition: all 200ms linear;

  .selected-option {
    white-space: nowrap;
    text-overflow: ellipsis;
    display: inline-block;
    width: 100%;
    position: relative;
    box-sizing: border-box;
    transition: all 200ms linear;
    padding: 10px;
    border-radius: 4px;

    &:hover {
      background-color: $light-grey;
    }

    svg {
      fill: #fff;
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      transition: fill 300ms linear, transform 300ms ease;
    }

    &.active svg {
      transform: translateY(-50%) rotateX(0.5turn);
    }
  }

  .dropdown-options-container {
    position: absolute;
    width: 100%;
    z-index: 1;
    background: inherit;
    box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.15),
      0 2px 2px 0 rgba(0, 0, 0, 0.01), 0 1px 5px 0 rgba(0, 0, 0, 0.085);
    border-radius: 4px;
    margin-top: 2px;

    .dropdown-options--cell {
      user-select: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 10px;

      &:hover {
        background-color: $light-grey;
        border: none;
      }
    }

    .dropdown-options {
      &.selected .dropdown-options--cell {
        background-color: $light-grey;
        border: none;
      }
    }
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: height 150ms ease;
  }

  .slide-enter,
  .slide-leave-to {
    height: 0px;
  }
}
</style>
