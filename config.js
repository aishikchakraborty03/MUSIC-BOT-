const config = {
    // Discord Bot Token - Get from environment variable
    TOKEN: process.env.DISCORD_TOKEN || 'your_bot_token_here',
    
    // Command prefix
    PREFIX: '!',
    
    // Bot configuration
    MAX_QUEUE_SIZE: 100,
    DEFAULT_VOLUME: 50,
    MAX_VOLUME: 100,
    
    // Colors for embeds (in hex)
    COLORS: {
        PRIMARY: '#7289DA',
        SUCCESS: '#43B581', 
        ERROR: '#F04747',
        WARNING: '#FAA61A',
        MUSIC: '#9B59B6',
        GIVEAWAY: '#E67E22'
    },
    
    // Music filters
    FILTERS: {
        bassboost: 'bass=g=20',
        nightcore: 'aresample=48000,asetrate=48000*1.25',
        vaporwave: 'aresample=48000,asetrate=48000*0.8',
        '3d': 'apulsator=hz=0.125',
        tremolo: 'tremolo',
        vibrato: 'vibrato=f=6.5',
        reverse: 'areverse',
        treble: 'treble=g=5',
        normalizer: 'dynaudnorm=g=101',
        surrounding: 'surround',
        pulsator: 'apulsator=hz=1',
        subboost: 'asubboost',
        karaoke: 'pan=1c|c0=0.5*c0+0.5*c1|c1=0.5*c0-0.5*c1',
        flanger: 'flanger',
        gate: 'agate',
        haas: 'haas',
        mcompand: 'mcompand',
        phaser: 'aphaser',
        earwax: 'earwax'
    },
    
    // YouTube search options
    YOUTUBE_OPTIONS: {
        maxResults: 1,
        key: process.env.YOUTUBE_API_KEY || null
    },
    
    // Voice connection options
    VOICE_OPTIONS: {
        selfDeaf: true,
        selfMute: false
    }
};

module.exports = config;
