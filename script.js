// ===== 1. DEFINE cardDatabase FIRST =====
const cardDatabase = [
    // --- Charizard ex Line (The Main Attacker) ---
    { id: 1, type: 'pokemon', name: 'Charmander', apiName: 'charmander', hp: 70, energyAttached: [], retreatCost: 1, evolvesFrom: null, attacks: [{ name: "Ember", damage: 30, cost: ["Fire", "Colorless"] }] },
    { id: 2, type: 'pokemon', name: 'Charmeleon', apiName: 'charmeleon', hp: 90, energyAttached: [], retreatCost: 2, evolvesFrom: 'Charmander', attacks: [{ name: "Flare Shot", damage: 60, cost: ["Fire"] }] },
    { id: 3, type: 'pokemon', name: 'Charizard ex', apiName: 'charizard', hp: 330, energyAttached: [], retreatCost: 2, evolvesFrom: 'Charmeleon', attacks: [{ name: "Burning Darkness", damage: 180, cost: ["Fire", "Fire"] }] },

    // --- Pidgeot ex Line (The Search Engine) ---
    { id: 4, type: 'pokemon', name: 'Pidgey', apiName: 'pidgey', hp: 60, energyAttached: [], retreatCost: 1, evolvesFrom: null, attacks: [{ name: "Gust", damage: 10, cost: ["Colorless"] }] },
    { id: 5, type: 'pokemon', name: 'Pidgeot ex', apiName: 'pidgeot', hp: 280, energyAttached: [], retreatCost: 0, evolvesFrom: 'Pidgey', attacks: [{ name: "Blustery Wind", damage: 120, cost: ["Colorless", "Colorless"] }] },

    // --- Noctowl Line (The Meta Support) ---
    { id: 6, type: 'pokemon', name: 'Hoothoot', apiName: 'hoothoot', hp: 70, energyAttached: [], retreatCost: 1, evolvesFrom: null, attacks: [{ name: "Peck", damage: 20, cost: ["Colorless"] }] },
    { id: 7, type: 'pokemon', name: 'Noctowl', apiName: 'noctowl', hp: 100, energyAttached: [], retreatCost: 1, evolvesFrom: 'Hoothoot', attacks: [{ name: "Speed Wing", damage: 60, cost: ["Colorless", "Colorless"] }] },

    // --- Tech Support ---
    { id: 8, type: 'pokemon', name: 'Manaphy', apiName: 'manaphy', hp: 70, energyAttached: [], retreatCost: 1, evolvesFrom: null, attacks: [{ name: "Water Splash", damage: 20, cost: ["Water"] }] },
    { id: 9, type: 'pokemon', name: 'Rotom V', apiName: 'rotom', hp: 190, energyAttached: [], retreatCost: 1, evolvesFrom: null, attacks: [{ name: "Scrap Short", damage: 40, cost: ["Lightning"] }] },

    // Energy
    { id: 10, type: 'energy', name: 'Fire Energy', energyType: 'Fire' }
];

// ===== 2. Game state =====
let gameState = {
    deck: [],
    hand: [],
    active: null,
    bench: [],
    opponentActive: null,
    playerPrizes: 6,
    opponentPrizes: 6,
    turn: 1,
    currentPlayer: 'player',
    gameOver: false,
    winner: null
};

// ===== 3. Cache for images =====
const imageCache = new Map();

// ===== 4. Deck Builder Variables =====
let playerDeck = []; // Only ONE declaration

// ===== 5. DOM Elements (will be set after DOM loads) =====
let handEl, activeEl, benchEl, opponentActiveEl, drawBtn, endTurnBtn, attackBtn, statusEl, playerPrizesEl, opponentPrizesEl, switchBtn;

// ===== 6. ALL FUNCTIONS =====

// Public Pokémon sprite CDN (CORS-friendly).

