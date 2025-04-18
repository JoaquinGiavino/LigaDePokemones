document.addEventListener('DOMContentLoaded', async () => {
  const trainersContainer = document.getElementById('trainers-container');
  const registerBtn = document.getElementById('register-btn');
  
  // Cargar los entrenadores
  const trainers = await StorageHandler.loadTrainers();
  
  // Mostrar cada entrenador
  trainers.forEach(trainer => {
    trainersContainer.appendChild(createTrainerCard(trainer));
  });
  
  // Configurar el botón de registro
  registerBtn.addEventListener('click', () => {
    window.location.href = 'register.html';
  });
});

// Tarjeta para mostrar un entrenador
function createTrainerCard(trainer) {
  const card = document.createElement('div');
  card.className = 'trainer-card';
  
  const header = document.createElement('div');
  header.className = 'trainer-header';
  header.innerHTML = `<h2>${trainer.name}</h2><p>${trainer.region}</p>`;
  
  // equipo Pokémon
  const team = document.createElement('div');
  team.className = 'pokemon-team';
  
  // Agega cada Pokémon del equipo
  trainer.pokemonTeam.forEach(pokemon => {
    team.appendChild(createPokemonCard(pokemon));
  });
  
  // Juntar todo
  card.appendChild(header);
  card.appendChild(team);
  return card;
}

// Tarjeta para mostrar un Pokémon
function createPokemonCard(pokemon) {
  const card = document.createElement('div');
  card.className = 'pokemon-card';
  
  const title = document.createElement('h3');
  title.textContent = pokemon.name;
  
  // Tipo (con clase para el color)
  const type = document.createElement('p');
  type.textContent = `Type: ${pokemon.type}`;
  type.className = `type-${pokemon.type.toLowerCase()}`;
  
  // Lista de movimientos
  const movesList = document.createElement('ul');
  pokemon.moves.forEach(move => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${move.name}</strong>: ${move.effect}`;
    movesList.appendChild(item);
  });
  
  // Juntar todo
  card.appendChild(title);
  card.appendChild(type);
  card.appendChild(movesList);
  return card;
}