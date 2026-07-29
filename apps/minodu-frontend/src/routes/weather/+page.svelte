<script>
	import ExplainPageButton from '$lib/components/common/ExplainPageButton.svelte';
	import WeatherPage from '$lib/pages/WeatherPage.svelte';

	import explainPageFr from '$lib/assets/audio/s5_meteo_fr.mp3';
	import explainPageKb from '$lib/assets/audio/s5_meteo_kb.mp3';
</script>

<div>
	<WeatherPage />
	<ExplainPageButton audioFr={explainPageFr} audioKb={explainPageKb} />
</div>
