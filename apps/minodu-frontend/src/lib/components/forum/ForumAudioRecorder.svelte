<script lang="ts">
	import type { Optional } from '$lib/types';
	import AudioPlayer from '../common/AudioPlayer.svelte';
	import ForumPickerUnavailableDialog from './ForumPickerUnavailableDialog.svelte';

	import micIcon from '$lib/assets/microphone-icon-dark.png';
	import { language } from '$lib/stores';
	import { t } from '$lib/translations';

	export let blob: Optional<Blob>;

	let fileInput: HTMLInputElement;
	let audioPlayer: AudioPlayer;
	let audioUrl: Optional<string>;
	let showUnavailableDialog: boolean = false;

	const PICKER_TIMEOUT_MS = 100;

	$: if (!blob) {
		reset();
	}

	export async function startRecording() {
		attemptOpen(fileInput);
	}

	export function reset() {
		blob = undefined;
		audioUrl = undefined;
	}

	function handleCapture(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file && file.type.startsWith('audio/')) {
			audioUrl = URL.createObjectURL(file);
			blob = file;
		}
	}

	// When a real file picker opens, the OS takes focus away from the page and
	// window fires `blur`. If that never happens after the click, the browser
	// silently refused (e.g., captive portal webview) — show the fallback dialog.
	function attemptOpen(input: HTMLInputElement) {
		let opened = false;

		const onBlur = () => {
			opened = true;
			cleanup();
		};
		const onVisibility = () => {
			if (document.visibilityState === 'hidden') {
				opened = true;
				cleanup();
			}
		};
		const cleanup = () => {
			window.removeEventListener('blur', onBlur);
			document.removeEventListener('visibilitychange', onVisibility);
		};

		window.addEventListener('blur', onBlur, { once: true });
		document.addEventListener('visibilitychange', onVisibility);

		input.click();

		setTimeout(() => {
			cleanup();
			if (!opened) {
				showUnavailableDialog = true;
			}
		}, PICKER_TIMEOUT_MS);
	}
</script>

<div class="audio-recorder-container">
	{#if audioUrl}
		<div class="audio-preview">
			<div class="audio-player">
				<AudioPlayer audioSource={audioUrl} bind:this={audioPlayer} />
			</div>
		</div>
	{:else}
		<input
			bind:this={fileInput}
			type="file"
			accept="audio/*"
			capture="environment"
			onchange={(e) => handleCapture(e)}
			style="display: none;"
		/>
		<div class="select-button">
			<button onclick={() => attemptOpen(fileInput)}>
				<img src={micIcon} alt={t('forum.recordAudio', $language)} />
				<span>{t('forum.recordAudio', $language)}</span>
			</button>
		</div>
	{/if}
</div>

{#if showUnavailableDialog}
	<ForumPickerUnavailableDialog onClose={() => (showUnavailableDialog = false)} />
{/if}

<style>
	.audio-recorder-container {
		height: 120px;
		display: flex;
		gap: var(--small-padding);
		justify-content: center;
		align-items: center;
	}

	.select-button {
		width: 100%;
		height: 100%;
		flex-grow: 1;
	}

	.select-button button {
		width: 100%;
		height: 100%;
		background-color: #eeeeee;
		text-align: center;
		--box-shadow-color: #cccccc;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: var(--small-padding);
	}

	.select-button img {
		width: 40px;
		height: 40px;
		object-fit: contain;
	}

	.audio-preview {
		width: 100%;
		background-color: #ffffff88;
		height: 100%;
		border-radius: var(--small-padding);
		padding: var(--small-padding);
		box-sizing: border-box;
		display: flex;
		align-items: center;
	}

	.audio-player {
		width: 100%;
	}
</style>
