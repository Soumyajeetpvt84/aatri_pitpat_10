import { Memory } from '../types';

// NOTE: Images are Base64 encoded to be self-contained within the app.
// In a real-world scenario, these would likely be URLs pointing to a cloud storage bucket.

const cafeImageB64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAUEBAUEAwUFBAUGBgUGCA4JCAcHCBEMDAoLCw4VERcoDhYdERkYFRIhGCEeHx4gJCMfHyAbJysjJCYoKDYoKDX/2wBDAQEBAQICAgQCAgQJBgUGCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQn/wAARCAAgACADAREAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAUGBAf/xAAjEAACAgICAgEFAAAAAAAAAAAAAQIDBBEhEgUTFDFBUXGR/8QAFgEBAQEAAAAAAAAAAAAAAAAFAgME/8QAHBEAAgICAwEAAAAAAAAAAAAAAQIAEQMSIUFR/9oADAMBAAIRAxEAPwD28AcQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABy2Ssxqqbsl+FGKbbfwVwXlGRnZtLqjL9Upr4ba2/bF/LJWz15i1zW+K4pS+k+xXGZfL4+jrp7rFL7fK/Q1zM+xW0U31V7Xy3NKSX19gO4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//2Q==";

const parkImageB64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAUEBAUEAwUFBAUGBgUGCA4JCAcHCBEMDAoLCw4VERcoDhYdERkYFRIhGCEeHx4gJCMfHyAbJysjJCYoKDYoKDX/2wBDAQEBAQICAgQCAgQJBgUGCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQn/wAARCAAgACADAREAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAYEBf/xAAhEAACAQQCAgMAAAAAAAAAAAAAAQIDBBEFEiExQVFhgf/EABcBAQEBAQAAAAAAAAAAAAAAAAQDBQP/xAAeEQABAwQDAAAAAAAAAAAAAAABAAIDBBESIRMxUf/aAAwDAQACEQMRAD8A60AAAAAAAAAAAAACv4rcVKOlWjTaUshtSeO2l+yaA5a/iXFKcpQo0KM4p8RcqyUn/ACdD4Rczu9JqO6alUpzUOfGMlxnLPrg6QAHoAAAAAAAAAAAAAH//Z";

const beachImageB64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAUEBAUEAwUFBAUGBgUGCA4JCAcHCBEMDAoLCw4VERcoDhYdERkYFRIhGCEeHx4gJCMfHyAbJysjJCYoKDYoKDX/2wBDAQEBAQICAgQCAgQJBgUGCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQn/wAARCAAgACADAREAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAYEBf/xAAgEAACAgICAgMAAAAAAAAAAAAAAQIDBBEhMRJBYQUG/8QAFwEBAQEBAAAAAAAAAAAAAAAAAgMEA//EABsRAQEAAgMBAAAAAAAAAAAAAAEAAhEDBCEx/9oADAMBAAIRAxEAPwDuIAAAAAAAAAAAAAAAAAAAAAAAAZd/b1VbKNVcynJfUoR24p98/oDj7vM5G3UoO+50Vz9MWlj3x+2dAABuAAAAAAAAAAAAAAAAAAAAA//2Q==";


export const seedMemories: Memory[] = [
  {
    id: 'seed-1',
    imageUrl: cafeImageB64,
    imageB64: cafeImageB64.split(',')[1],
    caption: "Warming our hands and hearts on a chilly afternoon. Every coffee tastes better with you.",
    date: new Date('2023-10-26').toLocaleDateString(),
    mood: 'serene',
    location: { lat: 48.8566, lng: 2.3522, name: "A Little Café in Paris" }
  },
  {
    id: 'seed-2',
    imageUrl: parkImageB64,
    imageB64: parkImageB64.split(',')[1],
    caption: "A perfect, sun-drenched day with my sunshine. Laughter in the park.",
    date: new Date('2024-05-15').toLocaleDateString(),
    mood: 'joy',
    location: { lat: 40.785091, lng: -73.968285, name: "Strolling Through Central Park" }
  },
  {
    id: 'seed-3',
    imageUrl: beachImageB64,
    imageB64: beachImageB64.split(',')[1],
    caption: "Chasing sunsets and dreaming of our future. This moment felt like forever.",
    date: new Date('2024-07-21').toLocaleDateString(),
    mood: 'love',
    location: { lat: 34.0194, lng: -118.4912, name: "Sunset at Santa Monica Pier" }
  },
];
