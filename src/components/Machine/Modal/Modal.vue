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
        <div class="modal-control">
          <machine-button @clicked="close" icon="check" medium primary />
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import MachineButton from "@/components/Machine/MachineButton/MachineButton.vue";

@Component({
  components: {
    MachineButton,
  },
})
export default class Modal extends Vue {
  public close(): void {
    this.$emit("close-modal");
  }
}
</script>

<style lang="scss">
@import "@/scss/_media.scss";
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
    background: $light-gradient-black;
    overflow-x: auto;
    display: flex;
    flex-direction: column;
    height: auto;
    width: 30%;
    border-radius: 4px;
    box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.25);
    padding: 50px 10px 25px 10px;
    text-align: left;

    @include xs {
      width: 75%;
    }

    @include sm {
      width: 75%;
    }

    @include md {
      width: 60%;
    }

    @include lg {
      width: 45%;
    }

    @include xl {
      width: 30%;
    }

    .modal-header {
      padding-left: 30px;
    }

    .modal-body {
      margin-top: 30px;
      padding-left: 30px;
      line-height: 25px;

      p {
        &:not(:first-child) {
          margin-top: 20px;
        }
      }
    }

    .modal-control {
      text-align: center;
      margin: 30px 0;
    }
  }
}
</style>
