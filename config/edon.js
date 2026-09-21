/* Interacoes dos recursos customizados (tela 0):
   - Recurso 1: cards OnClick
   - Recurso 2: infografico vertical
   A delegacao de eventos no document e necessaria porque a plataforma injeta
   o HTML das telas depois do carregamento inicial. */
(function () {
	'use strict';

	var SELECTORS = {
		cardTrigger: '.onclick-card__trigger',
		root: '.vertical-infographic',
		timeline: '.vertical-infographic__timeline',
		item: '.vertical-infographic__item',
		play: '.vertical-infographic__play',
		panel: '.vertical-infographic__panel',
		rewind: '.vertical-infographic__rewind',
		rewindButton: '.vertical-infographic__rewind-button'
	};

	var OPEN_CLASS = 'is-open';
	var START_CLASS = 'is-start';
	var CLOSING_CLASS = 'is-closing';

	/* Posiciona o elemento no topo da area visivel. O espaco reservado para o
	   header fica no CSS (scroll-margin-top), evitando calculo de layout aqui. */
	function scrollToElement(element) {
		if (!element || typeof element.scrollIntoView !== 'function') {
			return;
		}

		try {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		} catch (error) {
			element.scrollIntoView(true);
		}
	}

	/* O card tem dois gatilhos (face e aba lateral) para o mesmo conteudo,
	   conforme o layout; ambos refletem o estado em aria-expanded. */
	function toggleCard(trigger) {
		var card = trigger.closest('.onclick-card');
		var isOpen = card.classList.contains(OPEN_CLASS);
		var triggers = card.querySelectorAll(SELECTORS.cardTrigger);

		card.classList.toggle(OPEN_CLASS, !isOpen);

		if (isOpen) {
			playClosingAnimation(card);
		}

		Array.prototype.forEach.call(triggers, function (item) {
			item.setAttribute('aria-expanded', String(!isOpen));
			if (item.classList.contains('onclick-card__tab')) {
				item.setAttribute('aria-label', (isOpen ? 'Abrir' : 'Fechar') + ' conteúdo de ' + cardName(card));
			}
		});
	}

	/* Mantem o painel visivel durante a animacao de fechamento. */
	function playClosingAnimation(card) {
		var panel = card.querySelector('.onclick-card__panel');

		card.classList.add(CLOSING_CLASS);

		var finish = function () {
			card.classList.remove(CLOSING_CLASS);
			panel.removeEventListener('animationend', finish);
		};

		panel.addEventListener('animationend', finish);
		window.setTimeout(finish, 600);
	}

	function cardName(card) {
		var title = card.querySelector('.onclick-card__title');

		return title ? title.textContent.trim() : '';
	}

	/* Enquanto nenhum item estiver aberto, o primeiro icone fica centralizado
	   no recurso; ao abrir, ele assume a lateral esquerda da linha do tempo. */
	function updateStartState(root) {
		var timeline = root.querySelector(SELECTORS.timeline);

		if (timeline) {
			timeline.classList.toggle(START_CLASS, !root.querySelector(SELECTORS.item + '.' + OPEN_CLASS));
		}
	}

	/* Libera o proximo icone da sequencia ou, no ultimo item, o botao que
	   retorna ao inicio do infografico. */
	function revealNextStep(item) {
		var next = item.nextElementSibling;

		if (next && next.classList.contains('vertical-infographic__item')) {
			next.style.display = 'block';
			return;
		}

		var rewind = item.closest(SELECTORS.root).querySelector(SELECTORS.rewind);

		if (rewind) {
			rewind.hidden = false;
		}
	}

	function toggleInfographicItem(trigger) {
		var item = trigger.closest(SELECTORS.item);
		var panel = item.querySelector(SELECTORS.panel);
		var isExpanded = trigger.getAttribute('aria-expanded') === 'true';

		trigger.setAttribute('aria-expanded', String(!isExpanded));
		panel.hidden = isExpanded;
		item.classList.toggle(OPEN_CLASS, !isExpanded);
		updateStartState(item.closest(SELECTORS.root));

		if (isExpanded) {
			return;
		}

		revealNextStep(item);
		scrollToElement(panel);
	}

	document.addEventListener('click', function (event) {
		var target = event.target;

		if (!target || typeof target.closest !== 'function') {
			return;
		}

		var cardTrigger = target.closest(SELECTORS.cardTrigger);

		if (cardTrigger) {
			toggleCard(cardTrigger);
			return;
		}

		var play = target.closest(SELECTORS.play);

		if (play) {
			toggleInfographicItem(play);
			return;
		}

		var rewindButton = target.closest(SELECTORS.rewindButton);

		if (rewindButton) {
			/* Retorna ao primeiro icone mantendo os conteudos ja exibidos. */
			scrollToElement(rewindButton.closest(SELECTORS.root).querySelector(SELECTORS.item));
		}
	});
})();
