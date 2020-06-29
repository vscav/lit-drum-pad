<template>
  <transition name="modal-fade">
    <div class="modal-backdrop" @click="close">
      <div class="modal">
        <div class="modal-header">
          <slot name="header">
            Default title
          </slot>
        </div>
        <div class="modal-body">
          <slot name="body">
            Default body
          </slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Modal extends Vue {
  public close(): void {
    this.$emit("close-modal");
  }
}
</script>

<style lang="scss">
@import "@/scss/_colors.scss";
.modal-fade-enter,
.modal-fade-leave-active {
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba($black, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;

  .modal {
    background: $black;
    overflow-x: auto;
    display: flex;
    flex-direction: column;
    height: 40%;
    width: 30%;
    border-radius: 4px;
    box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.25);
  }
}
</style>