// ===== FETCH IMAGE HELPER =====
async function getPokemonImage(apiName) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${apiName.toLowerCase()}`);
        const data = await response.json();
        // Returns the high-quality official artwork
        return data.sprites.other['official-artwork'].front_default;
    } catch (error) {
        console.error("Error fetching image for:", apiName, error);
        return 'https://via.placeholder.com/80?text=Poke'; // Fallback image
    }
}

// ===== MODIFIED RENDERING LOGIC =====
// Inside your existing renderCard or createCardElement function:

async function createCardElement(card, isOpponent = false) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${card.type}`;
    if (!isOpponent) cardDiv.draggable = true;

    // Create Image Container
    const imgContainer = document.createElement('div');
    imgContainer.className = 'card-image-container';
    
    const img = document.createElement('img');
    img.className = 'pokemon-image';
    
    // Set placeholder while loading
    img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

    // Fetch Official Artwork from PokéAPI
    if (card.type === 'pokemon' && card.apiName) {
        fetch(`https://pokeapi.co/api/v2/pokemon/${card.apiName.toLowerCase()}`)
            .then(res => res.json())
            .then(data => {
                img.src = data.sprites.other['official-artwork'].front_default;
            })
            .catch(() => {
                img.src = 'https://via.placeholder.com/80?text=Error';
            });
    } else if (card.type === 'energy') {
        img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png'; // Example icon
    }

    imgContainer.appendChild(img);
    cardDiv.appendChild(imgContainer);

    // Add Card Text
    const nameEl = document.createElement('div');
    nameEl.className = 'card-name';
    nameEl.textContent = card.name;
    cardDiv.appendChild(nameEl);

    if (card.hp) {
        const hpEl = document.createElement('div');
        hpEl.className = 'card-hp';
        hpEl.textContent = `HP ${card.hp}`;
        cardDiv.appendChild(hpEl);
    }

    return cardDiv;
}

async function createEnhancedCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${card.type}`;
    
    // Create image container
    const imgContainer = document.createElement('div');
    imgContainer.className = 'card-image-container';

    const img = document.createElement('img');
    img.className = 'pokemon-image';
    
    // Fetch and apply the image asynchronously
    if (card.type === 'pokemon' && card.apiName) {
        img.src = await getPokemonImage(card.apiName);
    } else {
        img.src = 'energy-icon.png'; // Example for energy cards
    }

    imgContainer.appendChild(img);
    cardDiv.appendChild(imgContainer);
    
    // Rest of your card info (name, HP, etc.)
    const nameEl = document.createElement('div');
    nameEl.textContent = card.name;
    cardDiv.appendChild(nameEl);

    return cardDiv;
}

// Replace the old getPokemonSpriteUrl and getPokemonId with this:
const getPokemonSpriteUrl = (pokemonName) => {
  // Map specific meta names to their standard API names if they differ
  const nameMap = {
    'charizard ex': 'charizard',
    'pidgeot ex': 'pidgeot',
    'rotom v': 'rotom'
  };
  
  const finalName = nameMap[pokemonName.toLowerCase()] || pokemonName.toLowerCase();
  
  // Using the name-based official artwork path
  return `https://img.pokemondb.net/artwork/large/${finalName}.jpg`;
};

const getPokemonId = (name) => {
  const idMap = {
    'pikachu': 25,
    'raichu': 26,
    'charmander': 4,
    'charmeleon': 5,
    'bulbasaur': 1,
    'squirtle': 7
  };
  return idMap[name] || 1; // fallback to Bulbasaur
};

