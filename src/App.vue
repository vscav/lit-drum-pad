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
@import url("https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700&display=swap");

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;

  #app {
    font-family: "Archivo", sans-serif;
    letter-spacing: 1px;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #fff;
  }
}
</style>
