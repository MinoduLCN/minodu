<script lang="ts">
	import explainPageButton from '$lib/assets/explain-page-button.png';
	import explainPageButtonActive from '$lib/assets/explain-page-button-active.png';
	import languageKbButton from '$lib/assets/language-kb-button.png';
	import languageFrButton from '$lib/assets/language-fr-button.png';
	import { language } from '$lib/stores';
	import { t } from '$lib/translations';
	import { onMount, tick } from 'svelte';

	export let audioKb: string;
	export let audioFr: string;

	let audio: HTMLAudioElement;
	let isPlaying: boolean = false;
	let mounted: boolean = false;

	let audioSrc: string | undefined = undefined;

	function languageButtonClicked() {
		language.set($language == 'kb' ? 'fr' : 'kb');
		audio?.pause();
		isPlaying = false;
	}

	async function explainPageButtonClicked() {
		audioSrc = $language == 'kb' ? audioKb : audioFr;

		await tick();

		if (!isPlaying) {
			audio.currentTime = 0;
			audio.play();
			isPlaying = true;
		} else {
			audio.pause();
			isPlaying = false;
		}
	}

	function handleAudioEnded() {
		isPlaying = false;
	}

	// set initial language
	onMount(() => {
		language.refresh();
		mounted = true;
	});
</script>

<div class="explain-page-button-group">
	<div class="content-width">
		<button class="button" onclick={explainPageButtonClicked}>
			<img
				src={isPlaying ? explainPageButtonActive : explainPageButton}
				alt={t('alt.speakPageInfo', $language)}
			/>
		</button>
		{#if mounted}
			<button class="button" onclick={languageButtonClicked}>
				<img
					src={$language === 'kb' ? languageKbButton : languageFrButton}
					alt={t('alt.switchLanguage', $language)}
				/>
			</button>
			<audio bind:this={audio} src={audioSrc} onended={handleAudioEnded} preload="none"> </audio>
		{/if}
	</div>
</div>

<style>
	.explain-page-button-group {
		position: fixed;
		bottom: var(--footer-height);
		left: 0;
		right: 0;
		pointer-events: none;
	}

	.explain-page-button-group .content-width {
		padding: var(--page-padding);
		box-sizing: border-box;
	}

	@media screen and (min-width: 550px) {
		.explain-page-button-group {
			bottom: calc(var(--footer-height) + var(--medium-padding));
		}
	}

	.explain-page-button-group button {
		pointer-events: auto;
	}

	audio {
		display: none;
	}
</style>
