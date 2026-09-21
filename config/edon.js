/* Interacoes dos recursos customizados (tela 0):
   - Recurso 1: cards OnClick
   A delegacao de eventos no document e necessaria porque a plataforma injeta
   o HTML das telas depois do carregamento inicial. */
(function () {
	'use strict';

	var SELECTORS = {
		cardTrigger: '.onclick-card__trigger'
	};

	var OPEN_CLASS = 'is-open';
	var CLOSING_CLASS = 'is-closing';

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

	document.addEventListener('click', function (event) {
		var target = event.target;

		if (!target || typeof target.closest !== 'function') {
			return;
		}

		var cardTrigger = target.closest(SELECTORS.cardTrigger);

		if (cardTrigger) {
			toggleCard(cardTrigger);
		}
	});
})();
