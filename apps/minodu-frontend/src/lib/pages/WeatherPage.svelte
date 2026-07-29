<script lang="ts">
	import { language } from '$lib/stores';
	import { t } from '$lib/translations';

	import type { BackendWeather } from '$lib/apis/backend/models/backendWeather';
	import { onMount } from 'svelte';
	import { BackendApi } from '$lib/apis/backend/api';
	import LoadingSpinner from '$lib/components/common/LoadingSpinner.svelte';
	import { pickRandom } from '$lib/utils';
	import { WeatherAirPressure } from '$lib/types';
	import FloatingButton from '$lib/components/common/FloatingButton.svelte';
	import TextToSpeechPlayer from '$lib/components/common/TextToSpeechPlayer.svelte';

	import compassBackground from '$lib/assets/wind_compass.png';
	import compassNeedle from '$lib/assets/compass_needle.png';

	import cloudRain from '$lib/assets/cloud_rain.webp';
	import cloudSun from '$lib/assets/cloud_sun.webp';
	import cloudCovered from '$lib/assets/cloud_covered.webp';
	import cloudSunny from '$lib/assets/cloud_sunny.webp';

	import treeWind0 from '$lib/assets/tree_wind0.webp';
	import treeWind1 from '$lib/assets/tree_wind1.webp';
	import treeWind2 from '$lib/assets/tree_wind2.webp';
	import treeWind3 from '$lib/assets/tree_wind3.webp';

	import soilDry from '$lib/assets/soil-dry.png';
	import soilVeryDry from '$lib/assets/soil-very-dry.png';
	import soilMoist from '$lib/assets/soil-moist.png';
	import soilVeryMoist from '$lib/assets/soil-very-moist.png';

	import weatherBird from '$lib/assets/weather_bird.webp';
	import pressureLine from '$lib/assets/weather_pressure_line.png';
	import weatherArrow from '$lib/assets/weather_arrow_up.png';

	import thermometer1 from '$lib/assets/thermometer1.png';
	import thermometer2 from '$lib/assets/thermometer2.png';
	import thermometer3 from '$lib/assets/thermometer3.png';
	import thermometer4 from '$lib/assets/thermometer4.png';
	import thermometer5 from '$lib/assets/thermometer5.png';

	import speakWeatherButton from '$lib/assets/weather-speak-button.png';
	import speakWeatherButtonPressed from '$lib/assets/weather-speak-button-pressed.png';

	let weather: BackendWeather | undefined;

	let ttsPlayer: TextToSpeechPlayer;
	let ttsSpeaking: boolean = false;

	onMount(async () => {
		weather = await BackendApi.getWeatherCurrent();
	});

	$: loading = weather === undefined;
	$: cloud =
		weather?.pressure != null &&
		weather?.humidity1 != null &&
		getCloudIcon(weather.pressure, weather.humidity1);
	$: wind = weather?.wind_speed != null && getWindIcon(weather.wind_speed);
	$: soil = weather?.humidity1 != null && getHumidityIcon(weather.humidity1);

	$: pressure = weather?.pressure != null && getPressureLevel(weather.pressure);
	$: thermometer = weather?.temperature1 != null && getTemperatureIcon(weather.temperature1);

	function toggleSpeakWeather() {
		if (ttsSpeaking) ttsPlayer.stop();
		else if (weather && typeof weather.description === 'string') {
			ttsPlayer.speak(weather.description);
		}
	}

	function format(val: number | null) {
		return val == null ? 'NaN' : Math.round(val);
	}

	function calcRainLikelihood(RH: number, P: number): number {
		// Dew point depression (T cancels out)
		const D = (100 - RH) / 5;

		// Lifting Condensation Level in meters
		const LCL = Math.max(0, 125 * D);

		// Pressure deviation from standard (1013.25 hPa)
		const Pfactor = (1013.25 - P) / 10;

		// Score: 70% driven by humidity, 30% by pressure
		let score = ((RH - 50) / 50) * 70 + Pfactor * 3;
		score = Math.min(100, Math.max(0, score));

		return score;
	}

	function getCloudIcon(airPressure: number, humidity: number): string {
		const score = calcRainLikelihood(humidity, airPressure);

		if (score < 30) {
			return cloudSun;
		} else if (score < 55) {
			return cloudCovered;
		} else if (score < 75) {
			return cloudCovered;
		} else {
			return cloudRain;
		}
	}

	function getTemperatureIcon(temperature: number): string {
		if (temperature < 23) return thermometer1;
		else if (temperature < 27) return thermometer2;
		else if (temperature < 31) return thermometer3;
		else if (temperature < 35) return thermometer4;
		else return thermometer5;
	}

	function getPressureLevel(airPressure: number): WeatherAirPressure {
		if (airPressure < 1000) {
			return WeatherAirPressure.LOW;
		} else if (airPressure < 1014) {
			return WeatherAirPressure.MEDIUM;
		} else {
			return WeatherAirPressure.HIGH;
		}
	}

	function getHumidityIcon(humidity: number): string {
		if (humidity < 25) {
			return soilVeryDry;
		} else if (humidity < 50) {
			return soilDry;
		} else if (humidity < 80) {
			return soilMoist;
		} else {
			return soilVeryMoist;
		}
	}

	function getWindIcon(windSpeed: number): string {
		if (windSpeed < 3.6) {
			return treeWind0;
		} else if (windSpeed < 10.8) {
			return treeWind1;
		} else if (windSpeed < 21.6) {
			return treeWind2;
		} else {
			return treeWind3;
		}
	}
</script>

