const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DisTube } = require('distube');
const { YouTubePlugin } = require('@distube/youtube');
const config = require('./config');
const musicCommands = require('./commands/music');
const adminCommands = require('./commands/admin');
const giveawayCommands = require('./commands/giveaway');
const helpCommands = require('./commands/help');
const premiumCommands = require('./commands/premium');
const dolbyCommands = require('./commands/dolby');
const { checkAdminPermissions } = require('./utils/permissions');
const { createErrorEmbed, createMusicEmbed, createSuccessEmbed } = require('./utils/embedBuilder');

// Create Discord client with required intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// Initialize command collections
client.commands = new Collection();
client.giveaways = new Collection();

// Initialize DisTube with Dolby Atmos and high-quality audio settings
client.distube = new DisTube(client, {
    nsfw: false,
    emitNewSongOnly: true,
    plugins: [new YouTubePlugin({
        ytdlOptions: {
            quality: 'highestaudio',
            filter: 'audioonly',
            highWaterMark: 1 << 25,
            dlChunkSize: 0
        }
    })],
    customFilters: {
        // Dolby Atmos & Immersive Audio
        'dolbyatmos': 'aecho=0.8:0.9:1000|1800|2500:0.4|0.3|0.2,extrastereo=m=2.5,compand=attacks=0.3:decays=0.8,loudnorm',
        'atmos': 'aecho=0.8:0.88:800|1200|1600:0.4|0.3|0.2,extrastereo=m=2.2,bass=g=5',
        'immersive': 'aecho=0.8:0.9:1000|1800|2500:0.4|0.3|0.2,extrastereo=m=2.8,compand',
        'spatial': 'apulsator=hz=0.08,extrastereo=m=2.2,aecho=0.8:0.88:1200|2000:0.35|0.25',
        
        // 3D Spatial Effects
        '8d': 'apulsator=hz=0.125,aecho=0.8:0.9:1000:0.3,extrastereo=m=1.8',
        '3d': 'extrastereo=m=2.5,aecho=0.8:0.88:6:0.4',
        'surround': 'aecho=0.8:0.9:1500|2500:0.3|0.25,extrastereo=m=2',
        'widener': 'extrastereo=m=3.5,aecho=0.8:0.7:500:0.2',
        
        // Bass Enhancement
        'bassboost': 'bass=g=20,dynaudnorm=f=200',
        'superbass': 'bass=g=25,treble=g=-5,dynaudnorm=f=200',
        'megabass': 'bass=g=30,treble=g=-10,loudnorm',
        
        // Audio Enhancement
        'ultraclear': 'highpass=f=200,lowpass=f=3000,dynaudnorm=f=75',
        'crystalclear': 'equalizer=f=1000:width_type=h:width=200:g=2,dynaudnorm=f=50',
        'studio': 'compand=attacks=0.3:decays=0.8:points=-70/-70|-24/-12|0/-6:soft-knee=0.5',
        
        // Creative Effects
        'nightcore': 'aresample=48000,asetrate=48000*1.25',
        'daycore': 'aresample=48000,asetrate=48000*0.8',
        'chipmunk': 'aresample=48000,asetrate=48000*1.5',
        'deep': 'aresample=48000,asetrate=48000*0.7',
        
        // Professional Processing
        'compressor': 'acompressor=threshold=0.089:ratio=9:attack=200:release=1000',
        'limiter': 'alimiter=level_in=1:level_out=0.8:limit=0.8',
        'gate': 'agate=threshold=0.01:ratio=2:attack=20:release=20',
        
        // Venue Simulation
        'hall': 'aecho=0.8:0.9:1000|1800:0.3|0.25',
        'stadium': 'aecho=0.8:0.9:2000|3000:0.4|0.3',
        'church': 'aecho=0.8:0.88:1500|2500:0.5|0.4',
        'underwater': 'lowpass=f=500,aecho=0.8:0.7:1000:0.3',
        
        // Vintage & Character
        'vintage': 'highpass=f=100,lowpass=f=8000,compand',
        'radio': 'highpass=f=300,lowpass=f=3000,volume=0.7',
        'telephone': 'highpass=f=400,lowpass=f=2500,volume=0.6',
        'lofi': 'lowpass=f=3000,highpass=f=200,volume=0.8',
        
        // Genre Presets
        'rock': 'equalizer=f=60:width_type=h:width=200:g=4,equalizer=f=170:width_type=h:width=200:g=3',
        'pop': 'equalizer=f=100:width_type=h:width=200:g=2,equalizer=f=1000:width_type=h:width=200:g=3',
        'electronic': 'bass=g=8,treble=g=5,equalizer=f=8000:width_type=h:width=200:g=3',
        'classical': 'equalizer=f=250:width_type=h:width=200:g=2,equalizer=f=4000:width_type=h:width=200:g=2'
    }
});

