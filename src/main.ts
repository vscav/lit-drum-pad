import Vue from "vue";
import VueCircleSlider from "vue-circle-slider";
import App from "./App.vue";

Vue.config.productionTip = false;

Vue.use(VueCircleSlider);

new Vue({
  render: (h) => h(App),
}).$mount("#app");
