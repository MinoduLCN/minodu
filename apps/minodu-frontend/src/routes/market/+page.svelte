<script>
	import ExplainPageButton from '$lib/components/common/ExplainPageButton.svelte';
	import MarketPage from '$lib/pages/MarketPage.svelte';

	import explainPageFr from '$lib/assets/audio/s6_marche_fr.mp3';
	import explainPageKb from '$lib/assets/audio/s6_marche_kb.mp3';
</script>

<div>
	<MarketPage />
	<ExplainPageButton audioFr={explainPageFr} audioKb={explainPageKb} />
</div>
