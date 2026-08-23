export interface JukeboxTrack {
    id: string;
    title: string;
    artist: string;
    category: 'K.K. Classics' | 'Upbeat Hits' | 'Cozy Lofi' | 'Rock & Grooves';
    mood: string;
    coverUrl?: string;
    duration?: string;
    // Authentic recorded K.K. Slider Live / Studio MP3 audio
    audioUrl: string;
    // Radio version stream
    radioAudioUrl?: string;
}

export const KK_JUKEBOX_TRACKS: JukeboxTrack[] = [
    {
        id: 'bubblegum-kk',
        title: 'Bubblegum K.K.',
        artist: 'K.K. Slider',
        category: 'Upbeat Hits',
        mood: 'Sweet & Energetic Pop',
        coverUrl: 'https://dodo.ac/np/images/e/e3/Bubblegum_K.K._NH_Album_Art.png',
        audioUrl: 'https://archive.org/download/the-complete-k.k.-slider/1.90%20Bubblegum%20K.K..mp3',
        duration: '2:15',
    },
    {
        id: 'welcome-horizons',
        title: 'Welcome Horizons',
        artist: 'K.K. Slider',
        category: 'K.K. Classics',
        mood: 'Tropical Island Sunrise',
        coverUrl: 'https://dodo.ac/np/images/9/91/Welcome_Horizons_NH_Album_Art.png',
        audioUrl: 'https://archive.org/download/the-complete-k.k.-slider/1.01%20Welcome%20Horizons.mp3',
        radioAudioUrl: 'https://archive.org/download/the-complete-k.k.-slider/2.01%20Welcome%20Horizons%20%28Radio%29.mp3',
        duration: '2:24',
    },
    {
        id: 'kk-cruisin',
        title: 'K.K. Cruisin’',
        artist: 'K.K. Slider',
        category: 'K.K. Classics',
        mood: 'Smooth Late-Night R&B',
        coverUrl: 'https://dodo.ac/np/images/2/23/K.K._Cruisin%27_NH_Album_Art.png',
        audioUrl: 'https://archive.org/download/the-complete-k.k.-slider/1.37%20K.K.%20Cruisin%27.mp3',
        radioAudioUrl: 'https://archive.org/download/the-complete-k.k.-slider/2.36%20K.K.%20Cruisin%27%20%28Radio%29.mp3',
        duration: '2:28',
    },
    {
        id: 'stale-cupcakes',
        title: 'Stale Cupcakes',
        artist: 'K.K. Slider',
        category: 'Cozy Lofi',
        mood: 'Nostalgic & Peaceful',
        coverUrl: 'https://dodo.ac/np/images/8/87/Stale_Cupcakes_NH_Album_Art.png',
        audioUrl: 'https://archive.org/download/the-complete-k.k.-slider/1.73%20Stale%20Cupcakes.mp3',
        duration: '2:18',
    },
    {
        id: 'kk-disco',
        title: 'K.K. Disco',
        artist: 'K.K. Slider',
        category: 'Upbeat Hits',
        mood: 'Funky 70s Dance Boogie',
        coverUrl: 'https://dodo.ac/np/images/4/4b/K.K._Disco_NH_Album_Art.png',
        audioUrl: 'https://archive.org/download/the-complete-k.k.-slider/1.92%20K.K.%20Disco.mp3',
        duration: '2:16',
    },
    {
        id: 'kk-bossa',
        title: 'K.K. Bossa',
        artist: 'K.K. Slider',
        category: 'K.K. Classics',
        mood: 'Acoustic Bossa Nova',
        coverUrl: 'https://dodo.ac/np/images/e/e0/K.K._Bossa_NH_Album_Art.png',
        audioUrl: 'https://archive.org/download/the-complete-k.k.-slider/1.13%20K.K.%20Bossa.mp3',
        radioAudioUrl: 'https://archive.org/download/the-complete-k.k.-slider/2.12%20K.K.%20Bossa%20%28Radio%29.mp3',
        duration: '2:14',
    },
    {
        id: 'kk-house',
        title: 'K.K. House',
        artist: 'K.K. Slider',
        category: 'Upbeat Hits',
        mood: 'Club Dance & Electro',
        coverUrl: 'https://dodo.ac/np/images/5/52/K.K._House_NH_Album_Art.png',
        audioUrl: 'https://archive.org/download/the-complete-k.k.-slider/1.76%20K.K.%20House.mp3',
        duration: '2:18',
    },
    {
        id: 'forest-life',
        title: 'Forest Life',
        artist: 'K.K. Slider',
        category: 'K.K. Classics',
        mood: 'Nostalgic GameCube Melody',
        coverUrl: 'https://dodo.ac/np/images/thumb/5/52/Isabelle_NH_Artwork.png/200px-Isabelle_NH_Artwork.png',
        audioUrl: 'https://archive.org/download/the-complete-k.k.-slider/1.59%20Forest%20Life.mp3',
        duration: '2:14',
    },
    {
        id: 'drivin',
        title: 'Drivin’',
        artist: 'K.K. Slider',
        category: 'Cozy Lofi',
        mood: 'City Highway Night Cruise',
        coverUrl: 'https://dodo.ac/np/images/thumb/7/7b/Wilbur_NH_Artwork.png/200px-Wilbur_NH_Artwork.png',
        audioUrl: 'https://archive.org/download/the-complete-k.k.-slider/1.95%20Drivin%27.mp3',
        duration: '2:21',
    },
    {
        id: 'go-kk-rider',
        title: 'Go K.K. Rider!',
        artist: 'K.K. Slider',
        category: 'Rock & Grooves',
        mood: 'High Octane Superhero Beat',
        coverUrl: 'https://dodo.ac/np/images/thumb/0/03/Tom_Nook_NH_Artwork.png/200px-Tom_Nook_NH_Artwork.png',
        audioUrl: 'https://archive.org/download/the-complete-k.k.-slider/1.48%20Go%20K.K.%20Rider%21.mp3',
        radioAudioUrl: 'https://archive.org/download/the-complete-k.k.-slider/2.47%20Go%20K.K.%20Rider%21%20%28Radio%29.mp3',
        duration: '2:13',
    },
    {
        id: 'kk-metal',
        title: 'K.K. Metal',
        artist: 'K.K. Slider',
        category: 'Rock & Grooves',
        mood: 'Heavy Rock & Hardcore Solo',
        coverUrl: 'https://dodo.ac/np/images/thumb/3/30/Celeste_NH_Artwork.png/200px-Celeste_NH_Artwork.png',
        audioUrl: 'https://archive.org/download/the-complete-k.k.-slider/1.72%20K.K.%20Metal.mp3',
        duration: '2:14',
    },
    {
        id: 'cafe-kk',
        title: 'Café K.K.',
        artist: 'K.K. Slider',
        category: 'Cozy Lofi',
        mood: 'Roost Coffee Vibe',
        coverUrl: 'https://dodo.ac/np/images/thumb/5/52/Isabelle_NH_Artwork.png/200px-Isabelle_NH_Artwork.png',
        audioUrl: 'https://archive.org/download/the-complete-k.k.-slider/1.52%20Caf%C3%A9%20K.K..mp3',
        duration: '2:14',
    },
];
