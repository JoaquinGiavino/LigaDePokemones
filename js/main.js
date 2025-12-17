/**
 * Script principal para la vista inicial
 * Carga y muestra entrenadores desde JSON
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('🚀 Inicializando aplicación Pokémon League...');
    
    // Elementos del DOM
    const trainersContainer = document.getElementById('trainers-container');
    const registerBtn = document.getElementById('register-btn');
    const statsElement = document.getElementById('stats');
    const loadingElement = document.getElementById('loading');
    
    // Mostrar estado de carga
    if (loadingElement) {
      loadingElement.textContent = 'Cargando entrenadores desde JSON...';
    }
    
    // 1. Cargar entrenadores (cumple requisito de carga desde JSON)
    const trainers = await StorageHandler.loadTrainers();
    
    // 2. Mostrar estadísticas si existe el elemento
    if (statsElement && trainers.length > 0) {
      const totalPokemon = trainers.reduce((sum, trainer) => 
        sum + trainer.getPokemonCount(), 0
      );
      statsElement.innerHTML = `
        <div class="stats-card">
          <h3>📊 Estadísticas de la Liga</h3>
          <p>🏆 Entrenadores: <strong>${trainers.length}</strong></p>
          <p>🔢 Pokémon totales: <strong>${totalPokemon}</strong></p>
          <p>⚡ Poder total: <strong>${trainers.reduce((sum, t) => sum + t.calculateTeamPower(), 0)}</strong></p>
        </div>
      `;
    }
    
    // 3. Mostrar cada entrenador en cards
    if (trainers.length === 0) {
      trainersContainer.innerHTML = `
        <div class="no-trainers">
          <h3>😢 No hay entrenadores registrados</h3>
          <p>¡Sé el primero en unirte a la liga!</p>
          <button onclick="window.location.href='register.html'" class="button">
            Registrar Primer Entrenador
          </button>
        </div>
      `;
    } else {
      trainers.forEach(trainer => {
        trainersContainer.appendChild(createTrainerCard(trainer));
      });
    }
    
    // 4. Configurar botón de registro
    if (registerBtn) {
      registerBtn.addEventListener('click', () => {
        window.location.href = 'register.html';
      });
    }
    
    // 5. Ocultar loader
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
    
    console.log(`✅ Aplicación inicializada con ${trainers.length} entrenadores`);
    
  } catch (error) {
    console.error('❌ Error crítico inicializando la aplicación:', error);
    document.getElementById('trainers-container').innerHTML = `
      <div class="error-message">
        <h3>⚠️ Error cargando los entrenadores</h3>
        <p>No se pudieron cargar los datos. Por favor, recarga la página.</p>
        <p><small>Detalle: ${error.message}</small></p>
        <button onclick="location.reload()" class="button">Reintentar</button>
      </div>
    `;
  }
});

/**
 * Crea una card para mostrar un entrenador
 * @param {Trainer} trainer - Entrenador a mostrar
 * @returns {HTMLElement} Card del entrenador
 */
