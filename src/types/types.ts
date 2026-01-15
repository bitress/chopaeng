export type AccessLevel = 'Member' | 'Free';
export type ItemCategory =
    | 'Furniture'
    | 'Villagers'
    | 'DIY Recipes'
    | 'Clothing'
    | 'Materials';
export interface CatalogItem {
    id: number;
    name: string;
    category: ItemCategory;
    island: string;
    access: AccessLevel;
    icon: string;
}

export interface CategoryOption {
    name: ItemCategory | 'All';
    icon: string;
}