async function getCardImageUrl(apiName) {
  if (imageCache.has(apiName)) {
    return imageCache.get(apiName);
  }

  // Use public sprites instead of Pokémon TCG API (which blocks CORS)
  const imageUrl = getPokemonSpriteUrl(apiName);
  imageCache.set(apiName, imageUrl);
  return imageUrl;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function preloadImages() {
    const pokemonCards = cardDatabase.filter(c => c.type === 'pokemon');
    const promises = pokemonCards.map(card => getCardImageUrl(card.apiName));
    await Promise.all(promises);
    renderAll();
}

function renderHand() {
  if (!handEl) return;
  handEl.innerHTML = '';
  
  gameState.hand.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${card.type}`;
    cardEl.draggable = true;
    cardEl.dataset.index = index;

    if (card.type === 'pokemon') {
      // Create image container
      const imgContainer = document.createElement('div');
      imgContainer.className = 'card-image-container';
      
      const img = document.createElement('img');
      img.alt = card.name;
      img.className = 'pokemon-image';
      
      // Set image source
      const imageUrl = getPokemonSpriteUrl(card.apiName);
      img.src = imageUrl;
      
      // Handle image load failure
      img.onerror = () => {
        // Create fallback div with text
        const fallback = document.createElement('div');
        fallback.className = 'image-fallback';
        fallback.textContent = card.name;
        imgContainer.innerHTML = '';
        imgContainer.appendChild(fallback);
      };
      
      img.onload = () => {
        // Ensure container is clean
        imgContainer.innerHTML = '';
        imgContainer.appendChild(img);
      };
      
      // Initially show loading state
      imgContainer.innerHTML = '<div class="image-loading">Loading...</div>';
      
      // Append container
      cardEl.appendChild(imgContainer);
      
      // Add name and HP
      const nameDiv = document.createElement('div');
      nameDiv.className = 'card-name';
      nameDiv.textContent = card.name;
      cardEl.appendChild(nameDiv);
      
      const hpDiv = document.createElement('div');
      hpDiv.className = 'card-hp';
      hpDiv.textContent = `HP: ${card.hp}`;
      cardEl.appendChild(hpDiv);
      
      if (card.evolvesFrom) {
        const evolveDiv = document.createElement('div');
        evolveDiv.className = 'evolves-from';
        evolveDiv.textContent = `Evolves from ${card.evolvesFrom}`;
        cardEl.appendChild(evolveDiv);
      }
    } else if (card.type === 'energy') {
      // Energy cards - use colored background
      const energyColors = {
        'Lightning': '#f1c40f',
        'Fire': '#e74c3c',
        'Grass': '#27ae60',
        'Water': '#3498db',
        'Colorless': '#95a5a6'
      };
      
      const energyDiv = document.createElement('div');
      energyDiv.className = 'energy-symbol';
      energyDiv.style.backgroundColor = energyColors[card.energyType] || '#7f8c8d';
      energyDiv.textContent = card.energyType.charAt(0);
      
      const nameDiv = document.createElement('div');
      nameDiv.className = 'card-name';
      nameDiv.textContent = card.name;
      
      cardEl.appendChild(energyDiv);
      cardEl.appendChild(nameDiv);
    }

    // Drag events
    cardEl.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', index);
      cardEl.style.opacity = '0.5';
    });

    cardEl.addEventListener('dragend', () => {
      cardEl.style.opacity = '1';
    });

    handEl.appendChild(cardEl);
  });
}

function renderActive() {
    if (!activeEl || !switchBtn) return;
    const el = activeEl;
    if (gameState.active) {
        const damage = gameState.active.damage || 0;
        el.innerHTML = `
            <div class="damage-counter">${damage > 0 ? Math.ceil(damage / 10) : ''}</div>
            <div><strong>${gameState.active.name}</strong></div>
            <div>HP: ${gameState.active.hp - damage}/${gameState.active.hp}</div>
            <div>Retreat: ${'●'.repeat(gameState.active.retreatCost)}</div>
            ${gameState.active.energyAttached?.length > 0
                ? `<div class="energy-list">${gameState.active.energyAttached.join(', ')}</div>`
                : ''}
        `;
        el.className = 'pokemon-slot';

        // Make Active slot droppable for Evolutions
        el.addEventListener('dragover', (e) => {
            e.preventDefault();
            const index = e.dataTransfer.getData('text/plain');
            const card = gameState.hand[index];
            if (card?.type === 'pokemon' && card.evolvesFrom === gameState.active.name) {
                el.classList.add('drag-over');
            }
        });

        el.addEventListener('dragleave', () => {
            el.classList.remove('drag-over');
        });

        el.addEventListener('drop', (e) => {
            e.preventDefault();
            el.classList.remove('drag-over');
            const index = e.dataTransfer.getData('text/plain');
            const card = gameState.hand[index];
            if (card?.type === 'pokemon' && card.evolvesFrom === gameState.active.name) {
                evolvePokemon('active', null, card, index);
            } else {
                updateStatus("Can't evolve this Pokémon!");
            }
        });

        updateAttackButton();
        switchBtn.disabled = !(gameState.active && gameState.bench.length > 0);
    } else {
        el.innerHTML = 'Empty';
        el.className = 'pokemon-slot empty';
        if (attackBtn) attackBtn.disabled = true;
        switchBtn.disabled = true;

        // Keep original Active drop behavior
        el.addEventListener('dragover', (e) => {
            e.preventDefault();
            const index = e.dataTransfer.getData('text/plain');
            const card = gameState.hand[index];
            if (card?.type === 'pokemon' && card.evolvesFrom === null) {
                el.classList.add('drag-over');
            }
        });

        el.addEventListener('dragleave', () => {
            el.classList.remove('drag-over');
        });

        el.addEventListener('drop', (e) => {
            e.preventDefault();
            el.classList.remove('drag-over');
            const index = e.dataTransfer.getData('text/plain');
            const card = gameState.hand[index];
            if (card?.type === 'pokemon' && card.evolvesFrom === null) {
                playCardToActive(index);
            }
        });
    }
}

function renderBench() {
    if (!benchEl) return;
    benchEl.innerHTML = '';
    gameState.bench.forEach((p, index) => {
        const el = document.createElement('div');
        el.className = 'pokemon-slot';
        el.dataset.benchIndex = index;

        const damage = p.damage || 0;
        el.innerHTML = `
            <div class="damage-counter">${damage > 0 ? Math.ceil(damage / 10) : ''}</div>
            <div><strong>${p.name}</strong></div>
            <div>HP: ${p.hp - damage}/${p.hp}</div>
            <div>Retreat: ${'●'.repeat(p.retreatCost)}</div>
            ${p.energyAttached?.length > 0
                ? `<div class="energy-list">${p.energyAttached.join(', ')}</div>`
                : ''}
        `;

        // Allow Energy attachment and Evolution
        el.addEventListener('dragover', (e) => {
            e.preventDefault();
            const cardIndex = e.dataTransfer.getData('text/plain');
            const card = gameState.hand[cardIndex];
            if (card?.type === 'energy' || (card?.type === 'pokemon' && card.evolvesFrom === p.name)) {
                el.classList.add('drag-over');
            }
        });

        el.addEventListener('dragleave', () => {
            el.classList.remove('drag-over');
        });

        el.addEventListener('drop', (e) => {
            e.preventDefault();
            el.classList.remove('drag-over');
            const cardIndex = e.dataTransfer.getData('text/plain');
            const card = gameState.hand[cardIndex];

            if (card?.type === 'energy') {
                if (!Array.isArray(gameState.bench[index].energyAttached)) {
                    gameState.bench[index].energyAttached = [];
                }
                gameState.bench[index].energyAttached.push(card.energyType);
                gameState.hand.splice(cardIndex, 1);
                renderAll();
                updateStatus(`⚡ Attached ${card.energyType} Energy to ${p.name}!`);
            } else if (card?.type === 'pokemon' && card.evolvesFrom === p.name) {
                evolvePokemon('bench', index, card, cardIndex);
            } else {
                updateStatus("Invalid card for this Pokémon.");
            }
        });

        benchEl.appendChild(el);
    });
}

function renderOpponent() {
    if (!opponentActiveEl) return;
    const el = opponentActiveEl;
    if (gameState.opponentActive) {
        const damage = gameState.opponentActive.damage || 0;
        el.innerHTML = `
            <div class="damage-counter">${damage > 0 ? Math.ceil(damage / 10) : ''}</div>
            <div><strong>${gameState.opponentActive.name}</strong></div>
            <div>HP: ${gameState.opponentActive.hp - damage}/${gameState.opponentActive.hp}</div>
        `;
        el.className = 'pokemon-slot';
    } else {
        el.innerHTML = 'Empty';
        el.className = 'pokemon-slot empty';
    }
}

function renderAll() {
    renderHand();
    renderActive();
    renderBench();
    renderOpponent();
    if (playerPrizesEl) playerPrizesEl.textContent = gameState.playerPrizes;
    if (opponentPrizesEl) opponentPrizesEl.textContent = gameState.opponentPrizes;

    if (gameState.active && gameState.opponentActive && !gameState.gameOver) {
        const attack = gameState.active.attacks[0];
        if (attack && attack.cost) {
            if (!canPayEnergyCost(gameState.active.energyAttached, attack.cost)) {
                const missing = getMissingEnergyMessage(gameState.active.energyAttached, attack.cost);
                updateStatus(`Cannot attack: ${missing}`);
            } else {
                updateStatus(`Ready to attack with ${attack.name}!`);
            }
        }
    }
}

function updateStatus(message) {
    if (statusEl) statusEl.textContent = message;
}

function updateAttackButton() {
    if (!attackBtn) return;
    const active = gameState.active;
    const opponent = gameState.opponentActive;

    if (!active || !opponent || gameState.gameOver) {
        attackBtn.disabled = true;
        return;
    }

    const attack = active.attacks[0];
    if (!attack || !attack.cost) {
        attackBtn.disabled = true;
        return;
    }

    const canAttack = canPayEnergyCost(active.energyAttached, attack.cost);
    attackBtn.disabled = !canAttack;
}

// ===== ENERGY VALIDATION FUNCTIONS =====
function canPayEnergyCost(attachedEnergy, requiredCost) {
    if (!attachedEnergy || !requiredCost) return false;
    if (attachedEnergy.length < requiredCost.length) return false;

    const available = [...attachedEnergy];
    let colorlessCount = 0;

    // Count colorless requirements
    const specificCosts = [];
    for (const cost of requiredCost) {
        if (cost === 'Colorless') {
            colorlessCount++;
        } else {
            specificCosts.push(cost);
        }
    }

    // Match specific energy types
    for (const required of specificCosts) {
        const index = available.indexOf(required);
        if (index === -1) return false;
        available.splice(index, 1);
    }

    // Check if remaining energy can cover colorless
    return available.length >= colorlessCount;
}

function getMissingEnergyMessage(attached, required) {
    const count = (arr) => {
        const c = {};
        arr.forEach(t => c[t] = (c[t] || 0) + 1);
        return c;
    };

    const needed = count(required);
    const have = count(attached);

    let specifics = [];
    for (const type in needed) {
        if (type === 'Colorless') continue;
        const diff = needed[type] - (have[type] || 0);
        if (diff > 0) {
            specifics.push(`${diff} ${type}`);
        }
    }

    const totalShortfall = required.length - attached.length;
    if (totalShortfall > 0 && specifics.length === 0) {
        return `need ${totalShortfall} more Energy`;
    }
    if (specifics.length > 0) {
        return `need ${specifics.join(', ')}`;
    }
    return 'insufficient Energy';
}

// ===== GAME ACTION FUNCTIONS =====
function playCardToActive(handIndex) {
    const card = gameState.hand[handIndex];
    if (!card || card.type !== 'pokemon' || card.evolvesFrom !== null) return;

    gameState.active = { ...card };
    gameState.hand.splice(handIndex, 1);
    renderAll();
    updateStatus(`Played ${card.name} as Active!`);
}

function playCardToBench(handIndex) {
    const card = gameState.hand[handIndex];
    if (!card || card.type !== 'pokemon') return;

    if (gameState.bench.length >= 5) {
        updateStatus("Bench is full! (Max 5 Pokémon)");
        return;
    }

    gameState.bench.push({ ...card });
    gameState.hand.splice(handIndex, 1);
    renderAll();
    updateStatus(`Played ${card.name} to Bench!`);
}

function canRetreat(pokemon) {
    if (!pokemon || pokemon.retreatCost <= 0) return true;
    const attached = pokemon.energyAttached || [];
    return attached.length >= pokemon.retreatCost;
}

function switchActiveWithBench(benchIndex) {
    if (gameState.gameOver || !gameState.active || gameState.bench.length === 0) return;

    const active = gameState.active;
    const benchPokemon = gameState.bench[benchIndex];

    if (!canRetreat(active)) {
        updateStatus(`Not enough Energy to retreat ${active.name}! Needs ${active.retreatCost}.`);
        return;
    }

    const energyToDiscard = Math.min(active.retreatCost, active.energyAttached.length);
    active.energyAttached.splice(0, energyToDiscard);

    gameState.active = benchPokemon;
    gameState.bench[benchIndex] = active;

    renderAll();
    updateStatus(`${active.name} retreated! ${benchPokemon.name} is now Active.`);
}

function evolvePokemon(zone, benchIndex, evolutionCard, handIndex) {
    let target;
    let targetName;

    if (zone === 'active') {
        target = gameState.active;
        targetName = target.name;
    } else if (zone === 'bench') {
        target = gameState.bench[benchIndex];
        targetName = target.name;
    }

    if (!target || evolutionCard.evolvesFrom !== targetName) {
        updateStatus("Cannot evolve this Pokémon!");
        return;
    }

    const evolved = { ...evolutionCard };
    evolved.damage = target.damage || 0;
    evolved.energyAttached = [...(target.energyAttached || [])];

    if (zone === 'active') {
        gameState.active = evolved;
    } else {
        gameState.bench[benchIndex] = evolved;
    }

    gameState.hand.splice(handIndex, 1);
    renderAll();
    updateStatus(`${targetName} evolved into ${evolved.name}!`);
}

function attack() {
    if (!gameState.active || !gameState.opponentActive || gameState.gameOver) return;

    const attack = gameState.active.attacks[0];
    const damage = attack.damage;

    if (!gameState.opponentActive.damage) gameState.opponentActive.damage = 0;
    gameState.opponentActive.damage += damage;

    if (gameState.opponentActive.damage >= gameState.opponentActive.hp) {
        gameState.opponentActive = null;
        gameState.playerPrizes--;
        updateStatus(`You knocked out opponent's Pokémon! Prize cards left: ${gameState.playerPrizes}`);

        if (gameState.playerPrizes <= 0) {
            gameState.gameOver = true;
            gameState.winner = 'player';
            updateStatus("🎉 You win! You took all prize cards!");
            if (endTurnBtn) endTurnBtn.disabled = true;
            if (attackBtn) attackBtn.disabled = true;
            return;
        }
    } else {
        updateStatus(`Dealt ${damage} damage to opponent's Pokémon!`);
    }

    renderAll();
}

