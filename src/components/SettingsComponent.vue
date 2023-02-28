<script setup>
import { ref } from 'vue'
import SvgDraggable from '../assets/SvgDraggable.vue'
import SvgRemove from '../assets/SvgRemove.vue'
import SvgAdd from '../assets/SvgAdd.vue'
const props = defineProps({
	items: []
})
const newCity = ref('')

const emit = defineEmits([
	'remove-item',
	'insert-item',
	'add-city',
	'toggle-settings'
])
const draggingIndex = ref(null)
function dragStartHandler(index, event) {
	draggingIndex.value = index
	event.dataTransfer.setData('text/plain', index)
	event.dataTransfer.effectAllowed = 'move'
}
function dropHandler(index, event) {
	event.preventDefault()
	const draggingItem = props.items[draggingIndex.value]
	emit('remove-item', draggingIndex.value)
	emit('insert-item', index, draggingItem)
	draggingIndex.value = null
}
function addCity() {
	emit('add-city', newCity.value)
	newCity.value = ''
}
</script>

<template>
	<div class="settings__wrapper">
		<div class="settings__title">
			<h4>Settings</h4>
			<button type="button" class="" @click="$emit('toggle-settings')">
				x
			</button>
		</div>
		<ul class="settings__list">
			<li
				class="settings__list-item item"
				v-for="(item, index) in props.items"
				:key="item.id"
				:draggable="true"
				@dragstart="dragStartHandler(index, $event)"
				@dragover.prevent
				@drop="dropHandler(index, $event)"
			>
				<div class="item-title">
					<div class="item-title__icon"><svg-draggable /></div>
					<div class="item-title__text">{{ item.name }}</div>
				</div>
				<button class="item-remove" @click="$emit('remove-item', index)">
					<svg-remove />
				</button>
			</li>
		</ul>
		<div class="settings__new-city">
			<h4 class="new-city__title">Add new city</h4>
			<div class="new-city__actions">
				<input
					class="actions__input"
					type="text"
					v-model.trim="newCity"
					@keydown.enter="addCity"
					placeholder="Add a new city"
				/>
				<button class="btn actions__btn" @click="addCity">
					<svg-add />
				</button>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
.settings__wrapper {
	.settings__ {
		&title {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 8px;
		}
		&list {
			margin-bottom: 16px;
			&-item {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 5px 10px;
				background: #e4e4e4;
				&:not(:last-child) {
					margin-bottom: 10px;
				}
				.item-title {
					display: flex;
					align-items: center;
					column-gap: 10px;
					&__icon {
						display: flex;
					}
				}
				.item-remove {
					background: transparent;
					border: unset;
					width: 30px;
				}
			}
		}
		&new-city {
			.new-city {
				&__title {
					margin-bottom: 8px;
				}
				&__actions {
					display: flex;
					column-gap: 10px;
					.actions__ {
						&input {
							flex: 1 1 auto;
							padding: 5px 10px;
							background: #e4e4e4;
							outline: unset;
							color: #000;
							border: 1px solid gray;
							border-radius: 5px;
						}
						&btn {
							width: 40px;
							display: flex;
							align-items: center;
							justify-content: center;
							background: transparent;
							border: unset;
							cursor: pointer;
						}
					}
				}
			}
		}
	}
}
</style>
