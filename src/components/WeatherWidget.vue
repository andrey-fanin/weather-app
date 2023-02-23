<template>
	<div>
		<h2>Weather Widget</h2>
		<ul>
			<li
				v-for="(city, index) in state.cities"
				:key="city.id"
				style="
					flex-direction: column;
					text-align: left;
					justify-content: flex-start;
					gap: 5px;
				"
			>
				<div class="drag-handle"></div>
				<div class="city-name">{{ city?.name }}</div>
				<div style="display: flex; align-items: center">
					<img :src="city?.icon" alt="#" />
					<div class="city-weather">{{ city?.temp }}°C</div>
				</div>
				<div class="city-wind-speed">Feels like {{ city?.feels }}°C.</div>
				<div style="display: flex; align-items: center">
					<div class="city-wind-speed" style="margin-right: 10px">
						Speed: {{ city?.wind?.speed }}m/s
					</div>
					<div class="city-wind-speed">{{ city?.wind?.direction }}.</div>
				</div>
				<div style="display: flex; align-items: center">
					<div class="city-wind-speed" style="margin-right: 10px">
						Pressure: {{ city?.pressure }}hpa
					</div>
					<div class="city-wind-speed">Humidity: {{ city?.humidity }}%</div>
				</div>
				<div style="display: flex; align-items: center; text-transform: ">
					<div class="city-descr">{{ city?.weather }}.</div>
				</div>
				<button @click="removeCity(index)" style="align-self: center">
					Remove
				</button>
			</li>
		</ul>
		<form @submit.prevent="addCity">
			<input type="text" v-model="state.newCity" placeholder="Add a new city" />
			<button>Add</button>
		</form>
	</div>
</template>

<script>
import { reactive, computed, onMounted } from 'vue'
import getCompassDirection from '../services/getCompassDirection'

export default {
	setup() {
		const API_KEY = '58d9d2543e0b8c24e232c3fac88f1bcb'
		const state = reactive({
			cities: [],
			userLocation: null,
			newCity: ''
		})
		let id = 0

		const weatherData = computed(() => {
			return Promise.all(
				state.cities.map(async city => {
					const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric`

					const returnFetch = await fetch(url).then(response =>
						response
							.json()
							.then(data => {
								console.log(data)
								city.temp = Math.ceil(data?.main?.temp)
								city.feels = Math.ceil(data?.main?.feels_like)
								city.weather = data?.weather[0]?.description
								city.wind = {
									speed: data?.wind?.speed.toFixed(1),
									direction: getCompassDirection(data?.wind?.deg)
								}
								city.pressure = data?.main?.pressure
								city.humidity = data?.main?.humidity
								city.visibility = data?.visibility
								city.icon = `https://openweathermap.org/img/wn/${data?.weather[0]?.icon}@4x.png`

								console.log(city)
								console.log(data?.weather?.icon, 'data?.weather?.icon')
							})
							.catch(error => console.error(error))
					)
					console.log(returnFetch)
					console.log(state.cities)
					return returnFetch
				})
			)
		})

		function addCity() {
			// Look up city ID using OpenWeatherMap API
			const url = `http://api.openweathermap.org/geo/1.0/direct?q=${state.newCity}&limit=1&appid=${API_KEY}&units=metric`
			fetch(url)
				.then(response => response.json())
				.then(data => {
					state.cities.push({
						id: id++,
						name: data[0].name,
						lat: data[0].lat,
						lon: data[0].lon
					})
					state.newCity = ''
					saveState()
				})
				.catch(error => console.error(error))
		}

		function removeCity(index) {
			state.cities.splice(index, 1)
			saveState()
		}

		function reorderCities(fromIndex, toIndex) {
			const [removed] = state.cities.splice(fromIndex, 1)
			state.cities.splice(toIndex, 0, removed)
		}

		function saveState() {
			localStorage.setItem('weather-widget-state', JSON.stringify(state))
		}

		function restoreState() {
			const savedState = JSON.parse(
				localStorage.getItem('weather-widget-state')
			)
			if (savedState) {
				state.cities = savedState.cities
			}
		}

		onMounted(() => {
			// Get user's location and add it to the cities list
			navigator.geolocation.getCurrentPosition(position => {
				const url = `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${API_KEY}&units=metric/`
				fetch(url)
					.then(response => response.json())
					.then(data => {
						state.userLocation = {
							id: data.id,
							name: data.name
						}
						state.cities.unshift(state.userLocation)
					})
					.catch(error => console.error(error))
			})

			// Restore saved state from local storage
			restoreState()
		})

		return {
			state,
			weatherData,
			addCity,
			removeCity,
			reorderCities
		}
	}
}
</script>

<style scoped>
li {
	display: flex;
	align-items: flex-start;
	padding: 20px;
	margin-bottom: 10px;
	background-color: #fff;
	color: #000;
}

.drag-handle {
	width: 20px;
	height: 20px;
	margin-right: 10px;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M20 9h-5v2h5v-2zm-6 6h-8v2h8v-2zm6-10h-14v2h14v-2z'/%3E%3C/svg%3E");
	background-repeat: no-repeat;
	background-size: 20px;
	cursor: move;
}

.city-name {
	flex-grow: 1;
	margin-right: 10px;
	font-weight: bold;
	font-size: 24px;
}

.city-weather {
	font-size: 32px;
	font-weight: bold;
}
.city-descr:first-letter {
	text-transform: uppercase;
}
</style>
