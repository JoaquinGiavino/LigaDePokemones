class Pokemon {
  constructor(id, name, type, abilities = [], baseStats = {}, moves = []) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.abilities = abilities.slice(0, 2); // Máximo 2 habilidades
    this.baseStats = {
      hp: baseStats.hp || 0,
      attack: baseStats.attack || 0,
      defense: baseStats.defense || 0
    };
    this.moves = moves.slice(0, 4); // Máximo 4 movimientos
  }

  /**
   * Calcula el poder total del Pokémon
   * @returns {number} Poder total (HP + Attack + Defense)
   */
  calculatePower() {
    return this.baseStats.hp + this.baseStats.attack + this.baseStats.defense;
  }

  /**
   * Obtiene la habilidad principal
   * @returns {string} Primera habilidad o "Sin habilidad"
   */
  getMainAbility() {
    return this.abilities.length > 0 ? this.abilities[0] : "Sin habilidad";
  }

  /**
   * Verifica si el Pokémon es de un tipo específico
   * @param {string} type - Tipo a verificar
   * @returns {boolean} True si es del tipo
   */
  isType(type) {
    return this.type.toLowerCase() === type.toLowerCase();
  }

  /**
   * Convierte el Pokémon a formato JSON para guardar
   * @returns {Object} Representación JSON del Pokémon
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      abilities: this.abilities,
      baseStats: this.baseStats,
      moves: this.moves.map(move => move.toJSON ? move.toJSON() : move)
    };
  }

  /**
   * Crea una instancia de Pokémon desde JSON
   * @param {Object} json - Datos del Pokémon en JSON
   * @returns {Pokemon} Nueva instancia de Pokémon
   */
  static fromJSON(json) {
    const moves = json.moves.map(move => 
      move.name ? new Move(move.name, move.effect) : move
    );
    
    return new Pokemon(
      json.id,
      json.name,
      json.type,
      json.abilities || [],
      json.baseStats || {},
      moves
    );
  }
}

/**
 * Clase que representa un movimiento de Pokémon
 */
class Move {
  constructor(name, effect = "", power = null, accuracy = null) {
    this.name = name;
    this.effect = effect;
    this.power = power;
    this.accuracy = accuracy;
  }

  /**
   * Obtiene información del movimiento
   * @returns {string} Descripción completa del movimiento
   */
  getDescription() {
    let desc = `${this.name}`;
    if (this.power) desc += ` (Poder: ${this.power})`;
    if (this.accuracy) desc += ` (Precisión: ${this.accuracy}%)`;
    if (this.effect) desc += ` - ${this.effect}`;
    return desc;
  }

  /**
   * Convierte el movimiento a formato JSON
   * @returns {Object} Representación JSON del movimiento
   */
  toJSON() {
    return {
      name: this.name,
      effect: this.effect,
      power: this.power,
      accuracy: this.accuracy
    };
  }
}