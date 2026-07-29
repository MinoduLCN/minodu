import type { Language, Optional } from './types';

type TranslationStrings = {
	[key: string]: {
		fr: string;
		kb: string;
	};
};

const translations: TranslationStrings = {
	// Navigation
	'nav.home': {
		fr: 'Accueil',
		kb: 'kpaaŋ daa mʋʋ'
	},
	'nav.forum': {
		fr: 'Forum',
		kb: ' tɔm kɩkpɛŋdʋ lone'
	},
	'nav.weather': {
		fr: 'Météo',
		kb: 'ɛjaɖɛ́ alɩwatʋ lɔ́ŋsɩŋɖɛ́'
	},
	'nav.agriculture': {
		fr: 'Agriculture',
		kb: 'haɖaʋ tɔm lone'
	},
	'nav.market': {
		fr: 'Marché',
		kb: 'kɩyakʋ lone'
	},

	// Chatbot
	'chatbot.title': {
		fr: 'Chatbot',
		kb: 'tɔm coziyu'
	},
	'chatbot.question': {
		fr: 'Question',
		kb: 'Tɔmbɔsʋʋ'
	},
	'chatbot.answer': {
		fr: 'Réponse',
		kb: 'Tɔm cozuu'
	},
	'chatbot.noMessages': {
		fr: "Il n'y a pas encore de messages dans cette conversation",
		kb: 'Tɔm natɩyʋ fɛɩ ñɩnɛ'
	},
	'chatbot.you': {
		fr: 'Vous',
		kb: 'Mɩ'
	},
	'chatbot.botName': {
		fr: 'Minodu Bot',
		kb: 'Minodu taŋ'
	},
	'chatbot.cancelButton': {
		fr: 'Annuler la réponse',
		kb: 'Tɔm sɩsʋʋ'
	},

	// Actions
	'action.record': {
		fr: 'Enregistrer',
		kb: 'Tɔm sɩʋ'
	},
	'action.stop': {
		fr: 'Arrêter',
		kb: 'Sɩsʋʋ'
	},
	'action.cancel': {
		fr: 'Annuler',
		kb: 'Tɔm sɩsʋʋ'
	},
	'action.send': {
		fr: 'Envoyer',
		kb: 'Yekɩnaʋ'
	},
	'action.submit': {
		fr: 'Soumettre',
		kb: 'Yekɩnaʋ'
	},
	'action.clearChat': {
		fr: 'Effacer le chat',
		kb: 'Tɔm hɩsʋʋ'
	},
	'action.ok': {
		fr: 'Ok',
		kb: 'Pɩmaɣ'
	},
	'action.delete': {
		fr: 'Supprimer',
		kb: 'hɩsʋʋ'
	},

	// Forum
	'forum.loadingText': {
		fr: 'Chargement des messages',
		kb: 'Pɩɖɩɩna tɩsʋʋ'
	},
	'forum.noPosts': {
		fr: 'Pas encore de messages. Cliquez sur le bouton ci-dessous pour commencer une conversation.',
		kb: 'Tɔm natʋyʋ fɛɩ cɩnɛ. ɛ-ñɩʋ hayɩ piye yɔɔ nɛ ɛ-baazɩ yɔɔdʋʋ.'
	},
	'forum.processingFile': {
		fr: 'Traitement du fichier',
		kb: 'Tɔm takayaa ɖaanʋʋ'
	},
	'forum.errorProcessingFile': {
		fr: 'Erreur lors du traitement du fichier',
		kb: 'Tɔm takaya ɖaanʋʋ kizaɣ'
	},
	'forum.createAuthor': {
		fr: 'Créer un auteur',
		kb: 'Lɩzɩ bɩʋ tʋ́'
	},
	'forum.name': {
		fr: 'Nom',
		kb: 'Hɩɖɛ'
	},
	'forum.avatar': {
		fr: 'Avatar',
		kb: 'Ãjaʋ'
	},
	'forum.yourName': {
		fr: 'Votre nom',
		kb: 'Na- Hɩɖɛ'
	},
	'forum.deleteAuthor': {
		fr: 'Supprimer le profil ?',
		kb: 'Bɩʋ tʋ tɔm hɩsʋʋ'
	},
	'forum.transcription': {
		fr: 'Transcription',
		kb: 'Tɔm maʋ'
	},
	'forum.deletePost': {
		fr: 'Supprimer le message',
		kb: 'Tɔm hɩsʋʋ'
	},
	'forum.errorFileTooLarge': {
		fr: 'Le fichier est trop volumineux (max 5 Mo)',
		kb: 'Tɔm takayaa kɩlɩ yʋŋ  (pɩtaaɖɛ Mo wa kagbaŋzɩ yɔɔ)'
	},
	'forum.errorFileUpload': {
		fr: "Erreur lors de l'envoi du fichier",
		kb: 'Tɔm takayaa tɩɩnaʋ katɩ kaɖɛ'
	},
	'forum.errorTextTooLong': {
		fr: 'Le texte est trop long (max 5000 caractères)',
		kb: 'Tɔm kɩmatʋ kɩlɩ ɖaalʋʋ (pɩtaaɖɛ tɔmbe kotokɩŋ kagbaŋzɩ yɔɔ) '
	},
	'forum.errorCreatePost': {
		fr: 'Erreur lors de la création du message',
		kb: 'Tɔm lɩzʋʋ katɩ kaɖɛ'
	},
	'forum.takePhoto': {
		fr: 'Prendre une photo',
		kb: 'kɛlɛm-kɛlɛm kpaaʋ'
	},
	'forum.galleryPhoto': {
		fr: 'Galerie de photos',
		kb: 'kɛlɛm-kɛlɛm naa kpowu'
	},
	'forum.pickerUnavailableTitle': {
		fr: 'Sélecteur de fichier indisponible',
		kb: 'Sélecteur de fichier indisponible'
	},
	'forum.pickerUnavailableBody': {
		fr: "Votre navigateur ne permet pas de sélectionner un fichier. Veuillez ouvrir le site dans un navigateur (Chrome, Firefox, Safari) au lieu d'une page de connexion Wi-Fi.",
		kb: "Votre navigateur ne permet pas de sélectionner un fichier. Veuillez ouvrir le site dans un navigateur (Chrome, Firefox, Safari) au lieu d'une page de connexion Wi-Fi."
	},
	'forum.recordAudio': {
		fr: "Enregistrer l'audio",
		kb: 'tɔm kiwelezitu kpaaʋ'
	},

	// Agriculture
	'agriculture.loadingText': {
		fr: 'Chargement en cours',
		kb: 'Pɩɖɩɩna tɩsʋʋ'
	},
	'agriculture.noPosts': {
		fr: 'Pas de messages dans la catégorie sélectionnée. Veuillez sélectionner une autre catégorie.',
		kb: 'Tɔm natʋyʋ fɛɩ cɩnɛ, medeŋdi mɩ se ɛlɛzɩ lone lɛɛɖɛ.'
	},

	// Market
	'market.loadingText': {
		fr: 'Chargement du marché...',
		kb: 'Pɩɖɩɩna tɩsʋʋ Kɩyakʋ tɔm'
	},
	'market.noDemands': {
		fr: 'Pas de demandes de produits disponibles.',
		kb: 'Nɔyʋ tɔbɔsɩ kɩyakʋ woŋdu'
	},
	'market.contact': {
		fr: 'Personne à contacter',
		kb: 'wei ɛbɩzʋʋ eyekina yɔ́'
	},
	'market.phone-icon': {
		fr: "Appelez l'administrateur.",
		kb: 'ɛ-yaa ñʋʋ tʋ'
	},
	'product.demand-image': {
		fr: 'Image du produit demandé',
		kb: 'Woŋdu tɛ kɛlɛm-kɛlɛm'
	},
	'product.demand-hand-product': {
		fr: 'Quantité demandée',
		kb: 'Me-yekɩ mɛŋdɛ pɔzɩtʋ'
	},
	'product.demand-hand-money': {
		fr: 'Prix proposé',
		kb: 'Liidɩye ɛzɩmaɣ pa-ɖʋwɑ'
	},

	// Weather
	'weather.loadingText': {
		fr: 'Chargement de la météo...',
		kb: 'ɛjaɖɛ́ alɩwatʋ lɔ́ŋsɩŋɖɛ́ ɖɩna tɩsʋʋ'
	},
	'weather.cloud': {
		fr: 'Nuage avec précipitations',
		kb: 'Mɩŋtʋ nɛ tɛʋ'
	},
	'weather.pressureArrow': {
		fr: 'Indicateur de pression',
		kb: 'Helim ɖoŋ wɩlɩyʋ'
	},
	'weather.bird': {
		fr: 'Oiseau météo',
		kb: 'ɛjaɖɛ́ alɩwatʋ lɔ́ŋsɩŋɖɛ́ sɩmaɣ'
	},
	'weather.thermometer': {
		fr: 'Thermomètre',
		kb: 'Tɔnʋʋ soŋʋʋ kɩmazɩnaʋ'
	},

	// Accessibility / Alt texts
	'alt.playPauseAudio': {
		fr: "mettre en pause l'audio",
		kb: 'kɩyɔɔdʋtʋ ɖʋʋ'
	},
	'alt.audioProgress': {
		fr: 'Progression audio',
		kb: 'kɩyɔɔdʋtʋ ɖɛnaʋ'
	},
	'alt.speakPageInfo': {
		fr: 'Lire les informations de la page',
		kb: 'takayaɣ taa tɔm kalʋʋ'
	},
	'alt.switchLanguage': {
		fr: 'changer de langue',
		kb: ' kʋnʋŋ lɛɛzʋ'
	},
	'alt.submitForumPost': {
		fr: 'Soumettre le message',
		kb: 'tɔm yekɩnaʋ'
	},
	'alt.deleteForumPost': {
		fr: 'Supprimer le message',
		kb: 'tɔm hɩsʋʋ'
	},
	'alt.chatbotIcon': {
		fr: 'Icône du chatbot',
		kb: 'tɔjʋzɩyʋ ãjaʋ́'
	},
	'alt.avatarOfUser': {
		fr: "Avatar de l'utilisateur",
		kb: 'laɖʋ ãjaʋ́'
	},
	'alt.avatarImage': {
		fr: "Image d'un avatar",
		kb: 'nɔyʋ tɛ kɛlɛm-kɛlɛm'
	},
	'alt.imageFor': {
		fr: 'Image pour',
		kb: 'kɛlɛm-kɛlɛm ŋkʋ'
	},
	'alt.noDescription': {
		fr: 'Pas de description',
		kb: 'kɩkɛɖɩtʋ fɛɩ'
	},
	'alt.tilesShowingApps': {
		fr: '4 tuiles minodu montrant différentes applications',
		kb: 'Minodu tɔm ŋtʋ tɩ-wɩlʋʋ lona ŋdɩ-ŋdɩ yɔ'
	},
	'alt.rainyCloud': {
		fr: 'Un nuage pluvieux dans le ciel',
		kb: 'tɛʋ dɛ mɩŋdʋʋ ɛsɔdaa'
	},
	'alt.speechBubble': {
		fr: 'Deux personnes et une bulle de dialogue',
		kb: 'ɛyaa naalɛ wɛɛ pɔèyɔɔdʋʋ'
	},
	'alt.backForumPost': {
		fr: 'retour',
		kb: 'kɩdʋʋ'
	},
	'alt.createForumPost': {
		fr: 'Créer un nouveau message',
		kb: 'ma tɔm kɩfatʋ'
	},
	'alt.iconAudioPost': {
		fr: 'Icône pour les messages audio',
		kb: 'tɔm kɩyɔɔdɩtʋ tɛ ãjaʋ́'
	},
	'alt.iconImagePost': {
		fr: 'Icône pour les messages photo',
		kb: 'kɛm-kɛlɛm tɔm tɛ ãjaʋ́'
	},
	'alt.iconTextPost': {
		fr: 'Icône pour les messages texte',
		kb: 'tɔm kɩmamatʋ tɛ ãjaʋ́'
	},
	'alt.clearChatIcon': {
		fr: 'Icône pour effacer la conversation',
		kb: 'tɔm cozuu tɛ ãjaʋ́'
	},
	'alt.expand': {
		fr: 'Développer',
		kb: 'tɔm huu'
	},
	'alt.collapse': {
		fr: 'Réduire',
		kb: 'pasɩʋ'
	},
	'alt.categoryIcon': {
		fr: 'Icône de catégorie pour',
		kb: 'nabʋyʋ tɛ ãjaʋ́'
	},
	'alt.cancelResponse': {
		fr: 'Annuler la réponse du chatbot',
		kb: 'tɔm cozɩyʋ tɔm hɩsʋʋ'
	},
	'alt.compassNeedle': {
		fr: 'Aiguille de boussole',
		kb: 'taŋgayɩ wei ɛ-wɩlɩm nɩmɔʋ yɔ́'
	},
	'alt.soilImage': {
		fr: 'Image du sol',
		kb: 'tɛtʋ tɛ ãjaʋ́'
	},
	'alt.windTree': {
		fr: 'Arbre au vent',
		kb: 'heelim taa tɩʋ'
	},
	'alt.pressureLine': {
		fr: 'Ligne de pression',
		kb: 'heelim ɖoŋ tɛ loga'
	},
	'alt.floatingButton': {
		fr: 'Bouton flottant',
		kb: 'kɩñɩɩʋ mɛlɛ-mɛlɛ'
	},
	'alt.closeDialog': {
		fr: 'Fermer le dialogue',
		kb: 'kɛdaɣ ɖɩɩʋ'
	}
};

export function t(key: string, language: Optional<Language>): string {
	if (!language) {
		return '';
	}
	const translation = translations[key];
	if (!translation) {
		console.warn(`Translation missing for key: ${key}`);
		return key;
	}
	return translation[language];
}

export default translations;
