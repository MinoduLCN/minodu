<script lang="ts">
	import { language } from '$lib/stores';
	import { t } from '$lib/translations';
	import { onMount } from 'svelte';

	export let onClose: () => void;

	let dialog: HTMLDialogElement;

	onMount(() => {
		dialog?.showModal();
	});
</script>

<dialog bind:this={dialog} class="shadow overlay">
	<h2>{t('forum.pickerUnavailableTitle', $language)}</h2>
	<p>{t('forum.pickerUnavailableBody', $language)}</p>
	<div class="button-group">
		<button class="ok long shadow" onclick={() => onClose()}>
			{t('action.ok', $language)}
		</button>
	</div>
</dialog>

<style>
	p {
		padding: var(--small-padding);
		text-align: center;
	}

	button.ok {
		background-color: #ffffff;
		border-radius: var(--border-radius);
		--box-shadow-color: #cccccc;
	}

	.button-group {
		display: flex;
		justify-content: center;
		gap: var(--medium-padding);
	}
</style>
