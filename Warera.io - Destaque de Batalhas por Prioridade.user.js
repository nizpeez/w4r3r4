// ==UserScript==
// @name         Warera.io - Destaque de Batalhas por Prioridade
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  Sistema de 4 cores para batalhas não estreladas: Vermelho (score), Laranja (>35%), Amarelo (20-35%), Verde (<20%).
// @author       Gemini AI & User
// @match        https://app.warera.io/battles
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=warera.io
// ==/UserScript==

(function() {
    'use strict';

    // --- CONFIGURAÇÕES DOS LIMIARES DE DOMÍNIO ---
    const ORANGE_THRESHOLD = 35; // Acima de 35% -> Laranja
    const YELLOW_THRESHOLD = 20; // Entre 20% e 35% -> Amarelo
                                 // Abaixo de 20% -> Verde

    // --- CONSTANTES DE CORES ---
    const starIconPath = "M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z";
    const BORDER_RED = '#E53935';    // Vermelho forte
    const BORDER_ORANGE = '#FF6F00'; // Laranja forte
    const BORDER_YELLOW = '#FDD835'; // Amarelo
    const BORDER_GREEN = '#66BB6A';  // Verde suave

    function highlightBattlesByPriority() {
        const battleCards = document.querySelectorAll('div._1dnmndy6y._1dnmndy113');

        battleCards.forEach(card => {
            if (card.hasAttribute('data-highlight-checked')) return;

            const starIcon = card.querySelector(`svg path[d="${starIconPath}"]`);
            if (starIcon) {
                card.setAttribute('data-highlight-checked', 'true');
                return;
            }

            const scoreContainer = card.querySelector('div._1dnmndy82._1dnmndyfk');
            const dominanceBars = card.querySelectorAll('._1dnmndy23a > div[style*="width:"]');
            if (!scoreContainer || dominanceBars.length < 2) return;
            const scoreSpans = scoreContainer.querySelectorAll('span.agd9b40');
            if (scoreSpans.length < 2) return;

            try {
                let highlightColor = '';

                const score1 = parseInt(scoreSpans[0].textContent.trim(), 10);
                const score2 = parseInt(scoreSpans[1].textContent.trim(), 10);

                // --- LÓGICA DE PRIORIDADE COM 4 CORES ---

                // 1. Vermelho: Score já marcado
                if (score1 > 0 || score2 > 0) {
                    highlightColor = BORDER_RED;
                } else {
                    // Se o score é 0-0, analisa o domínio
                    const dominance1 = parseFloat(dominanceBars[0].style.width);
                    const dominance2 = parseFloat(dominanceBars[1].style.width);
                    const leadingDominance = Math.max(dominance1, dominance2);

                    // 2. Laranja: Ponto iminente
                    if (leadingDominance > ORANGE_THRESHOLD) {
                        highlightColor = BORDER_ORANGE;
                    }
                    // 3. Amarelo: Janela de oportunidade
                    else if (leadingDominance >= YELLOW_THRESHOLD && leadingDominance <= ORANGE_THRESHOLD) {
                        highlightColor = BORDER_YELLOW;
                    }
                    // 4. Verde: Batalha nova
                    else {
                        highlightColor = BORDER_GREEN;
                    }
                }

                if (highlightColor) {
                    card.style.border = `3px solid ${highlightColor}`;
                    card.style.boxShadow = `0 0 10px ${highlightColor}B3`;
                }

                card.setAttribute('data-highlight-checked', 'true');

            } catch (e) {
                return;
            }
        });
    }

    setInterval(highlightBattlesByPriority, 500);

})();