function drawCard() {
    if (gameState.deck.length === 0) {
        updateStatus("No cards left to draw!");
        return;
    }
    gameState.hand.push(gameState.deck.pop());
    renderAll();
    updateStatus("Drew a card!");
}

function setupDropZones() {
    // Active Zone
    const activeZone = document.getElementById('player-active');
    if (activeZone) {
        activeZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!gameState.active) activeZone.classList.add('drag-over');
        });
        activeZone.addEventListener('dragleave', () => {
            activeZone.classList.remove('drag-over');
        });
        activeZone.addEventListener('drop', (e) => {
            e.preventDefault();
            activeZone.classList.remove('drag-over');
            const index = e.dataTransfer.getData('text/plain');
            const card = gameState.hand[index];
            if (!card) return;

            if (card.type === 'pokemon' && card.evolvesFrom === null && !gameState.active) {
                playCardToActive(index);
            } else if (card.type === 'energy' && gameState.active) {
                if (!Array.isArray(gameState.active.energyAttached)) {
                    gameState.active.energyAttached = [];
                }
                gameState.active.energyAttached.push(card.energyType);
                gameState.hand.splice(index, 1);
                renderAll();
                updateStatus(`⚡ Attached ${card.energyType} Energy to ${gameState.active.name}!`);
            } else {
                updateStatus("Cannot play that here!");
            }
        });
    }

    // Bench Zone (for Basic Pokémon only)
    const benchZone = document.getElementById('player-bench');
    if (benchZone) {
        benchZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            const index = e.dataTransfer.getData('text/plain');
            const card = gameState.hand[index];
            if (card && card.type === 'pokemon' && card.evolvesFrom === null && gameState.bench.length < 5) {
                benchZone.classList.add('drag-over');
            }
        });
        benchZone.addEventListener('dragleave', () => {
            benchZone.classList.remove('drag-over');
        });
        benchZone.addEventListener('drop', (e) => {
            e.preventDefault();
            benchZone.classList.remove('drag-over');
            const index = e.dataTransfer.getData('text/plain');
            const card = gameState.hand[index];
            if (!card) return;

            if (card.type === 'pokemon' && card.evolvesFrom === null) {
                if (gameState.bench.length >= 5) {
                    updateStatus("Bench is full! (Max 5 Pokémon)");
                    return;
                }
                playCardToBench(index);
            } else {
                updateStatus("Only Basic Pokémon can be played to Bench.");
            }
        });
    }
}

