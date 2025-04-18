class Trainer {
  constructor(name, region) {
    this.name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    this.region = region;
    this.pokemonTeam = []; 
  }

  addPokemon(pokemon) {
    if (this.pokemonTeam.length < 6) {
      this.pokemonTeam.push(pokemon);
      return true;
    }
    return false; 
  }

  // Convierte el entrenador a formato JSON para guardar
  toJSON() {
    return {
      name: this.name,
      region: this.region,
      pokemonTeam: this.pokemonTeam.map(p => p.toJSON())
    };
  }
}