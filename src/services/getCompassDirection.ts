function getCompassDirection(deg: number) {
	let direction: string
	if (deg >= 337) return (direction = 'NNW')
	if (deg >= 315) return (direction = 'NW')
	if (deg >= 292) return (direction = 'WNW')
	if (deg >= 270) return (direction = 'W')
	if (deg >= 247) return (direction = 'WSW')
	if (deg >= 225) return (direction = 'SW')
	if (deg >= 180) return (direction = 'SSW')
	if (deg >= 157) return (direction = 'SSE')
	if (deg >= 135) return (direction = 'SE')
	if (deg >= 112) return (direction = 'ESE')
	if (deg >= 90) return (direction = 'E')
	if (deg >= 45) return (direction = 'NE')
	if (deg >= 22) return (direction = 'NNE')
	if (deg >= 0) return (direction = 'N')
}

export default getCompassDirection
