/**
 * Script para la vista de registro de entrenadores
 * Obtiene datos de Pokémon desde PokeAPI (requisito del TP)
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('🎮 Inicializando registro de entrenador...');
    
    // Estado de la aplicación
    const state = {
      currentPage: 1,
      limit: 20,
      totalPokemon: 898,
      selectedPokemon: [],
      isLoading: false,
      allPokemonCache: new Map()
    };

    // Elementos del DOM
    const elements = {
      form: document.getElementById('trainer-form'),
      pokemonGrid: document.getElementById('pokemon-grid'),
      prevBtn: document.getElementById('prev-page'),
      nextBtn: document.getElementById('next-page'),
      pageInfo: document.getElementById('page-info'),
      selectedCount: document.getElementById('selected-count'),
      nameInput: document.getElementById('name'),
      regionInput: document.getElementById('region'),
      specialtyInput: document.getElementById('specialty'),
      loadingIndicator: document.getElementById('loading-indicator'),
      searchInput: document.getElementById('pokemon-search')
    };

    // Configurar event listeners
    function setupEventListeners() {
      if (elements.prevBtn && elements.nextBtn) {
        elements.prevBtn.addEventListener('click', () => changePage(-1));
        elements.nextBtn.addEventListener('click', () => changePage(1));
      }
      
      if (elements.form) {
        elements.form.addEventListener('submit', handleFormSubmit);
      }
      
      if (elements.searchInput) {
        elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
      }
      
      if (elements.nameInput) {
        elements.nameInput.addEventListener('blur', validateName);
      }
      
      if (elements.regionInput) {
        elements.regionInput.addEventListener('blur', validateRegion);
      }
    }

    /**
     * Cambia de página
     */
    async function changePage(direction) {
      const newPage = state.currentPage + direction;
      const totalPages = Math.ceil(state.totalPokemon / state.limit);
      
      if (newPage < 1 || newPage > totalPages) return;
      
      state.currentPage = newPage;
      await loadPokemonPage(state.currentPage);
    }

    /**
     * Carga una página de Pokémon desde la API
     */
    async function loadPokemonPage(page) {
      try {
        showLoading(true);
        
        const offset = (page - 1) * state.limit;
        const totalPages = Math.ceil(state.totalPokemon / state.limit);
        
        // Actualizar información de página
        if (elements.pageInfo) {
          elements.pageInfo.textContent = `Página ${page} de ${totalPages}`;
        }
        
        // Actualizar estado de botones
        if (elements.prevBtn) elements.prevBtn.disabled = page === 1;
        if (elements.nextBtn) elements.nextBtn.disabled = page === totalPages;
        
        // Obtener lista de Pokémon
        const pokemonList = await fetchPokemonList(offset, state.limit);
        
        // Limpiar grid
        if (elements.pokemonGrid) {
          elements.pokemonGrid.innerHTML = '';
        }
        
        // Crear cards para cada Pokémon
        const fragment = document.createDocumentFragment();
        
        for (const pokemon of pokemonList) {
          const card = await createPokemonSelectionCard(pokemon);
          if (card) fragment.appendChild(card);
        }
        
        if (elements.pokemonGrid) {
          elements.pokemonGrid.appendChild(fragment);
        }
        
        showLoading(false);
        
      } catch (error) {
        console.error('Error cargando página:', error);
        if (elements.pokemonGrid) {
          elements.pokemonGrid.innerHTML = `
            <div class="error-message">
              <p>❌ Error cargando Pokémon</p>
              <button onclick="location.reload()" class="button">Reintentar</button>
            </div>
          `;
        }
        showLoading(false);
      }
    }

    /**
     * Crea una card para seleccionar Pokémon
     */
    async function createPokemonSelectionCard(pokemon) {
      try {
        // Obtener datos detallados del Pokémon
        const details = await fetchPokemonDetails(pokemon.id);
        if (!details) return null;
        
        const card = document.createElement('div');
        card.className = `pokemon-selection-card ${state.selectedPokemon.includes(pokemon.id) ? 'selected' : ''}`;
        card.dataset.id = pokemon.id;
        card.dataset.name = details.name;
        card.dataset.type = details.type;
        
        // Imagen del Pokémon
        const img = document.createElement('img');
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
        img.alt = details.name;
        img.loading = 'lazy';
        img.onerror = function() {
          this.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
        };
        
        // Información
        const info = document.createElement('div');
        info.className = 'pokemon-selection-info';
        
        const name = document.createElement('p');
        name.className = 'pokemon-name';
        name.textContent = details.name;
        
        const type = document.createElement('p');
        type.className = `pokemon-type type-${details.type.toLowerCase()}`;
        type.textContent = details.type;
        
        const stats = document.createElement('div');
        stats.className = 'pokemon-mini-stats';
        stats.innerHTML = `
          <span>HP: ${details.baseStats.hp}</span>
          <span>⚔️: ${details.baseStats.attack}</span>
        `;
        
        // Badge si está seleccionado
        if (state.selectedPokemon.includes(pokemon.id)) {
          const selectedBadge = document.createElement('div');
          selectedBadge.className = 'selection-badge';
          selectedBadge.textContent = '✓';
          card.appendChild(selectedBadge);
        }
        
        // Ensamblar
        info.appendChild(name);
        info.appendChild(type);
        info.appendChild(stats);
        
        card.appendChild(img);
        card.appendChild(info);
        
        // Event listener para selección
        card.addEventListener('click', () => togglePokemonSelection(pokemon.id, card));
        
        return card;
        
      } catch (error) {
        console.error(`Error creando card para ${pokemon.name}:`, error);
        return null;
      }
    }

    /**
     * Alterna la selección de un Pokémon
     */
    function togglePokemonSelection(pokemonId, card) {
      const index = state.selectedPokemon.indexOf(pokemonId);
      
      if (index > -1) {
        // Deseleccionar
        state.selectedPokemon.splice(index, 1);
        card.classList.remove('selected');
        
        // Remover badge
        const badge = card.querySelector('.selection-badge');
        if (badge) badge.remove();
        
      } else {
        // Verificar límite
        if (state.selectedPokemon.length >= 6) {
          showAlert('¡Equipo completo!', 'Solo puedes seleccionar 6 Pokémon. Elimina uno primero.');
          return;
        }
        
        // Seleccionar
        state.selectedPokemon.push(pokemonId);
        card.classList.add('selected');
        
        // Añadir badge visual
        if (!card.querySelector('.selection-badge')) {
          const badge = document.createElement('div');
          badge.className = 'selection-badge';
          badge.textContent = '✓';
          card.appendChild(badge);
        }
      }
      
      updateSelectedCounter();
    }

    /**
     * Actualiza el contador de Pokémon seleccionados
     */
    function updateSelectedCounter() {
      if (!elements.selectedCount) return;
      
      const count = state.selectedPokemon.length;
      elements.selectedCount.textContent = `${count}/6 Pokémon seleccionados`;
      
      // Efectos visuales
      if (count === 6) {
        elements.selectedCount.classList.add('completed');
      } else {
        elements.selectedCount.classList.remove('completed');
      }
    }

    /**
     * Maneja el envío del formulario
     */
    async function handleFormSubmit(e) {
      e.preventDefault();
      
      try {
        // Validaciones
        if (!validateForm()) return;
        
        if (state.selectedPokemon.length !== 6) {
          showAlert('Equipo incompleto', 'Debes seleccionar exactamente 6 Pokémon para tu equipo.');
          return;
        }
        
        showLoading(true, 'Creando entrenador...');
        
        // Crear entrenador
        const trainer = new Trainer(
          elements.nameInput.value.trim(),
          elements.regionInput.value.trim(),
          elements.specialtyInput?.value.trim() || 'Entrenamiento'
        );
        
        console.log(`👤 Creando entrenador: ${trainer.name}`);
        
        // Obtener detalles de Pokémon seleccionados
        console.log('📥 Obteniendo detalles de Pokémon seleccionados...');
        for (const pokemonId of state.selectedPokemon) {
          const pokemonData = await fetchPokemonDetails(pokemonId);
          if (pokemonData) {
            trainer.addPokemon(pokemonData);
            console.log(`  ✅ Añadido: ${pokemonData.name}`);
          }
        }
        
        // Guardar entrenador
        console.log('💾 Guardando entrenador...');
        const success = await StorageHandler.saveTrainer(trainer);
        
        if (success) {
          console.log('✅ Entrenador guardado exitosamente');
          showSuccess('¡Entrenador registrado exitosamente!', 'Redirigiendo a la vista principal...');
          
          // Redirigir después de 2 segundos
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 2000);
        } else {
          throw new Error('Error guardando entrenador');
        }
        
      } catch (error) {
        console.error('Error registrando entrenador:', error);
        showError('No se pudo registrar el entrenador. Por favor, intenta nuevamente.');
        showLoading(false);
      }
    }

    /**
     * Valida el formulario
     */
    function validateForm() {
      let isValid = true;
      
      // Validar nombre
      if (!validateName()) isValid = false;
      
      // Validar región
      if (!validateRegion()) isValid = false;
      
      return isValid;
    }

    /**
     * Valida el nombre del entrenador
     */
    function validateName() {
      if (!elements.nameInput) return false;
      
      const name = elements.nameInput.value.trim();
      if (name.length < 3) {
        showFieldError(elements.nameInput, 'El nombre debe tener al menos 3 caracteres');
        return false;
      }
      clearFieldError(elements.nameInput);
      return true;
    }

    /**
     * Valida la región
     */
    function validateRegion() {
      if (!elements.regionInput) return false;
      
      const region = elements.regionInput.value.trim();
      if (region.length < 3) {
        showFieldError(elements.regionInput, 'La región debe tener al menos 3 caracteres');
        return false;
      }
      clearFieldError(elements.regionInput);
      return true;
    }

    // ===== FUNCIONES DE UTILIDAD =====

    function showLoading(show, message = 'Cargando...') {
      state.isLoading = show;
      
      if (elements.loadingIndicator) {
        if (show) {
          if (message) {
            elements.loadingIndicator.querySelector('p').textContent = message;
          }
          elements.loadingIndicator.style.display = 'block';
        } else {
          elements.loadingIndicator.style.display = 'none';
        }
      }
      
      // Deshabilitar controles
      const controls = [elements.prevBtn, elements.nextBtn];
      controls.forEach(btn => {
        if (btn) btn.disabled = show;
      });
      
      // Deshabilitar botón de submit
      const submitBtn = elements.form?.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = show;
      }
    }

    function showError(message) {
      alert(`❌ Error: ${message}`);
    }

    function showSuccess(title, message) {
      alert(`✅ ${title}\n${message}`);
    }

    function showAlert(title, message) {
      alert(`⚠️ ${title}\n${message}`);
    }

    function showFieldError(input, message) {
      if (!input) return;
      
      input.classList.add('error');
      let errorElement = input.nextElementSibling?.classList?.contains('error-message') 
        ? input.nextElementSibling 
        : document.createElement('div');
      
      errorElement.className = 'error-message';
      errorElement.textContent = message;
      errorElement.style.color = '#ff4757';
      errorElement.style.fontSize = '0.85rem';
      errorElement.style.marginTop = '0.5rem';
      
      if (!input.nextElementSibling?.classList?.contains('error-message')) {
        input.parentNode.insertBefore(errorElement, input.nextSibling);
      }
    }

    function clearFieldError(input) {
      if (!input) return;
      
      input.classList.remove('error');
      const errorElement = input.nextElementSibling;
      if (errorElement?.classList?.contains('error-message')) {
        errorElement.remove();
      }
    }

    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    function handleSearch(e) {
      if (!e || !e.target) return;
      
      const searchTerm = e.target.value.toLowerCase();
      const cards = elements.pokemonGrid?.querySelectorAll('.pokemon-selection-card');
      
      if (!cards) return;
      
      cards.forEach(card => {
        const name = card.dataset.name?.toLowerCase() || '';
        const type = card.dataset.type?.toLowerCase() || '';
        
        if (name.includes(searchTerm) || type.includes(searchTerm) || searchTerm === '') {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }

    // ===== FUNCIONES DE API =====

    /**
     * Obtiene lista de Pokémon desde PokeAPI
     */
    async function fetchPokemonList(offset, limit) {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
        
        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        return data.results.map((pokemon, index) => ({
          id: offset + index + 1,
          name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
          url: pokemon.url
        }));
        
      } catch (error) {
        console.error('Error obteniendo lista de Pokémon:', error);
        throw error;
      }
    }

    /**
     * Obtiene detalles de un Pokémon específico
     */
    async function fetchPokemonDetails(id) {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        
        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status} para Pokémon ${id}`);
        }
        
        const data = await response.json();
        
        // Obtener movimientos (máximo 2 para simplificar)
        const moves = [];
        if (data.moves && data.moves.length > 0) {
          // Tomar solo 2 movimientos
          const selectedMoves = data.moves.slice(0, 2);
          for (const move of selectedMoves) {
            try {
              const moveResponse = await fetch(move.move.url);
              const moveData = await moveResponse.json();
              
              const effectEntry = moveData.effect_entries?.find(e => e.language.name === 'en');
              
              moves.push(new Move(
                move.move.name.replace('-', ' ').split(' ').map(w => 
                  w.charAt(0).toUpperCase() + w.slice(1)
                ).join(' '),
                effectEntry ? effectEntry.effect : 'Sin descripción',
                moveData.power,
                moveData.accuracy
              ));
            } catch (moveError) {
              console.warn(`Error obteniendo movimiento ${move.move.name}:`, moveError);
              moves.push(new Move(move.move.name, 'Sin información'));
            }
          }
        }
        
        // Crear instancia de Pokémon
        return new Pokemon(
          id,
          data.name.charAt(0).toUpperCase() + data.name.slice(1),
          data.types[0]?.type?.name || 'unknown',
          data.abilities?.map(a => a.ability.name) || [],
          {
            hp: data.stats?.find(s => s.stat.name === 'hp')?.base_stat || 0,
            attack: data.stats?.find(s => s.stat.name === 'attack')?.base_stat || 0,
            defense: data.stats?.find(s => s.stat.name === 'defense')?.base_stat || 0
          },
          moves
        );
        
      } catch (error) {
        console.error(`Error obteniendo detalles del Pokémon ${id}:`, error);
        return null;
      }
    }

    // ===== INICIALIZACIÓN =====
    setupEventListeners();
    await loadPokemonPage(state.currentPage);
    updateSelectedCounter();
    
    console.log('✅ Registro inicializado correctamente');
    
  } catch (error) {
    console.error('Error inicializando registro:', error);
    alert('No se pudo inicializar el formulario. Por favor, recarga la página.');
  }
});