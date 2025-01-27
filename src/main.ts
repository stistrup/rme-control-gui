import { createApp } from "vue";
import App from "./App.vue";
import "./assets/base.css";
import { createPinia } from "pinia";
import RmePlugin from "./services/RmeService";
import MqttPlugin from "./services/MqttService";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(RmePlugin);
app.use(MqttPlugin);
app.mount("#app");
