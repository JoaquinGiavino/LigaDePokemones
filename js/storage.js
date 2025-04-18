class StorageHandler {
  // Carga los entrenadores desde el archivo JSON
  static async loadTrainers() {
    try {
      // Intenta cargar desde localStorage primero 
      const localData = localStorage.getItem('pokemonTrainers');
      if (localData) {
        return JSON.parse(localData);
      }
      
      // Si no hay datos en localStorage, carga el archivo JSON inicial
      const response = await fetch('data/trainers.json');
      if (!response.ok) throw new Error('Error loading trainers');
      const data = await response.json();
      
      // Guarda en localStorage para futuras cargas
      localStorage.setItem('pokemonTrainers', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Error:', error);
      return []; // Devuelve array vacío si hay error
    }
  }

  // Guarda un nuevo entrenador
  static async saveTrainer(trainer) {
    try {
      // Cargar entrenadores existentes
      const trainers = await this.loadTrainers();
      
      // Limitar a 10 entrenadores 
      if (trainers.length >= 10) {
        trainers.shift();
      }
      
      // Añadir nuevo entrenador
      trainers.push(trainer);
      
      // Guardar en localStorage
      localStorage.setItem('pokemonTrainers', JSON.stringify(trainers));
      return true;
    } catch (error) {
      console.error('Error saving trainer:', error);
      return false;
    }
  }
}