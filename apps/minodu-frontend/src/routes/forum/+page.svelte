<script>
	import ExplainPageButton from '$lib/components/common/ExplainPageButton.svelte';
	import ForumPage from '$lib/pages/ForumPage.svelte';

	import explainPageFr from '$lib/assets/audio/s3_forum_fr.mp3';
	import explainPageKb from '$lib/assets/audio/s3_forum_kb.mp3';
</script>

<div>
	<ForumPage />
	<ExplainPageButton audioFr={explainPageFr} audioKb={explainPageKb} />
</div>
