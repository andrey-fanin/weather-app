<script setup>
import { ref, onMounted, reactive, capitalize, watch, onUnmounted } from 'vue'
import getCompassDirection from '../services/getCompassDirection'
import SettingsComponent from './SettingsComponent.vue'
import SvgGear from '../assets/SvgGear.vue'
import SvgArrowCompass from '../assets/SvgArrowCompass.vue'
import SvgPressure from '../assets/SvgPressure.vue'
import SvgLoader from '../assets/SvgLoader.vue'

const API_KEY = '58d9d2543e0b8c24e232c3fac88f1bcb'
const error = ref('')
const errorText = reactive({
	isExists: 'Please, enter an existing city name.',
	isIncludes: 'This city is already in list.'
})
const isLoading = ref(false)
const state = reactive({
	id: 0,
	cities: [],
	userLocation: null,
	newCity: ''
})
let showSettings = ref(false)
let cityInfoUpdateTimer
function toggleSettings() {
	showSettings.value = !showSettings.value
}
function getCitiesInfo() {
	isLoading.value = true
	const result = Promise.all(
		state.cities.map(async city => {
			const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric`

			// console.log('returnFetch', returnFetch)
			console.log(state.cities)
			return await fetch(url).then(response =>
				response
					.json()
					.then(data => {
						// console.log(data)
						city.country = data?.sys?.country
						city.temp = Math.ceil(data?.main?.temp)
						city.feels = Math.ceil(data?.main?.feels_like)
						city.weather = capitalize(data?.weather[0]?.description)
						city.wind = {
							speed: data?.wind?.speed.toFixed(1),
							direction: getCompassDirection(data?.wind?.deg)
						}
						city.pressure = data?.main?.pressure
						city.humidity = data?.main?.humidity
						city.visibility = data?.visibility
						city.icon = `https://openweathermap.org/img/wn/${data?.weather[0]?.icon}@4x.png`

						// console.log(city)
						// console.log(data?.weather?.icon, 'data?.weather?.icon')
					})
					.catch(e => (error.value = errorText.isExists))
			)
		})
	)
	setTimeout(() => (isLoading.value = false), 1000)
	return result
}
function addCity(newCity) {
	if (
		!state.cities.every(
			item => item.name.toLowerCase() !== newCity.toLowerCase()
		)
	) {
		error.value = errorText.isIncludes
		return null
	}
	isLoading.value = true
	const url = `https://api.openweathermap.org/geo/1.0/direct?q=${newCity}&limit=1&appid=${API_KEY}&units=metric`
	fetch(url)
		.then(response => response.json())
		.then(data => {
			// console.log(data)
			state.cities.push({
				id: state.id++,
				name: data[0].name,
				lat: data[0].lat,
				lon: data[0].lon
			})
			// console.log(state.cities)
			state.newCity = ''
			saveState()
		})
		.catch(e => (error.value = errorText.isExists))
	setTimeout(() => (isLoading.value = false), 1000)
	clearError()
}

function removeCity(fromIndex) {
	state.cities.splice(fromIndex, 1)
	saveState()
}

function insertItem(toIndex, item) {
	state.cities.splice(toIndex, 0, item)
	saveState()
}

function saveState() {
	localStorage.setItem('weather-widget-state', JSON.stringify(state))
}

function restoreState() {
	const savedState = JSON.parse(localStorage.getItem('weather-widget-state'))
	if (savedState) {
		state.cities = savedState.cities
		state.id = savedState.id
	}
}

