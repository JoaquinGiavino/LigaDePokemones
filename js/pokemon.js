class Pokemon {
  constructor(id, name, type, moves) {
    this.id = id; 
    this.name = name; 
    this.type = type; 
    this.moves = moves.slice(0, 4); 
  }

  // Convierte el Pokémon a formato JSON para guardar
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      moves: this.moves
    };
  }
}

class Move {
  constructor(name, effect) {
    this.name = name; 
    this.effect = effect; 
  }
}