import { createApp } from 'vue'
import App from './App.vue'
import WeatherWidget from './components/WeatherWidget.vue'
import './style.css'

createApp(App).component('WeatherWidget', WeatherWidget).mount('#app')
