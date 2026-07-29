<script lang="ts">
	import { Config } from '$lib';
	import { AiServicesApi } from '$lib/apis/ai_services/api';
	import BotMessageElement from '$lib/components/bot/BotMessageElement.svelte';
	import TextToSpeechPlayer from '$lib/components/common/TextToSpeechPlayer.svelte';
	import { Storage } from '$lib/storage';
	import { BotMessageType, type BotMessage, type Optional } from '$lib/types';
	import { afterUpdate, onMount, tick } from 'svelte';
	import type { BackendPost } from '$lib/apis/backend/models/backendPost';
	import BotInputElement from '$lib/components/bot/BotInputElement.svelte';
	import { delay, streamResponseGenerator, waitForAnimationFrame } from '$lib/utils';
	import { fly } from 'svelte/transition';

	import trashIcon from '$lib/assets/trash-icon-white.png';
	import crossIcon from '$lib/assets/cross_icon_white.png';
	import { goto } from '$app/navigation';
	import { language } from '$lib/stores';
	import { t } from '$lib/translations';
	import ExplainPageButton from '$lib/components/common/ExplainPageButton.svelte';

	import explainPageFr from '$lib/assets/audio/s4_chatbot_fr.mp3';
	import explainPageKb from '$lib/assets/audio/s4_chatbot_kb.mp3';

	export let post: Optional<BackendPost> = undefined;
	export let saveChat: boolean;

	let messages: BotMessage[] = [];
	let ttsPlayer: TextToSpeechPlayer;
	let conversation: string = '';
	let generating = false;
	let scrollContainer: HTMLDivElement;

	let showPanel: boolean = false;

	const TRANSITION_TIME = 300;

	onMount(async () => {
		if (saveChat) messages = Storage.chatMessages;
		showPanel = true;
	});

	afterUpdate(() => {
		if (messages.length == 0) {
			generateWelcomeMessage();
		}
	});

	$: generating = messages.reduce((prev, val) => prev || !val.final, false);
	$: conversation = messages.reduce((acc, val) => {
		return `${acc} \n ${val.type == BotMessageType.USER ? 'USER' : 'BOT'}: ${val.text} \n`;
	}, '');

	let streamAbortController: Optional<AbortController>;

	async function submitMessage(message: string) {
		messages = [...messages, { text: message, type: BotMessageType.USER, final: true }];

		if (post === undefined) Storage.chatMessages = messages;

		await waitForAnimationFrame();

		scrollContainer.scrollTo({
			top: scrollContainer.scrollHeight,
			behavior: 'smooth'
		});

		await requestAnswer(message, conversation);

		scrollContainer.scrollTo({
			top: scrollContainer.scrollHeight,
			behavior: 'smooth'
		});

		if (saveChat) Storage.chatMessages = messages;
	}

	async function generateWelcomeMessage() {
		let welcome: BotMessage = {
			text: '',
			type: BotMessageType.BOT,
			final: false,
			audio: post && { fr: post!.attachment, kb: post!.attachment_kb }
		};
		messages = [...messages, welcome];

		try {
			streamAbortController = new AbortController();
			let stream = streamResponseGenerator(
				await AiServicesApi.getWelcomeMessageStream(Config.language, post?.id),
				streamAbortController.signal
			);

			for await (const chunk of stream) {
				welcome.text += chunk;
				messages = messages;
			}
		} finally {
			welcome.final = true;
			messages = messages;
			streamAbortController = undefined;
		}
	}

	async function requestAnswer(question: string, conversation: string) {
		let response = { text: '', type: BotMessageType.BOT, final: false };
		messages = [...messages, response];
		streamAbortController = new AbortController();

		try {
			const stream = streamResponseGenerator(
				await AiServicesApi.generateRagResponse({
					language: Config.language,
					conversation: conversation,
					question: question,
					source_id: post?.id
				}),
				streamAbortController.signal
			);

			for await (const chunk of stream) {
				response.text += chunk;
				messages = messages;
			}
		} finally {
			response.final = true;
			messages = messages;
			streamAbortController = undefined;
		}
	}

	export function stopAnswer() {
		streamAbortController?.abort();
		streamAbortController = undefined;

		let currentMessage = messages.length > 0 ? messages.slice(-1)[0] : undefined;
		if (currentMessage) {
			currentMessage.final = true;
			messages = messages;
		}
	}

	function clearChat() {
		messages = [];
		if (saveChat) Storage.chatMessages = undefined;
	}

	async function closeBot() {
		showPanel = false;
		await delay(TRANSITION_TIME);
		goto('/agriculture');
	}
</script>

<div class="chatbot-page">
	{#if showPanel}
		<div
			class="scroll-container"
			bind:this={scrollContainer}
			transition:fly={{ y: '100%', duration: TRANSITION_TIME }}
		>
			<button class="close-button" onclick={() => closeBot()}>
				<img src={crossIcon} alt={t('alt.closeDialog', $language)} />
			</button>
			<div class="message-container content-width">
				<ul>
					{#each messages as msg, i (i)}
						<li>
							<BotMessageElement message={msg} {ttsPlayer} onCancelResponse={stopAnswer} />
						</li>
					{/each}
					{#if messages.length > 0 && !post}
						<li>
							<div class="reset-button-container">
								<button class="reset-button long shadow" onclick={clearChat}>
									<img src={trashIcon} alt={t('alt.clearChatIcon', $language)} />
									<span>{t('action.clearChat', $language)}</span>
								</button>
							</div>
						</li>
					{/if}
				</ul>
				{#if messages.length == 0}
					<div class="no-data">
						<p>{t('chatbot.noMessages', $language)}</p>
					</div>
				{/if}
			</div>
			<BotInputElement onMessageSubmitted={submitMessage} enabled={!generating} />
		</div>
		<ExplainPageButton audioFr={explainPageFr} audioKb={explainPageKb} />
	{/if}
	<TextToSpeechPlayer bind:this={ttsPlayer} />
</div>

<style>
	.chatbot-page {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 10;
		backdrop-filter: blur(2px);
	}

	.message-container {
		padding: var(--page-padding);
		margin-bottom: calc(var(--page-padding) + var(--button-size));
		box-sizing: border-box;
		margin-top: 150px;
	}

	.scroll-container {
		bottom: 0;
		left: 0;
		right: 0;
		top: auto;
		height: 100%;
		background-color: #c3eed9;
		border-radius: var(--border-radius);
	}

	.reset-button-container {
		display: flex;
		justify-content: center;
		width: 100%;
	}

	.reset-button {
		background-color: #cc604b;
		--box-shadow-color: #8c4a3c;
		margin: var(--small-padding);
		padding: 0 var(--small-padding);
		display: flex;
		color: white;
		width: 160px;
		align-items: center;
		justify-content: space-between;
	}

	.reset-button img {
		width: 30px;
		height: 30px;
	}

	.reset-button span {
		flex-grow: 1;
		text-align: center;
	}

	.close-button {
		position: fixed;
		top: 0;
		display: flex;
		justify-content: center;
		padding: var(--small-padding);
		height: var(--button-size);
		width: 100%;
		background: #6c9e85;
		border-radius: var(--border-radius) var(--border-radius) 0 0;
	}

	.close-button img {
		width: auto;
	}
</style>