function clearError() {
	error.value = ''
	console.log('clear error')
}
watch(
	() => state.cities.length,
	() => {
		getCitiesInfo()
	}
)
onMounted(() => {
	isLoading.value = true
	// Restore saved state from local storage
	restoreState()
	// Get user's location and add it to the cities list
	if (!state.cities.length) {
		navigator.geolocation.getCurrentPosition(async position => {
			const url = `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${API_KEY}&units=metric/`
			await fetch(url)
				.then(response => response.json())
				.then(data => {
					console.log(data)
					state.userLocation = {
						id: state.id++,
						name: data?.name,
						lat: data?.coord?.lat,
						lon: data?.coord?.lon
					}
					state.cities.unshift(state.userLocation)
				})
				.catch(e => (error.value = errorText.isExists))
		})
	}

	// getCitiesInfo()
	cityInfoUpdateTimer = window.setInterval(() => {
		getCitiesInfo()
	}, 3600000)
	setTimeout(() => (isLoading.value = false), 1000)
})
onUnmounted(() => {
	clearInterval(cityInfoUpdateTimer)
})
</script>
<template>
	<div class="weather-widget__wrapper">
		<h2 class="weather-widget__heading">Weather Widget</h2>
		<template v-if="!state.cities.length">
			<div class="weather-widget__empty">
				<settings-component
					class="weather-widget__settings"
					:items="state.cities"
					:new-city="state.newCity"
					@remove-item="removeCity"
					@insert-item="insertItem"
					@toggle-settings="toggleSettings"
					@add-city="addCity"
					:error="error"
					@clear-error="clearError"
				/>
			</div>
		</template>
		<ul v-else class="weather-widget__content-list content-list">
			<li
				class="content-item city"
				v-for="(city, index) in state.cities"
				:key="city.id"
			>
				<div
					v-if="isLoading && (index !== 0 || !showSettings)"
					class="city-loader"
				>
					<svg-loader />
				</div>
				<div v-else class="city-wrapper">
					<div class="city-title">
						<div class="city-title__name">
							{{ city?.name }}, {{ city?.country }}
						</div>
						<div
							class="city-title__gear"
							@click="toggleSettings"
							v-if="index === 0"
						>
							<svg-gear />
						</div>
						<div class="settings" v-if="index === 0" v-show="showSettings">
							<settings-component
								:items="state.cities"
								@remove-item="removeCity"
								@insert-item="insertItem"
								@add-city="addCity"
								@toggle-settings="toggleSettings"
								:error="error"
								@clear-error="clearError"
							/>
						</div>
					</div>
					<div class="city-weather">
						<img class="city-weather__icon" :src="city?.icon" alt="#" />
						<div class="city-weather__temperature">{{ city?.temp }}°C</div>
					</div>
					<div class="city-descr">
						<span class="">Feels like {{ city?.feels }}°C.</span>
						<span class="">{{ city?.weather }}.</span>
					</div>
					<div class="city-special">
						<div class="city-wind">
							<div class="city-wind__speed">
								<div class="city-wind__speed-icon">
									<svg-arrow-compass />
								</div>
								<span class="city-wind__speed-text">
									{{ city?.wind?.speed }}m/s
								</span>
							</div>
							<div class="city-wind__direction">
								{{ city?.wind?.direction }}
							</div>
						</div>
						<div class="city-pressure">
							<div class="city-pressure__icon">
								<svg-pressure />
							</div>
							<div class="city-pressure__text">{{ city?.pressure }}hpa</div>
						</div>
						<div class="city-humidity">Humidity: {{ city?.humidity }}%</div>
					</div>
				</div>
			</li>
		</ul>
	</div>
</template>

<style lang="scss" scoped>
.weather-widget__wrapper {
	.weather-widget__heading {
		mix-blend-mode: difference;
	}
	width: 290px;
	min-height: 319px;
	box-sizing: border-box;
	.weather-widget__empty {
		background-color: #fff;
		padding: 20px;
	}
	.content-item {
		display: flex;
		align-items: flex-start;
		padding: 20px;
		margin-bottom: 10px;
		background-color: #fff;
		color: #000;
		flex-direction: column;
		text-align: left;
		justify-content: flex-start;
		gap: 5px;
		position: relative;
		min-height: 319px;
		border-radius: 10px;
		filter: drop-shadow(2px 2px 5px black);
		.city {
			&-loader {
				margin: auto auto;
			}
			&-wrapper {
				display: flex;
				flex-direction: column;
				gap: 5px;
				//transition: 0.3s;
				opacity: 0;
				animation: fadeIn 0.5s forwards;
			}
			&-title {
				display: flex;
				justify-content: space-between;
				align-items: center;
				width: 100%;
				&__name {
					margin-right: 10px;
					font-weight: bold;
					font-size: 24px;
				}
				&__gear {
					width: 20px;
					height: 20px;
					cursor: pointer;
				}
				.settings {
					position: absolute;
					top: 0;
					left: 0;
					background: #fff;
					z-index: 2;
					height: 100%;
					width: 100%;
					box-sizing: border-box;
					padding: 20px;
					overflow-y: auto;
					border-radius: 10px;
				}
			}
			&-weather {
				display: flex;
				align-items: center;
				&__icon {
					filter: drop-shadow(0px 0px 6px #cacaca);
					max-width: 170px;
				}
				&__temperature {
					font-size: 32px;
					font-weight: bold;
				}
			}
			&-descr {
				span:not(:last-child):after {
					content: '\00a0 ';
				}
			}
			&-special {
				display: flex;
				align-items: center;
				justify-content: space-between;
				flex-flow: row wrap;
				width: 100%;
				.city {
					&-wind {
						display: flex;
						align-items: center;
						column-gap: 5px;
						&__speed {
							display: flex;
							align-items: center;
							column-gap: 5px;
							&-icon {
								width: 20px;
								height: 20px;
							}
						}
					}
					&-pressure {
						display: flex;
						align-items: center;
						&__icon {
							width: 30px;
							height: 30px;
						}
					}
				}
			}
		}
	}
}
@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}
</style>