<div>
	<div class="scroll-container">
		{#if loading}
			<LoadingSpinner text={t('weather.loadingText', $language)} />
		{:else}
			{#if !weather}
				<LoadingSpinner text={t('weather.loadingText', $language)} />
			{:else}
				<div class="weather-container content-width">
					{#if cloud}
						<div class="cloud">
							<img src={cloud} alt={t('weather.cloud', $language)} />
						</div>
					{/if}
					{#if weather.wind_direction}
						<div class="compass" style="background-image: url({compassBackground}">
							<img
								class="needle"
								src={compassNeedle}
								alt={t('alt.compassNeedle', $language)}
								style="--wind-angle: {weather.wind_direction}deg"
							/>
							<span class="label">{format(weather.wind_direction)}°</span>
						</div>
					{/if}
					{#if soil}
						<div class="soil">
							<img src={soil} alt={t('alt.soilImage', $language)} />
							<span class="label">{format(weather.humidity1)}%</span>
						</div>
					{/if}
					{#if wind}
						<div class="tree" style:margin-bottom={wind == treeWind3 ? '-30px' : 'none'}>
							<img src={wind} alt={t('alt.windTree', $language)} />
							<span class="label">{format(weather.wind_speed)} km/h</span>
						</div>
					{/if}
					{#if pressure !== undefined}
						<div class="pressure">
							<div class="lines">
								<img src={pressureLine} alt={t('alt.pressureLine', $language)} />
								<img src={pressureLine} alt={t('alt.pressureLine', $language)} />
								<img src={pressureLine} alt={t('alt.pressureLine', $language)} />
							</div>
							<div class="arrow {`pos-${pressure}`}">
								<img src={weatherArrow} alt={t('weather.pressureArrow', $language)} />
							</div>
							<div class="bird {`pos-${pressure}`}">
								<img src={weatherBird} alt={t('weather.bird', $language)} />
							</div>
							<span class="label">{format(weather.pressure)} hPa</span>
						</div>
					{/if}
					{#if thermometer}
						<div class="thermometer">
							<img src={thermometer} alt={t('weather.thermometer', $language)} />
							<span class="label">{format(weather.temperature1)} °C</span>
						</div>
					{/if}
				</div>
			{/if}
			{#if weather.description != null}
				<FloatingButton
					icon={ttsSpeaking ? speakWeatherButtonPressed : speakWeatherButton}
					onclick={toggleSpeakWeather}
				/>
			{/if}
		{/if}
	</div>
	<TextToSpeechPlayer bind:this={ttsPlayer} bind:speaking={ttsSpeaking} />
</div>

<style>
	.scroll-container {
		/* background-color: #e9f6fb; */
		background: linear-gradient(to top, var(--ground-color) 33%, #aedef2 38%);
		--ground-color: #eca86b;
	}

	.weather-container {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.compass {
		position: absolute;
		top: 0%;
		right: 10%;
		width: 200px;
		height: 200px;
		background-size: contain;
		background-repeat: no-repeat;
		background-position: center;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.compass .needle {
		width: 18%;
		height: 18%;
		object-fit: contain;
		animation: jitter 1s infinite alternate;
	}

	.compass .label {
		top: 20%;
		right: 10%;
		background-color: #666666;
	}

	@keyframes jitter {
		0%,
		100% {
			transform: rotate(var(--wind-angle));
		}
		20% {
			transform: rotate(calc(var(--wind-angle) - 4deg));
		}
		40% {
			transform: rotate(calc(var(--wind-angle) + 2deg));
		}
		60% {
			transform: rotate(calc(var(--wind-angle) - 3deg));
		}
		80% {
			transform: rotate(calc(var(--wind-angle) + 5deg));
		}
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.cloud {
		position: absolute;
		width: 250px;
		height: 250px;
		left: 5%;
		top: 15%;
	}

	.tree {
		position: absolute;
		bottom: calc(var(--header-height) + 10% + 60px);
		left: 5%;
		height: 240px;
		width: 240px;
	}

	.tree .label {
		bottom: 20%;
		left: 0;
		background-color: #278a58;
	}

	.soil {
		position: absolute;
		bottom: calc(var(--header-height) + 10%);
		width: 300px;
		left: 5%;
	}

	.soil .label {
		bottom: 0;
		right: 10%;
		background-color: #eb8f43;
	}

	.pressure {
		position: absolute;
		right: 5%;
		bottom: 45%;
		height: 200px;
	}

	.pressure .bird {
		position: absolute;
		width: 100px;
		height: 100px;
		margin-top: -50px;
		right: 50%;
		transform: translate(50%);
	}

	.pressure .bird.pos-0 {
		top: 100;
	}

	.pressure .bird.pos-1 {
		top: 50%;
	}

	.pressure .bird.pos-2 {
		top: 0%;
	}

	.pressure .lines {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
	}

	.pressure .lines img {
		height: 8px;
	}

	.pressure .arrow {
		position: absolute;
		width: 100%;
		height: 100px;
		margin-top: -50px;
	}

	.pressure .arrow.pos-0 {
		top: 10%;
		transform: rotate(180deg);
	}

	.pressure .arrow.pos-1 {
		display: none;
	}

	.pressure .arrow.pos-2 {
		top: 90%;
	}

	.pressure .label {
		bottom: -80px;
		left: 18%;
		background-color: #663929;
	}

	.thermometer {
		position: absolute;
		top: 5%;
		left: 10%;
		width: 80px;
		height: 80px;
	}

	.thermometer .label {
		right: -40px;
		bottom: -10px;
		background-color: #47bbf7;
	}

	.label {
		position: absolute;
		background-color: red;
		border-radius: var(--border-radius);
		padding: 5px var(--small-padding);
		color: white;
		white-space: nowrap;
		font-weight: bold;
		font-size: 18px;
	}
</style>
