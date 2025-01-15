import { createApp } from 'vue';
import 'src/app/assets/index.css';
import App from 'src/app/App.vue';
import router from 'src/app/router';

const app = createApp(App);

app.use(router);

app.mount('#app');
