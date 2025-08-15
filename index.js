const path = require('path');
const fs = require('fs');

// Carregar variáveis de ambiente manualmente
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            if (value) {
                process.env[key.trim()] = value;
            }
        }
    });
    console.log('Arquivo .env carregado com sucesso');
} else {
    console.log('Arquivo .env não encontrado em:', envPath);
}

console.log('DISCORD_TOKEN carregado:', process.env.DISCORD_TOKEN ? 'Sim' : 'Não');

const { Client, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');
const config = require('./config');
const ffmpegStatic = require('ffmpeg-static');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');

// Configuração do bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers
    ]
});

// Configuração do DisTube (versão atualizada)
let distube;
try {
    // Adiciona o diretório do FFmpeg ao PATH do processo
    const ffmpegDir = ffmpegStatic.replace(/\\ffmpeg\.exe$/, '');
    if (!process.env.PATH.includes(ffmpegDir)) {
        process.env.PATH = ffmpegDir + ';' + process.env.PATH;
    }
    console.log('FFmpeg path adicionado ao PATH:', ffmpegDir);
    console.log('PATH atual:', process.env.PATH);
    
    distube = new DisTube(client, {
        emitNewSongOnly: true,
        emitAddSongWhenCreatingQueue: false,
        emitAddListWhenCreatingQueue: false,
        nsfw: false
    });
    console.log('DisTube inicializado com sucesso!');
} catch (error) {
    console.error('Erro ao inicializar DisTube:', error);
    console.error('Para resolver o problema do FFmpeg:');
    console.error('1. Baixe FFmpeg de: https://ffmpeg.org/download.html');
    console.error('2. Extraia para C:\\ffmpeg');
    console.error('3. Adicione C:\\ffmpeg\\bin ao PATH do sistema');
    process.exit(1);
}

// Evento quando o bot fica online
client.once('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}!`);
    
    client.user.setPresence({
        activities: [{ name: 'músicas 🎵', type: 2 }], // type: 2 = LISTENING
        status: 'online',
    });
    
    console.log('Bot online e pronto para tocar música!');
});

