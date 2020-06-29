<template>
  <div id="app">
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
export default class App extends Vue {}
</script>

<style lang="scss">
@import "@/scss/_colors.scss";
@import url("https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700&display=swap");

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;

  #app {
    font-family: "Archivo", sans-serif;
    font-size: 14px;
    letter-spacing: 0.1ex;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: $white;

    ::-moz-selection {
      background: $green;
    }

    ::selection {
      background: $green;
    }
  }
}
</style>
