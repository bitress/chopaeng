import banner from '../assets/banner.png';

export type CatalogEntityType = 'item' | 'villager';

export interface CatalogEntity {
    id: string;
    name: string;
    entityType: CatalogEntityType;
    category: string;
    theme: string;
    series: string;
    interactivity: string;
    colour: string;
    image: string;
    description: string;
    variations?: Array<{
        id?: string;
        pokerId?: string;
        imageUrl?: string | null;
        Variation?: string;
        Pattern?: string;
        Colours?: string[];
        uniqueEntryId?: string;
    }>;
}

const IMAGE_FALLBACK = banner;

export const ITEMS: CatalogEntity[] = [
    {
        id: '1',
        entityType: 'item',
        name: 'Ironwood Dresser',
        category: 'Furniture',
        theme: 'Rustic',
        series: 'Ironwood',
        interactivity: 'Static',
        colour: 'Brown',
        image: IMAGE_FALLBACK,
        description: 'A sturdy rustic dresser perfect for cozy cabin and island home setups.'
    },
    {
        id: '2',
        entityType: 'item',
        name: 'Raymond Plush',
        category: 'Merch',
        theme: 'Cute',
        series: 'Villager',
        interactivity: 'Static',
        colour: 'Grey',
        image: IMAGE_FALLBACK,
        description: 'A cute Raymond plushie with signature heterochromia, ideal for any fan collection.'
    },
    {
        id: '3',
        entityType: 'item',
        name: 'Bunny Day Basket',
        category: 'Seasonal',
        theme: 'Festive',
        series: 'Event',
        interactivity: 'Interactive',
        colour: 'Pink',
        image: IMAGE_FALLBACK,
        description: 'A pastel basket filled with seasonal eggs and cheerful Bunny Day decorations.'
    },
    {
        id: '4',
        entityType: 'item',
        name: 'K.K. Slider Speaker',
        category: 'Electronics',
        theme: 'Music',
        series: 'K.K.',
        interactivity: 'Interactive',
        colour: 'Black',
        image: IMAGE_FALLBACK,
        description: 'A speaker designed to let K.K. Slider perform with island-wide audio flair.'
    },
    {
        id: '5',
        entityType: 'item',
        name: 'Bamboo Partition',
        category: 'Furniture',
        theme: 'Zen',
        series: 'Bamboo',
        interactivity: 'Static',
        colour: 'Green',
        image: IMAGE_FALLBACK,
        description: 'A natural bamboo screen that brings calm island vibes into any room.'
    },
    {
        id: '6',
        entityType: 'item',
        name: 'Royal Crown',
        category: 'Wearable',
        theme: 'Luxury',
        series: 'Crown',
        interactivity: 'Static',
        colour: 'Gold',
        image: IMAGE_FALLBACK,
        description: 'A luxurious crown fit for a royal look in Animal Crossing fashion scenes.'
    },
    {
        id: '7',
        entityType: 'item',
        name: 'Fujitsu Shinto Shrine',
        category: 'Outdoor',
        theme: 'Traditional',
        series: 'Temple',
        interactivity: 'Static',
        colour: 'Red',
        image: IMAGE_FALLBACK,
        description: 'A traditional shrine structure inspired by Japanese temple architecture.'
    },
    {
        id: '8',
        entityType: 'item',
        name: 'Ocean Dreams Bed',
        category: 'Furniture',
        theme: 'Coastal',
        series: 'Ocean',
        interactivity: 'Static',
        colour: 'Blue',
        image: IMAGE_FALLBACK,
        description: 'A dreamy bed with ocean-inspired tones for stylish seaside rooms.'
    },
    {
        id: '9',
        entityType: 'item',
        name: 'Playful Cart',
        category: 'Furniture',
        theme: 'Kids',
        series: 'Play',
        interactivity: 'Interactive',
        colour: 'Multicolor',
        image: IMAGE_FALLBACK,
        description: 'A colorful cart full of playful toys and interactive charm.'
    },
    {
        id: '10',
        entityType: 'item',
        name: 'Pallet Shelf',
        category: 'Furniture',
        theme: 'Rustic',
        series: 'Pallet',
        interactivity: 'Static',
        colour: 'Brown',
        image: IMAGE_FALLBACK,
        description: 'A practical pallet shelf with a rustic handmade texture.'
    },
    {
        id: '11',
        entityType: 'item',
        name: 'Flower Stand',
        category: 'Outdoor',
        theme: 'Garden',
        series: 'Floral',
        interactivity: 'Static',
        colour: 'White',
        image: IMAGE_FALLBACK,
        description: 'A simple stand perfect for displaying fresh flowers on a patio.'
    },
    {
        id: '12',
        entityType: 'item',
        name: 'Nook Inc. Sign',
        category: 'Decor',
        theme: 'Corporate',
        series: 'Nook',
        interactivity: 'Static',
        colour: 'Green',
        image: IMAGE_FALLBACK,
        description: 'A branded Nook Inc. sign for market stalls and business-themed islands.'
    },
    {
        id: '13',
        entityType: 'item',
        name: 'Snowman',
        category: 'Seasonal',
        theme: 'Winter',
        series: 'Snow',
        interactivity: 'Interactive',
        colour: 'White',
        image: IMAGE_FALLBACK,
        description: 'A festive winter buildable snowman item that looks perfect on snowy islands.'
    },
    {
        id: '14',
        entityType: 'item',
        name: 'Lily of the Valley',
        category: 'Decor',
        theme: 'Floral',
        series: 'Flower',
        interactivity: 'Static',
        colour: 'White',
        image: IMAGE_FALLBACK,
        description: 'A delicate lily arrangement ideal for elegant garden displays.'
    },
    {
        id: '15',
        entityType: 'item',
        name: 'Vintage Radio',
        category: 'Electronics',
        theme: 'Retro',
        series: 'Radio',
        interactivity: 'Interactive',
        colour: 'Orange',
        image: IMAGE_FALLBACK,
        description: 'A retro radio with a warm, classic look for cozy living spaces.'
    },
    {
        id: '16',
        entityType: 'item',
        name: 'Pumpkin Table',
        category: 'Furniture',
        theme: 'Seasonal',
        series: 'Halloween',
        interactivity: 'Static',
        colour: 'Orange',
        image: IMAGE_FALLBACK,
        description: 'A seasonal table carved from pumpkin, great for fall-themed islands.'
    }
    ,
    {
        id: '17',
        entityType: 'item',
        name: 'Nook Miles Ticket',
        category: 'Currency',
        theme: 'Travel',
        series: 'Ticket',
        interactivity: 'Consumable',
        colour: 'Blue',
        image: IMAGE_FALLBACK,
        description: 'A Nook Miles Ticket used for special island tours.'
    },
    {
        id: '18',
        entityType: 'item',
        name: 'Royal Crown',
        category: 'Wearable',
        theme: 'Luxury',
        series: 'Crown',
        interactivity: 'Static',
        colour: 'Gold',
        image: IMAGE_FALLBACK,
        description: 'A luxurious crown fit for a royal look in Animal Crossing fashion scenes.'
    },
    {
        id: '19',
        entityType: 'item',
        name: '99,000 Bells',
        category: 'Currency',
        theme: 'Wealth',
        series: 'Bells',
        interactivity: 'Consumable',
        colour: 'Yellow',
        image: IMAGE_FALLBACK,
        description: 'A pile of Bells — 99,000 to spend on island luxuries.'
    }
];