function createTrainerCard(trainer) {
  const card = document.createElement('div');
  card.className = 'trainer-card';
  card.dataset.trainerName = trainer.name;
  
  // Información del entrenador
  const summary = trainer.getSummary();
  
  // Header de la card
  const header = document.createElement('div');
  header.className = 'trainer-header';
  header.innerHTML = `
    <h2>${trainer.name}</h2>
    <div class="trainer-info">
      <span class="region-badge">${trainer.region}</span>
      <span class="specialty-badge">${trainer.specialty}</span>
    </div>
    <p class="registration-date">Registrado: ${trainer.registrationDate}</p>
  `;
  
  // Estadísticas del entrenador
  const stats = document.createElement('div');
  stats.className = 'trainer-stats';
  stats.innerHTML = `
    <div class="stat">
      <span class="stat-label">Pokémon:</span>
      <span class="stat-value">${summary.pokemonCount}/6</span>
    </div>
    <div class="stat">
      <span class="stat-label">Poder:</span>
      <span class="stat-value">${summary.teamPower}</span>
    </div>
    <div class="stat">
      <span class="stat-label">Estado:</span>
      <span class="stat-value ${summary.teamComplete ? 'complete' : 'incomplete'}">
        ${summary.teamComplete ? 'Completo ✅' : 'Incompleto ⚠️'}
      </span>
    </div>
  `;
  
  // Equipo Pokémon
  const team = document.createElement('div');
  team.className = 'pokemon-team';
  team.innerHTML = '<h4>Equipo Pokémon:</h4>';
  
  if (trainer.pokemonTeam.length === 0) {
    team.innerHTML += '<p class="no-pokemon">Sin Pokémon en el equipo</p>';
  } else {
    const teamGrid = document.createElement('div');
    teamGrid.className = 'team-grid';
    
    trainer.pokemonTeam.forEach(pokemon => {
      teamGrid.appendChild(createPokemonCard(pokemon));
    });
    
    team.appendChild(teamGrid);
  }
  
  // Tipos presentes en el equipo
  const typeCount = {};
  trainer.pokemonTeam.forEach(p => {
    typeCount[p.type] = (typeCount[p.type] || 0) + 1;
  });
  
  if (Object.keys(typeCount).length > 0) {
    const types = document.createElement('div');
    types.className = 'team-types';
    types.innerHTML = '<h4>Tipos en el equipo:</h4>';
    
    const typesList = document.createElement('div');
    typesList.className = 'types-list';
    
    Object.entries(typeCount).forEach(([type, count]) => {
      const typeBadge = document.createElement('span');
      typeBadge.className = `type-badge type-${type}`;
      typeBadge.textContent = `${type} (${count})`;
      typesList.appendChild(typeBadge);
    });
    
    types.appendChild(typesList);
    card.appendChild(types);
  }
  
  // Ensamblar la card
  card.appendChild(header);
  card.appendChild(stats);
  card.appendChild(team);
  
  return card;
}

/**
 * Crea una card para mostrar un Pokémon
 * @param {Pokemon} pokemon - Pokémon a mostrar
 * @returns {HTMLElement} Card del Pokémon
 */
function createPokemonCard(pokemon) {
  const card = document.createElement('div');
  card.className = 'pokemon-card';
  card.dataset.pokemonId = pokemon.id;
  card.dataset.pokemonType = pokemon.type;
  
  // Imagen del Pokémon
  const img = document.createElement('img');
  img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
  img.alt = pokemon.name;
  img.loading = 'lazy';
  img.onerror = function() {
    this.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
  };
  
  // Información del Pokémon
  const info = document.createElement('div');
  info.className = 'pokemon-info';
  
  const name = document.createElement('h3');
  name.textContent = pokemon.name;
  
  const type = document.createElement('p');
  type.className = `pokemon-type type-${pokemon.type.toLowerCase()}`;
  type.innerHTML = `<span class="type-label">Tipo:</span> ${pokemon.type}`;
  
  const stats = document.createElement('div');
  stats.className = 'pokemon-stats';
  stats.innerHTML = `
    <div class="stat-row">
      <span>HP: ${pokemon.baseStats.hp}</span>
      <span>ATK: ${pokemon.baseStats.attack}</span>
      <span>DEF: ${pokemon.baseStats.defense}</span>
    </div>
  `;
  
  // Habilidades
  const abilities = document.createElement('div');
  abilities.className = 'pokemon-abilities';
  if (pokemon.abilities.length > 0) {
    abilities.innerHTML = `
      <p><strong>Habilidad:</strong> ${pokemon.getMainAbility()}</p>
    `;
  }
  
  // Movimientos (máximo 2 para no saturar)
  const moves = document.createElement('div');
  moves.className = 'pokemon-moves';
  if (pokemon.moves.length > 0) {
    const movesTitle = document.createElement('p');
    movesTitle.innerHTML = '<strong>Movimientos:</strong>';
    moves.appendChild(movesTitle);
    
    const movesList = document.createElement('ul');
    pokemon.moves.slice(0, 2).forEach(move => {
      const item = document.createElement('li');
      item.textContent = move.name;
      movesList.appendChild(item);
    });
    moves.appendChild(movesList);
  }
  
  // Ensamblar
  info.appendChild(name);
  info.appendChild(type);
  info.appendChild(stats);
  info.appendChild(abilities);
  info.appendChild(moves);
  
  card.appendChild(img);
  card.appendChild(info);
  
  return card;
}

/**
 * Función para exportar datos (extra)
 */
window.exportData = async function() {
    const trainers = await StorageHandler.loadTrainers();
    const data = JSON.stringify(trainers.map(t => t.toJSON()), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `entrenadores_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};