// Evento para escutar mensagens
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Comando para tocar música
    if (message.content.toLowerCase().includes('toca aquela')) {
        if (!distube) {
            return message.reply('❌ Bot de música não está disponível. Verifique se FFmpeg está instalado.');
        }
        
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('❌ Você precisa estar em um canal de voz para usar o bot de música!');
        }

        const musicQuery = extractMusicQuery(message.content);
        
        if (!musicQuery) {
            return message.reply('🎵 Por favor, digite: "Toca aquela [nome da música]"');
        }

        try {
            message.reply('🔍 Procurando e tocando a música...');
            console.log(`Tentando tocar: "${musicQuery}"`);
            
            // Verifica se é uma URL válida ou termo de pesquisa
            let searchQuery = musicQuery;
            
            // Se não for uma URL, adiciona "youtube" para melhorar a pesquisa
            if (!musicQuery.startsWith('http') && !musicQuery.startsWith('www')) {
                searchQuery = `youtube ${musicQuery}`;
                console.log(`Pesquisa modificada para: "${searchQuery}"`);
            }
            
            // Verifica se já existe uma fila ativa
            const existingQueue = distube.getQueue(message.guildId);
            if (existingQueue && existingQueue.voiceChannel.id !== voiceChannel.id) {
                // Se há uma fila em outro canal, para ela primeiro
                await distube.stop(message.guildId);
                console.log('Fila anterior parada para conectar ao novo canal');
            }
            
            // DisTube toca diretamente
            const result = await distube.play(voiceChannel, searchQuery, {
                textChannel: message.channel,
                member: message.member
            });
            
            console.log('Resultado do play:', result);
            
        } catch (error) {
            console.error('Erro ao tocar música:', error);
            console.error('Detalhes do erro:', error.message);
            
            if (error.message.includes('FFMPEG_NOT_INSTALLED')) {
                message.reply('❌ FFmpeg não está instalado. Baixe de https://ffmpeg.org/download.html');
            } else if (error.message.includes('This url is not supported')) {
                message.reply('❌ URL não suportada. Tente usar apenas o nome da música ou um link do YouTube válido.');
            } else if (error.message.includes('No video found')) {
                message.reply('❌ Nenhum vídeo encontrado. Verifique o nome da música ou link.');
            } else if (error.message.includes('Video unavailable')) {
                message.reply('❌ Vídeo indisponível. Tente outro nome ou link.');
            } else if (error.message.includes('Sign in')) {
                message.reply('❌ Vídeo com restrição de idade. Tente outro nome.');
            } else if (error.message.includes('Private video')) {
                message.reply('❌ Vídeo privado. Tente outro nome.');
            } else if (error.message.includes('Cannot connect to the voice channel')) {
                message.reply('❌ Erro de conexão com o canal de voz. Tente:\n1. Verificar se o bot tem permissões\n2. Reconectar ao canal\n3. Usar `cascão entrar` primeiro');
            } else if (error.message.includes('Missing Permissions')) {
                message.reply('❌ Bot sem permissões. Precisa de:\n• Conectar\n• Falar\n• Usar VAD\n• Ver Canais');
            } else {
                message.reply(`❌ Erro ao tocar música: ${error.message}`);
            }
        }
    }

    // Comando para entrar no canal
    if (message.content.toLowerCase() === 'cascão entrar' || message.content.toLowerCase() === 'bot entrar') {
        if (!distube) {
            return message.reply('❌ Bot de música não está disponível. Verifique se FFmpeg está instalado.');
        }
        
        const voiceChannel = message.member.voice.channel;
        
        if (!voiceChannel) {
            return message.reply('❌ Você precisa estar em um canal de voz primeiro!');
        }

        // Verifica permissões do bot
        const permissions = voiceChannel.permissionsFor(client.user);
        if (!permissions.has('Connect')) {
            return message.reply('❌ Não tenho permissão para conectar ao canal de voz!');
        }
        if (!permissions.has('Speak')) {
            return message.reply('❌ Não tenho permissão para falar no canal de voz!');
        }

        const queue = distube.getQueue(message.guildId);
        if (queue) {
            return message.reply('🔊 Já estou conectado e tocando música!');
        }

        try {
            // Tenta conectar ao canal para verificar se funciona
            // DisTube se conecta automaticamente quando toca música
            message.reply(`🔊 Pronto para tocar música no canal: **${voiceChannel.name}**!\nUse: \`Toca aquela [nome da música]\``);
        } catch (error) {
            console.error('Erro ao conectar:', error);
            message.reply('❌ Erro ao conectar ao canal. Verifique as permissões e tente novamente.');
        }
    }

    // Comandos de controle
    if (message.content.toLowerCase() === 'parar musica' || message.content.toLowerCase() === 'parar') {
        if (!distube) {
            return message.reply('❌ Bot de música não está disponível. Verifique se FFmpeg está instalado.');
        }
        
        const queue = distube.getQueue(message.guildId);
        if (queue) {
            await distube.stop(message.guildId);
            message.reply('⏹️ Música parada e fila limpa!');
        } else {
            message.reply('❌ Não há nenhuma música tocando!');
        }
    }

    if (message.content.toLowerCase() === 'pausar') {
        if (!distube) {
            return message.reply('❌ Bot de música não está disponível. Verifique se FFmpeg está instalado.');
        }
        
        const queue = distube.getQueue(message.guildId);
        if (queue) {
            if (queue.paused) {
                await distube.resume(message.guildId);
                message.reply('▶️ Música retomada!');
            } else {
                await distube.pause(message.guildId);
                message.reply('⏸️ Música pausada!');
            }
        } else {
            message.reply('❌ Não há nenhuma música tocando!');
        }
    }

    if (message.content.toLowerCase() === 'pular' || message.content.toLowerCase() === 'skip') {
        if (!distube) {
            return message.reply('❌ Bot de música não está disponível. Verifique se FFmpeg está instalado.');
        }
        
        const queue = distube.getQueue(message.guildId);
        if (queue) {
            await distube.skip(message.guildId);
            message.reply('⏭️ Música pulada!');
        } else {
            message.reply('❌ Não há nenhuma música tocando!');
        }
    }

    if (message.content.toLowerCase() === 'sair do canal' || message.content.toLowerCase() === 'cascão sair') {
        if (!distube) {
            return message.reply('❌ Bot de música não está disponível. Verifique se FFmpeg está instalado.');
        }
        
        const queue = distube.getQueue(message.guildId);
        if (queue) {
            await distube.stop(message.guildId);
            message.reply('👋 Saindo do canal de voz!');
        } else {
            message.reply('❌ Não estou em nenhum canal de voz!');
        }
    }

    // Comando de ajuda
    if (message.content.toLowerCase() === 'cascão ajuda' || message.content.toLowerCase() === 'bot ajuda') {
        const helpMessage = `
🎵 **Comandos do Cascão - Bot de Música**

**🎶 Música:**
\`Toca aquela [nome/link]\` - Tocar música
\`parar\` - Parar música e limpar fila
\`pausar\` - Pausar/Retomar música
\`pular\` - Pular música atual

**🔊 Controles:**
\`cascão entrar\` - Entrar no canal
\`sair do canal\` - Sair do canal
\`cascão ajuda\` - Mostrar comandos

**🔧 Teste:**
\`teste distube\` - Testar se DisTube está funcionando
\`teste url [URL]\` - Testar se uma URL é válida
\`cascão permissões\` - Verificar permissões do bot

**💡 Dicas:**
• Use apenas o nome da música (ex: "Toca aquela despacito")
• Para links, use apenas YouTube válidos
• Evite links de playlists ou canais
        `;
        
        message.reply(helpMessage);
    }

    // Comando para ver o que está tocando
    if (message.content.toLowerCase() === 'tocando agora' || message.content.toLowerCase() === 'np') {
        if (!distube) {
            return message.reply('❌ Bot de música não está disponível. Verifique se FFmpeg está instalado.');
        }
        
        const queue = distube.getQueue(message.guildId);
        if (queue) {
            const song = queue.songs[0];
            message.reply(`🎵 **Tocando agora:** ${song.name}\n⏱️ **Duração:** ${song.formattedDuration}\n👤 **Solicitado por:** ${song.user}`);
        } else {
            message.reply('❌ Nenhuma música está tocando no momento!');
        }
    }

    // Comando de teste para verificar DisTube
    if (message.content.toLowerCase() === 'teste distube') {
        if (!distube) {
            return message.reply('❌ DisTube não está disponível.');
        }
        
        try {
            message.reply('🔍 Testando DisTube...');
            console.log('DisTube status:', distube);
            console.log('DisTube options:', distube.options);
            message.reply('✅ DisTube está funcionando! Verifique o console para mais detalhes.');
        } catch (error) {
            console.error('Erro no teste DisTube:', error);
            message.reply(`❌ Erro no teste: ${error.message}`);
        }
    }

    // Comando para testar URL específica
    if (message.content.toLowerCase().startsWith('teste url')) {
        if (!distube) {
            return message.reply('❌ DisTube não está disponível.');
        }
        
        const testUrl = message.content.replace('teste url', '').trim();
        if (!testUrl) {
            return message.reply('❌ Use: `teste url [URL ou nome da música]`');
        }
        
        try {
            message.reply(`🔍 Testando: "${testUrl}"`);
            console.log(`Testando URL: "${testUrl}"`);
            
            // Tenta fazer uma pesquisa simples para ver se funciona
            const result = await distube.search(testUrl, { limit: 1 });
            console.log('Resultado da pesquisa:', result);
            
            if (result && result.length > 0) {
                message.reply(`✅ URL válida! Encontrado: ${result[0].name}`);
            } else {
                message.reply('❌ Nenhum resultado encontrado para esta URL/termo.');
            }
        } catch (error) {
            console.error('Erro no teste de URL:', error);
            message.reply(`❌ Erro ao testar URL: ${error.message}`);
        }
    }

    // Comando para verificar permissões do bot
    if (message.content.toLowerCase() === 'cascão permissões' || message.content.toLowerCase() === 'bot permissões') {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('❌ Você precisa estar em um canal de voz primeiro!');
        }

        const permissions = voiceChannel.permissionsFor(client.user);
        const requiredPermissions = ['Connect', 'Speak', 'UseVAD', 'ViewChannel'];
        
        const permissionStatus = requiredPermissions.map(perm => {
            const hasPerm = permissions.has(perm);
            return `${hasPerm ? '✅' : '❌'} ${perm}`;
        }).join('\n');

        message.reply(`🔐 **Permissões do bot no canal ${voiceChannel.name}:**\n${permissionStatus}`);
    }
});

