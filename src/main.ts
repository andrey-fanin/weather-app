import { createApp } from 'vue'
import App from './App.vue'
import WeatherWidget from './components/WeatherWidget.vue'

createApp(App).component('WeatherWidget', WeatherWidget).mount('#app')
