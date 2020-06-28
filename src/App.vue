<template>
  <div id="app">
    <!-- <Machine :key="containerKey" @restart="rerender" /> -->
    <Machine />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Machine from "@/components/Machine/Machine.vue";

@Component({
  components: {
    Machine,
  },
})
export default class App extends Vue {
  // private containerKey = 0;
  // public rerender() {
  //   this.containerKey++;
  // }
}
</script>

<style lang="scss">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;

  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #fff;
  }
}
</style>