// ===== OPPONENT AI =====
function opponentAI() {
    if (gameState.gameOver) return;

    if (!gameState.opponentActive) {
        const basicCards = cardDatabase.filter(c => c.type === 'pokemon' && c.evolvesFrom === null);
        if (basicCards.length > 0) {
            const card = basicCards[Math.floor(Math.random() * basicCards.length)];
            gameState.opponentActive = { ...card, energyAttached: [], damage: 0 };
            updateStatus(`Opponent played ${card.name}!`);
        }
        renderAll();
        return;
    }

    const opponent = gameState.opponentActive;
    const playerActive = gameState.active;
    let shouldAttachEnergy = false;
    let shouldAttack = false;

    if (playerActive && opponent.attacks && opponent.attacks[0]) {
        const attack = opponent.attacks[0];
        if (canPayEnergyCost(opponent.energyAttached, attack.cost)) {
            shouldAttack = true;
        } else {
            shouldAttachEnergy = true;
        }
    } else {
        shouldAttachEnergy = true;
    }

    if (shouldAttachEnergy) {
        const energyCards = cardDatabase.filter(c => c.type === 'energy');
        if (energyCards.length > 0) {
            // Try to match attack requirement first
            let energyType = 'Colorless';
            if (opponent.attacks[0]) {
                const needed = opponent.attacks[0].cost.find(t => t !== 'Colorless');
                if (needed) energyType = needed;
            }
            if (!opponent.energyAttached) opponent.energyAttached = [];
            opponent.energyAttached.push(energyType);
            updateStatus(`Opponent attached ${energyType} Energy!`);
        }
    }

    if (shouldAttack && playerActive) {
        const attack = opponent.attacks[0];
        if (!playerActive.damage) playerActive.damage = 0;
        playerActive.damage += attack.damage;

        if (playerActive.damage >= playerActive.hp) {
            gameState.active = null;
            gameState.opponentPrizes--;
            updateStatus(`Opponent used ${attack.name}! Your Pokémon was knocked out!`);

            if (gameState.opponentPrizes <= 0) {
                gameState.gameOver = true;
                gameState.winner = 'opponent';
                updateStatus("💀 Opponent wins! They took all your prize cards!");
                if (drawBtn) drawBtn.disabled = true;
                if (endTurnBtn) endTurnBtn.disabled = true;
                if (attackBtn) attackBtn.disabled = true;
                if (switchBtn) switchBtn.disabled = true;
                renderAll();
                return;
            }
        } else {
            updateStatus(`Opponent used ${attack.name}! Dealt ${attack.damage} damage.`);
        }
    }

    renderAll();
}