// Eventos do DisTube
if (distube) {
    distube
        .on('playSong', (queue, song) => {
            queue.textChannel?.send(`🎵 **Tocando:** ${song.name} - \`${song.formattedDuration}\`\n👤 **Solicitado por:** ${song.user}`);
        })
        .on('addSong', (queue, song) => {
            queue.textChannel?.send(`✅ **Adicionado à fila:** ${song.name} - \`${song.formattedDuration}\`\n👤 **Solicitado por:** ${song.user}`);
        })
        .on('playList', (queue, playlist, song) => {
            queue.textChannel?.send(`🎵 **Tocando playlist:** ${playlist.name} (${playlist.songs.length} músicas)\n🎵 **Música atual:** ${song.name}`);
        })
        .on('addList', (queue, playlist) => {
            queue.textChannel?.send(`✅ **Playlist adicionada:** ${playlist.name} (${playlist.songs.length} músicas)`);
        })
        .on('searchResult', (message, result) => {
            let i = 0;
            const embed = {
                title: '**Escolha uma opção:**',
                description: result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join('\n'),
                color: 0x00ff00
            };
            message.channel.send({ embeds: [embed] });
        })
        .on('searchCancel', (message) => {
            message.channel.send('❌ Pesquisa cancelada!');
        })
        .on('error', (channel, e) => {
            console.error('Erro DisTube:', e);
            channel?.send('❌ Erro ao tocar música!');
        });
}

// Função para extrair nome da música
function extractMusicQuery(message) {
    const phrases = ['toca aquela', 'toca aquela'];
    let query = message.toLowerCase();
    
    for (const phrase of phrases) {
        if (query.includes(phrase)) {
            query = query.replace(phrase, '').trim();
            break;
        }
    }
    
    return query || null;
}

client.on('error', console.error);

// ATENÇÃO: Substitua pelo seu token!
client.login(config.DISCORD_TOKEN);