// Register commands
const allCommands = {
    ...musicCommands,
    ...adminCommands,
    ...giveawayCommands,
    ...helpCommands,
    ...premiumCommands,
    ...dolbyCommands
};

Object.keys(allCommands).forEach(commandName => {
    client.commands.set(commandName, allCommands[commandName]);
});

// Bot ready event
client.once('ready', () => {
    console.log(`🎵 ${client.user.tag} is now online!`);
    console.log(`📊 Serving ${client.guilds.cache.size} servers`);
    
    // Set bot activity
    client.user.setActivity('🎵 Music | !help for commands', { type: 'LISTENING' });
});

// Handle incoming messages
client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    const prefix = config.PREFIX;
    const content = message.content.trim();
    
    // Handle no-prefix admin commands
    const noPrefixCommands = ['pause', 'resume', 'skip', 'stop', 'queue'];
    
    if (noPrefixCommands.includes(content.toLowerCase())) {
        // Check if user has admin permissions
        if (!checkAdminPermissions(message.member)) {
            const errorEmbed = createErrorEmbed(
                'Permission Denied',
                'Only administrators can use no-prefix commands!'
            );
            return message.reply({ embeds: [errorEmbed] });
        }
        
        // Execute the command as if it had a prefix
        const command = client.commands.get(content.toLowerCase());
        if (command) {
            try {
                await command.execute(message, [], client);
            } catch (error) {
                console.error('Error executing no-prefix command:', error);
                const errorEmbed = createErrorEmbed(
                    'Command Error',
                    'An error occurred while executing the command.'
                );
                message.reply({ embeds: [errorEmbed] });
            }
        }
        return;
    }

    // Handle prefixed commands
    if (!content.startsWith(prefix)) return;

    const args = content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        const errorEmbed = createErrorEmbed(
            'Command Error',
            'There was an error executing this command!'
        );
        message.reply({ embeds: [errorEmbed] });
    }
});

// DisTube events
client.distube
    .on('playSong', (queue, song) => {
        const embed = createMusicEmbed(
            '🎵 Now Playing',
            `[${song.name}](${song.url})\nRequested by: ${song.user}`,
            song.thumbnail,
            config.COLORS.MUSIC
        );
        embed.addFields([
            { name: '⏱️ Duration', value: song.formattedDuration, inline: true },
            { name: '👀 Views', value: song.views ? song.views.toLocaleString() : 'Unknown', inline: true },
            { name: '📻 Channel', value: song.uploader?.name || 'Unknown', inline: true }
        ]);
        queue.textChannel.send({ embeds: [embed] });
    })
    .on('addSong', (queue, song) => {
        const embed = createSuccessEmbed(
            '✅ Added to Queue',
            `[${song.name}](${song.url})\nPosition in queue: **${queue.songs.length}**`
        );
        embed.setThumbnail(song.thumbnail);
        queue.textChannel.send({ embeds: [embed] });
    })
    .on('empty', queue => {
        const embed = createMusicEmbed(
            '💤 Queue Empty',
            'No more songs in queue. Use `!play` to add music!',
            null,
            config.COLORS.WARNING
        );
        queue.textChannel.send({ embeds: [embed] });
    })
    .on('error', (textChannel, error) => {
        console.error('DisTube error:', error);
        const embed = createErrorEmbed(
            'Playback Error',
            'An error occurred while playing music. Please try again.'
        );
        if (textChannel) textChannel.send({ embeds: [embed] });
    });

// Error handling
client.on('error', error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(config.TOKEN);