function endTurn() {
    if (gameState.gameOver) return;

    gameState.currentPlayer = 'opponent';
    updateStatus("Opponent's turn...");

    setTimeout(() => {
        opponentAI();
        if (!gameState.gameOver) {
            gameState.currentPlayer = 'player';
            gameState.turn++;
            updateStatus(`Turn ${gameState.turn} - Your turn!`);
        }
        if (drawBtn) drawBtn.disabled = gameState.gameOver;
        if (endTurnBtn) endTurnBtn.disabled = gameState.gameOver;
        if (attackBtn) attackBtn.disabled = gameState.gameOver || !gameState.active;
        if (switchBtn) switchBtn.disabled = gameState.gameOver || !gameState.active || gameState.bench.length === 0;
    }, 1500);
}

// ===== DECK BUILDER FUNCTIONS =====
function renderAvailableCards() {
    const availableEl = document.getElementById('available-cards');
    if (!availableEl) return;
    
    availableEl.innerHTML = '';

    // Pokémon Cards
    const seenPokemon = new Set();
    cardDatabase.forEach(card => {
        if (card.type === 'pokemon' && !seenPokemon.has(card.name)) {
            seenPokemon.add(card.name);
            const el = document.createElement('div');
            el.className = 'card';
            el.style.backgroundColor = '#2ecc71';
            el.textContent = card.name;
            el.onclick = () => addToDeck(card);
            availableEl.appendChild(el);
        }
    });

    // Energy Cards
    const energyTypes = ['Lightning', 'Fire', 'Grass', 'Water', 'Colorless'];
    energyTypes.forEach(type => {
        const el = document.createElement('div');
        el.className = 'card';
        el.style.backgroundColor = '#f1c40f';
        el.textContent = `${type} Energy`;
        el.onclick = () => addToDeck({ type: 'energy', name: `${type} Energy`, energyType: type });
        availableEl.appendChild(el);
    });
}

