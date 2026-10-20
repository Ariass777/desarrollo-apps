export const TYPE_ES: Record<string, string> = {
  normal: 'Normal', fire: 'Fuego', water: 'Agua', grass: 'Planta', electric: 'Eléctrico',
  ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno', ground: 'Tierra', flying: 'Volador',
  psychic: 'Psíquico', bug: 'Bicho', rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón',
  dark: 'Siniestro', steel: 'Acero', fairy: 'Hada',
};

export const TYPE_COLOR: Record<string, string> = {
  normal: '#A8A878', fire: '#F08030', water: '#6890F0', grass: '#78C850', electric: '#F8D030',
  ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0', ground: '#E0C068', flying: '#A890F0',
  psychic: '#F85888', bug: '#A8B820', rock: '#B8A038', ghost: '#705898', dragon: '#7038F8',
  dark: '#705848', steel: '#B8B8D0', fairy: '#EE99AC',
};

export function typeEs(type: string | undefined): string {
  const key = (type ?? '').toLowerCase();
  return TYPE_ES[key] ?? type ?? '';
}

export function typeColor(type: string | undefined): string {
  return TYPE_COLOR[(type ?? '').toLowerCase()] ?? '#A8A878';
}

export function pretty(value: string | undefined): string {
  return (value ?? '').replace(/-/g, ' ');
}
