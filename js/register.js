document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('trainer-form');
  const pokemonGrid = document.getElementById('pokemon-grid');
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const pageInfo = document.getElementById('page-info');
  const selectedCount = document.getElementById('selected-count');
    
  let currentPage = 1;
  const limit = 15; // Pokémon por página
  const totalPokemon = 150; 
  let selectedPokemon = []; 
  
  // Carga la primera página de Pokémon
  await loadPokemonPage(currentPage);
  
  prevBtn.addEventListener('click', async () => {
    if (currentPage > 1) {
      currentPage--;
      await loadPokemonPage(currentPage);
    }
  });
  
  nextBtn.addEventListener('click', async () => {
    if (currentPage < Math.ceil(totalPokemon / limit)) {
      currentPage++;
      await loadPokemonPage(currentPage);
    }
  });
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validar que se seleccionaron 6 Pokémon
    if (selectedPokemon.length !== 6) {
      alert('Debes seleccionar exactamente 6 Pokémon');
      return;
    }
    
    
    const name = form.elements['name'].value;
    const region = form.elements['region'].value;
    
    // Crea nuevo entrenador
    const trainer = new Trainer(name, region);
    
    // detalles de los Pokémon seleccionados
    for (const pokemonId of selectedPokemon) {
      const pokemonData = await fetchPokemonDetails(pokemonId);
      if (pokemonData) {
        trainer.addPokemon(pokemonData);
      }
    }
    
    
    const success = await StorageHandler.saveTrainer(trainer.toJSON());
    if (success) {
      // Redirigir a la vista principal
      window.location.href = 'index.html';
    }
  });
  
  // Función para cargar una página de Pokémon
  async function loadPokemonPage(page) {
    pokemonGrid.innerHTML = '<p>Cargando Pokémon...</p>';
    pageInfo.textContent = `Página ${page} de ${Math.ceil(totalPokemon / limit)}`;
    
    const offset = (page - 1) * limit;
    const pokemonList = await fetchPokemonList(offset, limit);
    
    pokemonGrid.innerHTML = '';
    pokemonList.forEach(pokemon => {
      const card = createPokemonSelectionCard(pokemon);
      pokemonGrid.appendChild(card);
    });
  }
  
  function createPokemonSelectionCard(pokemon) {
    const card = document.createElement('div');
    card.className = `pokemon-selection-card ${selectedPokemon.includes(pokemon.id) ? 'selected' : ''}`;
    card.dataset.id = pokemon.id;
    
    const img = document.createElement('img');
    img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
    img.alt = pokemon.name;
    

    const name = document.createElement('p');
    name.textContent = pokemon.name;
    
    // Añadir elementos a la tarjeta
    card.appendChild(img);
    card.appendChild(name);
    
    // Manejar clic en la tarjeta
    card.addEventListener('click', () => {
      // Si ya está seleccionado, quitarlo
      if (selectedPokemon.includes(pokemon.id)) {
        selectedPokemon = selectedPokemon.filter(id => id !== pokemon.id);
        card.classList.remove('selected');
      } 
      // Si no está seleccionado y hay menos de 6, añadirlo
      else if (selectedPokemon.length < 6) {
        selectedPokemon.push(pokemon.id);
        card.classList.add('selected');
      } 
      // Si ya hay 6 seleccionados, mostrar alerta
      else {
        alert('Solo puedes seleccionar 6 Pokémon');
      }
      
      // Actualizar contador
      selectedCount.textContent = `${selectedPokemon.length}/6 seleccionados`;
    });
    
    return card;
  }
});

// Obtiene una lista de Pokémon desde la API
async function fetchPokemonList(offset, limit) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
    const data = await response.json();
    
    // Procesar los resultados
    return data.results.map((pokemon, index) => ({
      id: offset + index + 1, // Calcula el ID correcto
      name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1), // Formatea el nombre
      url: pokemon.url
    }));
  } catch (error) {
    console.error('Error al obtener lista de Pokémon:', error);
    return [];
  }
}

// Obtiene detalles de un Pokémon específico
async function fetchPokemonDetails(id) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await response.json();
    
    // Obtener movimientos con sus efectos
    const moves = await Promise.all(
      data.moves.slice(0, 4).map(async move => {
        const moveResponse = await fetch(move.move.url);
        const moveData = await moveResponse.json();
        
        // Buscar descripción en inglés
        const effectEntry = moveData.effect_entries.find(e => e.language.name === 'en');
        
        return new Move(
          move.move.name,
          effectEntry ? effectEntry.effect : 'No effect description'
        );
      })
    );
    
    // Crear y devolver el objeto Pokémon
    return new Pokemon(
      id,
      data.name.charAt(0).toUpperCase() + data.name.slice(1), // Nombre capitalizado
      data.types[0].type.name, // Primer tipo
      moves
    );
  } catch (error) {
    console.error('Error al obtener detalles del Pokémon:', error);
    return null;
  }
}