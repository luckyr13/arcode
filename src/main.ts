import 'core-js/stable'
import 'regenerator-runtime/runtime'
import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import './assets/css/arcode-base.scss'
import router from './router'

createApp(App).use(router).mount('#app')
