<template>
  <div class="machine">
    <h1>Machine component</h1>
    <div v-for="(drum, i) in drums" :key="i">
      <step-button
        v-for="(step, j) in stepCount"
        :key="`drumCount-${j}`"
        :file="drum.fileName"
        :value="pattern[i][j].active"
        :highlight="currentStep == j"
        @input="(val) => (pattern[i][j].active = val)"
      ></step-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import StepButton from "@/components/Machine/StepButton/StepButton.vue";

@Component({
  components: {
    StepButton,
  },
})
export default class Machine extends Vue {
  private drums: Array<{ fileName: string }> = [];
  private stepCount = 16;
  private currentStep = 0;
  private mutes: Array<boolean> = [];
  private pattern: Array<Array<{ active: boolean }>> = [];

  created() {
    this.readSounds();
    for (let i = 0; i < 4; i += 1) {
      this.drums.push({
        fileName: "fileName.wav",
      });
      this.mutes.push(false);
    }

    for (let i = 0; i < this.drumsCount; i += 1) {
      this.pattern.push([]);
      for (let j = 0; j < this.stepCount; j += 1) {
        this.pattern[i].push({ active: false });
      }
    }
  }

  public readSounds(): void {
    const images = require.context("../../assets/sounds", false, /\.wav$/);
    const files: { [char: string]: string } = {};
    images.keys().forEach((filename) => {
      filename = filename.slice(2);
      this.drums.push({ fileName: filename });
    });
    console.log(this.drums);
  }

  get drumsCount() {
    return this.drums.length;
  }
}
</script>

<style></style>
