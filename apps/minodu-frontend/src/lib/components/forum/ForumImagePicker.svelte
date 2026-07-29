<script lang="ts">
	import type { Optional } from '$lib/types';

	import cameraIcon from '$lib/assets/camera-icon-dark.png';
	import galleryIcon from '$lib/assets/gallery-icon.png';
	import { language } from '$lib/stores';
	import { t } from '$lib/translations';
	import ForumPickerUnavailableDialog from './ForumPickerUnavailableDialog.svelte';

	export let image: Optional<File> = undefined;

	$: {
		if (!image) clearImage();
	}

	let imageUrl: Optional<string>;
	let galleryInput: HTMLInputElement;
	let cameraInput: HTMLInputElement;
	let showUnavailableDialog: boolean = false;

	const PICKER_TIMEOUT_MS = 3000;

	function handleCapture(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file && file.type.startsWith('image/')) {
			imageUrl = URL.createObjectURL(file);
			image = file;
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

	export function clearImage() {
		if (imageUrl) {
			URL.revokeObjectURL(imageUrl);
			imageUrl = undefined;
			image = undefined;
		}
	}
</script>

<div class="image-picker-container">
	{#if !imageUrl}
		<input
			bind:this={galleryInput}
			type="file"
			accept="image/*"
			onchange={(e) => handleCapture(e)}
			style="display: none;"
		/>
		<input
			bind:this={cameraInput}
			type="file"
			accept="image/*"
			capture="environment"
			onchange={(e) => handleCapture(e)}
			style="display: none;"
		/>
		<div class="select-button">
			<button class="shadow" onclick={() => attemptOpen(cameraInput)}>
				<img src={cameraIcon} alt={t('forum.takePhoto', $language)} />
				<span>{t('forum.takePhoto', $language)}</span>
			</button>
		</div>
		<div class="select-button">
			<button class="shadow" onclick={() => attemptOpen(galleryInput)}>
				<img src={galleryIcon} alt={t('forum.galleryPhoto', $language)} />
				<span>{t('forum.galleryPhoto', $language)}</span>
			</button>
		</div>
	{:else}
		<div class="preview">
			<img src={imageUrl} alt="Captured" />
		</div>
		<!-- <button onclick={() => (image = undefined)}>Clear Image</button> -->
	{/if}
</div>

{#if showUnavailableDialog}
	<ForumPickerUnavailableDialog onClose={() => (showUnavailableDialog = false)} />
{/if}

<style>
	.image-picker-container {
		height: 200px;
		display: flex;
		gap: var(--small-padding);
	}

	.select-button {
		width: 50%;
		flex-shrink: 1;
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
		width: 60px;
		height: 60px;
	}

	.preview {
		flex-grow: 1;
		background-color: #ffffff88;
		border-radius: var(--border-radius);
		padding: var(--small-padding);
		text-align: center;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		/* box-shadow: 3px 3px 3px #cccccc; */
	}
</style>
