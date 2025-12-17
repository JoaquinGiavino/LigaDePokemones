/**
 * Clase que representa un Entrenador Pokémon
 * Entidad principal del sistema - 3 campos simples + 1 lista
 */
class Trainer {
  constructor(name, region, specialty = "") {
    // 3 campos simples (requisito del TP)
    this.name = this.formatName(name);
    this.region = this.formatRegion(region);
    this.specialty = specialty || "Entrenamiento";
    
    // 1 lista que se obtiene de API (requisito del TP)
    this.pokemonTeam = [];
    this.registrationDate = new Date().toISOString().split('T')[0];
  }

  /**
   * Formatea el nombre del entrenador
   * @private
   */
  formatName(name) {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Formatea la región
   * @private
   */
  formatRegion(region) {
    return region.charAt(0).toUpperCase() + region.slice(1).toLowerCase();
  }

  /**
   * Añade un Pokémon al equipo
   * @param {Pokemon} pokemon - Pokémon a añadir
   * @returns {boolean} True si se pudo añadir
   */
  addPokemon(pokemon) {
    if (this.pokemonTeam.length >= 6) {
      console.warn(`El equipo de ${this.name} ya tiene 6 Pokémon`);
      return false;
    }
    
    if (!(pokemon instanceof Pokemon)) {
      console.error('Solo se pueden añadir instancias de Pokemon');
      return false;
    }
    
    this.pokemonTeam.push(pokemon);
    return true;
  }

  /**
   * Elimina un Pokémon del equipo por índice
   * @param {number} index - Índice del Pokémon
   * @returns {boolean} True si se eliminó
   */
  removePokemon(index) {
    if (index >= 0 && index < this.pokemonTeam.length) {
      this.pokemonTeam.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Obtiene el número de Pokémon en el equipo
   * @returns {number} Cantidad de Pokémon
   */
  getPokemonCount() {
    return this.pokemonTeam.length;
  }

  /**
   * Verifica si el equipo está completo
   * @returns {boolean} True si tiene 6 Pokémon
   */
  isTeamComplete() {
    return this.pokemonTeam.length === 6;
  }

  /**
   * Obtiene Pokémon por tipo
   * @param {string} type - Tipo a buscar
   * @returns {Array} Pokémon del tipo especificado
   */
  getPokemonByType(type) {
    return this.pokemonTeam.filter(pokemon => pokemon.isType(type));
  }

  /**
   * Calcula el poder total del equipo
   * @returns {number} Suma del poder de todos los Pokémon
   */
  calculateTeamPower() {
    return this.pokemonTeam.reduce((total, pokemon) => {
      return total + pokemon.calculatePower();
    }, 0);
  }

  /**
   * Obtiene información resumida del entrenador
   * @returns {Object} Información del entrenador
   */
  getSummary() {
    return {
      name: this.name,
      region: this.region,
      specialty: this.specialty,
      pokemonCount: this.getPokemonCount(),
      teamComplete: this.isTeamComplete(),
      teamPower: this.calculateTeamPower()
    };
  }

  /**
   * Convierte el entrenador a formato JSON para guardar
   * @returns {Object} Representación JSON del entrenador
   */
  toJSON() {
    return {
      name: this.name,
      region: this.region,
      specialty: this.specialty,
      pokemonTeam: this.pokemonTeam.map(pokemon => pokemon.toJSON()),
      registrationDate: this.registrationDate
    };
  }

  /**
   * Crea una instancia de Trainer desde JSON
   * @param {Object} json - Datos del entrenador en JSON
   * @returns {Trainer} Nueva instancia de Trainer
   */
  static fromJSON(json) {
    const trainer = new Trainer(json.name, json.region, json.specialty);
    trainer.registrationDate = json.registrationDate || new Date().toISOString().split('T')[0];
    
    if (json.pokemonTeam && Array.isArray(json.pokemonTeam)) {
      json.pokemonTeam.forEach(pokemonData => {
        trainer.addPokemon(Pokemon.fromJSON(pokemonData));
      });
    }
    
    return trainer;
  }
}