function addToDeck(card) {
    if (playerDeck.length >= 20) {
        updateStatus("Deck is full (20 cards)!");
        return;
    }
    playerDeck.push({ ...card });
    updateDeckPreview();
}

function updateDeckPreview() {
    const countEl = document.getElementById('deck-count');
    const deckEl = document.getElementById('deck-cards');
    
    if (countEl) countEl.textContent = playerDeck.length;
    if (deckEl) {
        deckEl.innerHTML = '';
        playerDeck.forEach((card, i) => {
            const el = document.createElement('div');
            el.className = 'card';
            el.style.width = '80px';
            el.style.fontSize = '10px';
            el.textContent = card.name.length > 12 ? card.name.substring(0,12)+'...' : card.name;
            el.title = card.name;
            el.onclick = () => {
                playerDeck.splice(i, 1);
                updateDeckPreview();
            };
            deckEl.appendChild(el);
        });
    }
    
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) startBtn.disabled = playerDeck.length !== 20;
}

function showDeckBuilder() {
    const deckBuilder = document.getElementById('deck-builder');
    const gameScreen = document.getElementById('game-screen');
    
    if (deckBuilder) deckBuilder.style.display = 'block';
    if (gameScreen) gameScreen.style.display = 'none';
    
    playerDeck = [];
    updateDeckPreview();
    renderAvailableCards();
}

