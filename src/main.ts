import { createApp } from "vue";
import App from "./App.vue";
import "./assets/base.css";
import { createPinia } from "pinia";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

app.mount("#app");