export const VILLAGERS: CatalogEntity[] = [
    {
        id: 'v1',
        entityType: 'villager',
        name: 'Raymond',
        category: 'Smug',
        theme: 'Cat',
        series: 'Villager',
        interactivity: 'Friendly',
        colour: 'Grey',
        image: IMAGE_FALLBACK,
        description: 'A popular cat villager with stylish glasses and a snarky but charming personality.'
    },
    {
        id: 'v2',
        entityType: 'villager',
        name: 'Judy',
        category: 'Snooty',
        theme: 'Cub',
        series: 'Villager',
        interactivity: 'Sweet',
        colour: 'Purple',
        image: IMAGE_FALLBACK,
        description: 'A dreamy bear cub with sparkling eyes and a personality that loves attention.'
    },
    {
        id: 'v3',
        entityType: 'villager',
        name: 'Marshal',
        category: 'Smug',
        theme: 'Squirrel',
        series: 'Villager',
        interactivity: 'Cool',
        colour: 'White',
        image: IMAGE_FALLBACK,
        description: 'A tiny squirrel with a chilled attitude and a classic musician-inspired wardrobe.'
    },
    {
        id: 'v4',
        entityType: 'villager',
        name: 'Audie',
        category: 'Peppy',
        theme: 'Wolf',
        series: 'Villager',
        interactivity: 'Energetic',
        colour: 'Orange',
        image: IMAGE_FALLBACK,
        description: 'A lively wolf villager known for her sunshine personality and upbeat vibes.'
    },
    {
        id: 'v5',
        entityType: 'villager',
        name: 'Sherb',
        category: 'Lazy',
        theme: 'Goat',
        series: 'Villager',
        interactivity: 'Chill',
        colour: 'Light Blue',
        image: IMAGE_FALLBACK,
        description: 'A mellow goat villager who enjoys snacks, naps, and easygoing island life.'
    },
    {
        id: 'v6',
        entityType: 'villager',
        name: 'Merry',
        category: 'Normal',
        theme: 'Cat',
        series: 'Villager',
        interactivity: 'Kind',
        colour: 'Cream',
        image: IMAGE_FALLBACK,
        description: 'A sweet and caring cat villager with a gentle personality and pastel style.'
    },
    {
        id: 'v7',
        entityType: 'villager',
        name: 'Diana',
        category: 'Snooty',
        theme: 'Deer',
        series: 'Villager',
        interactivity: 'Elegant',
        colour: 'White',
        image: IMAGE_FALLBACK,
        description: 'A refined deer villager with a graceful aesthetic and polished manner.'
    },
    {
        id: 'v8',
        entityType: 'villager',
        name: 'Lolly',
        category: 'Normal',
        theme: 'Cat',
        series: 'Villager',
        interactivity: 'Relaxed',
        colour: 'Pink',
        image: IMAGE_FALLBACK,
        description: 'A sweet cat villager who loves baking, reading, and gentle conversation.'
    }
];

export const getCatalogEntities = (type: CatalogEntityType) =>
    type === 'item' ? ITEMS : VILLAGERS;

export const findCatalogEntity = (type: CatalogEntityType, id: string) =>
    getCatalogEntities(type).find((entity) => entity.id === id) || null;
