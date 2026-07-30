import type { CatalogEntity } from './commandBuilderData';

export interface ExplorerItem {
    Name: string;
    Category: string;
    'Internal ID': string;
    Buy: string;
    Sell: string;
    Source?: string;
    HHA?: string;
    HHA2?: string;
    Interact?: string;
    Series?: string;
    ExchangePrice?: string;
    ExchangeCurrency?: string;
    StackSize?: string;
    DIY?: string;
    SeasonEvent?: string;
    Description?: string;
    CatchPhrase?: string;
    Genuine?: string;
    ItemTag?: string;
    FossilGroup?: string;
    Colours?: string[];
    BodyTitle?: string;
    PatternTitle?: string;
    Variations?: Array<{
        Variation: string;
        Pattern?: string;
        id?: string;
        pokerId?: string;
        Filename?: string;
        imageUrl?: string;
        Colours?: string[];
        uniqueEntryId?: string;
    }>;
}

const FALLBACK_IMAGE = 'https://via.placeholder.com/150?text=No+Image';

let _fetchPromise: Promise<any> | null = null;

export const fetchExplorerData = async (): Promise<any> => {
    if (!_fetchPromise) {
        _fetchPromise = fetch('/explorer.json').then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        });
    }
    return _fetchPromise;
};

export const loadExplorerItems = async (): Promise<CatalogEntity[]> => {
    try {
        const data = await fetchExplorerData();
        const items: ExplorerItem[] = Array.isArray(data) ? data : data.items || [];
        
        return items.map((item) => {
            const hexId = item['Internal ID'] || item.Name.toLowerCase().replace(/\s+/g, '_');
            const firstVariation = item.Variations?.[0];
            const imageUrl = firstVariation?.imageUrl || FALLBACK_IMAGE;
            
            return {
                id: hexId,
                name: item.Name,
                entityType: 'item' as const,
                category: item.Category || 'Misc',
                theme: item.HHA || 'Standard',
                series: item.Series || 'General',
                interactivity: (item.Interact || 'Static') as 'Interactive' | 'Static',
                colour: item.Colours?.[0] || 'Various',
                image: imageUrl,
                description: item.Description || item.CatchPhrase || `A ${item.Category} from Animal Crossing.`,
                variations: item.Variations || [],
            };
        });
    } catch (error) {
        console.error('Failed to load explorer data:', error);
        return [];
    }
};

