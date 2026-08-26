import { villagers } from '@bitress/animal-crossing';

const raymond = villagers.find(v => v.name.toLowerCase() === 'raymond');
console.log('Raymond full info:', {
    name: raymond?.name,
    species: raymond?.species,
    personality: raymond?.personality,
    gender: raymond?.gender,
    birthday: raymond?.birthday,
    catchphrase: raymond?.catchphrase,
    favoriteSaying: raymond?.favoriteSaying,
    favoriteSong: raymond?.favoriteSong,
    hobby: raymond?.hobby,
    subtype: raymond?.subtype,
    styles: raymond?.styles,
    colors: raymond?.colors,
    defaultClothing: raymond?.defaultClothing,
    wallpaper: raymond?.wallpaper,
    flooring: raymond?.flooring,
    furnitureNameList: raymond?.furnitureNameList,
    houseImage: raymond?.houseImage,
    photoImage: raymond?.photoImage,
    iconImage: raymond?.iconImage,
});
