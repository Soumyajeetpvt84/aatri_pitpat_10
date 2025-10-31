export type Page = 'home' | 'memories' | 'map' | 'archive';

export interface Memory {
  id: string;
  imageUrl: string;
  imageB64: string;
  caption: string;
  date: string;
  mood: 'joy' | 'love' | 'nostalgia' | 'serene';
  location?: Location;
}

export interface Location {
  lat: number;
  lng: number;
  name: string;
}

export interface MoodResponse {
  caption_line: string;
  bg_tone: string;
  emoji_hint: string;
}