// ===== SWITCH BUTTON HANDLER =====
function initSwitchButton() {
    const switchBtnEl = document.getElementById('switch-btn');
    if (switchBtnEl) {
        switchBtnEl.addEventListener('click', () => {
            if (gameState.bench.length === 0) return;

            const originalHand = [...gameState.hand];
            const originalStatus = statusEl?.textContent || "";

            if (handEl) handEl.innerHTML = '';
            updateStatus("Choose a Pokémon from your Bench to switch in:");

            gameState.bench.forEach((p, idx) => {
                const choiceEl = document.createElement('div');
                choiceEl.className = 'card pokemon';
                choiceEl.style.width = '100px';
                choiceEl.style.height = '120px';
                choiceEl.innerHTML = `<strong>${p.name}</strong><br>HP: ${p.hp}`;
                choiceEl.onclick = () => {
                    gameState.hand = originalHand;
                    switchActiveWithBench(idx);
                };
                if (handEl) handEl.appendChild(choiceEl);
            });

            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel';
            cancelBtn.style.marginTop = '10px';
            cancelBtn.onclick = () => {
                gameState.hand = originalHand;
                renderAll();
                updateStatus(originalStatus);
            };
            if (handEl) handEl.appendChild(cancelBtn);
        });
    }
}

// ===== START GAME BUTTON =====
function initStartGameButton() {
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.onclick = () => {
            if (playerDeck.length !== 20) return;

            gameState.deck = [...playerDeck].sort(() => Math.random() - 0.5);
            gameState.hand = [];
            for (let i = 0; i < 7 && gameState.deck.length > 0; i++) {
                gameState.hand.push(gameState.deck.pop());
            }

            const basicPokes = cardDatabase.filter(c => c.type === 'pokemon' && c.evolvesFrom === null);
            if (basicPokes.length > 0) {
                const opp = basicPokes[Math.floor(Math.random() * basicPokes.length)];
                gameState.opponentActive = { ...opp, energyAttached: [], damage: 0 };
            }

            const deckBuilder = document.getElementById('deck-builder');
            const gameScreen = document.getElementById('game-screen');
            if (deckBuilder) deckBuilder.style.display = 'none';
            if (gameScreen) gameScreen.style.display = 'block';

            renderAll();
            updateStatus("Your turn! Play a Basic Pokémon.");
        };
    }
}

// ===== INITIALIZE EVERYTHING WHEN DOM IS READY =====
document.addEventListener('DOMContentLoaded', () => {
    // Set DOM elements
    handEl = document.getElementById('player-hand');
    activeEl = document.getElementById('player-active');
    benchEl = document.getElementById('player-bench');
    opponentActiveEl = document.getElementById('opponent-active');
    drawBtn = document.getElementById('draw-btn');
    endTurnBtn = document.getElementById('end-turn-btn');
    attackBtn = document.getElementById('attack-btn');
    statusEl = document.getElementById('game-status');
    playerPrizesEl = document.getElementById('player-prizes');
    opponentPrizesEl = document.getElementById('opponent-prizes');
    switchBtn = document.getElementById('switch-btn');

    // Initialize buttons
    initSwitchButton();
    initStartGameButton();
    
    // Set up drag-and-drop
    setupDropZones();

    // Add event listeners for game actions
    if (drawBtn) drawBtn.addEventListener('click', drawCard);
    if (endTurnBtn) endTurnBtn.addEventListener('click', endTurn);
    if (attackBtn) attackBtn.addEventListener('click', attack);

    // Start with deck builder
    showDeckBuilder();
});