// app/estanterias/styles.ts

const TEX_WOOD = 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")';
const TEX_DARK_WOOD = 'url("https://www.transparenttextures.com/patterns/dark-wood.png")';

export const WALL_STYLES = {
  ladrillo_clasico: {
    name: 'Ladrillo Clásico',
    bg: '#ffffff',
    texture: 'url("/textures/walls/pared-ladrillo.jpg")',
  },
  ladrillo_vines: {
    name: 'Ladrillo con Plantas',
    bg: '#ffffff',
    texture: 'url("/textures/walls/vines.jpg")',
  },
  papel_vintage: {
    name: 'Papel Vintage',
    bg: '#2c3e50',
    texture: 'url("/textures/walls/papel-vintage.jpg")',
  },
  listones_madera: {
    name: 'Panel de Listones',
    bg: '#2b2621',
    texture: 'url("/textures/walls/listones-madera.jpg")',
  },
  hormigon: {
    name: 'Hormigón Industrial',
    bg: '#555555',
    texture: 'url("/textures/walls/hormigon.jpg")',
  }
}

export const BOOKCASE_STYLES = {
  oscura: { 
    name: 'Madera oscura', 
    bg: '#8b5a2b', 
    border: '#5c3a18', 
    board: '#704722', 
    texture: 'url("/textures/bookcases/madera_oscura.jpg")', 
    text: 'text-amber-100', 
    btnBg: 'bg-black/30 hover:bg-black/50 text-white' 
  },
  blanco: { 
    name: 'Madera Blanca',  
    bg: '#f3f4f6', 
    border: '#d1d5db', 
    board: '#e5e7eb', 
    texture: 'url("/textures/bookcases/madera_blanca.jpg")', 
    text: 'text-gray-800', 
    btnBg: 'bg-black/10 hover:bg-black/20 text-gray-800' 
  },
  metal: { 
    name: 'Metalica',    
    bg: '#475569', 
    border: '#1e293b', 
    board: '#334155', 
    texture: 'url("/textures/bookcases/metal.jpg")', 
    text: 'text-slate-200', 
    btnBg: 'bg-white/10 hover:bg-white/20 text-white' 
  },
  madera: { 
    name: 'Madera Negra',   
    bg: '#1a1a1a', 
    border: '#000000', 
    board: '#111111', 
    texture: 'url("/textures/bookcases/madera.jpg")', 
    text: 'text-gray-300', 
    btnBg: 'bg-white/10 hover:bg-white/20 text-white' 
  },
  clara: { 
    name: 'Madera Clara',  
    bg: '#f3f4f6', 
    border: '#d1d5db', 
    board: '#e5e7eb', 
    texture: 'url("/textures/bookcases/madera_clara.jpg")', 
    text: 'text-gray-800', 
    btnBg: 'bg-black/10 hover:bg-black/20 text-gray-800' 
  }
}

export const SHELF_STYLES = {
  futurista: { 
    name: 'Panel Futurista', 
    bg: '#0f172a', 
    texture: 'url("/textures/shelves/futurista.jpg")', 
    text: 'text-cyan-400' 
  },
  hexagonal: { 
    name: 'Panel Hexagonal', 
    bg: '#0f172a', 
    texture: 'url("/textures/shelves/hexagonal.jpg")', 
    text: 'text-grey-400' 
  },
  terror: { 
    name: 'Madera Terrorífica', 
    bg: '#180505', 
    texture: 'url("/textures/shelves/madera-gotica.jpg")', 
    text: 'text-red-400' 
  },
  gotico: { 
    name: 'Panel Gotico', 
    bg: '#180505', 
    texture: 'url("/textures/shelves/gotico2.jpg")', 
    text: 'text-violet-400' 
  },
  noble: { 
    name: 'Madera Noble', 
    bg: '#c18551', 
    texture: 'url("/textures/shelves/noble.jpg")', 
    text: 'text-amber-100'
  },
  marmol: { 
    name: 'Marmol', 
    bg: '#45260a', 
    texture: 'url("/textures/shelves/marmol.jpg")', 
    text: 'text-gray-200' 
  },
  normal: { 
    name: 'Madera Normal', 
    bg: '#45260a', 
    texture: 'url("/textures/shelves/normal.jpg")', 
    text: 'text-amber-200' 
  },
  lava: { 
    name: 'Lava', 
    bg: '#2e1065', 
    texture: 'url("/textures/shelves/lava.jpg")', 
    text: 'text-red-300' 
  },
  cosmos: { 
    name: 'Cosmos', 
    bg: '#1ca6c9', 
    texture: 'url("/textures/shelves/cosmos.jpg")', 
    text: 'text-cyan-300' 
  },
  dragon: { 
    name: 'Escamas de Dragón', 
    bg: '#2e1065', 
    texture: 'url("/textures/shelves/dragon.jpg")', 
    text: 'text-purple-300' 
  },
}
