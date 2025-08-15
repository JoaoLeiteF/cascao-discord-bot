# 🎵 Cascão - Bot de Música para Discord

Um bot de música simples e eficiente para Discord, desenvolvido em Node.js usando Discord.js e DisTube. O bot permite reproduzir músicas do YouTube, Spotify e SoundCloud diretamente nos canais de voz do seu servidor.

## ✨ Características

- 🎶 Reprodução de música de múltiplas plataformas (YouTube, Spotify, SoundCloud)
- 🔍 Pesquisa automática por nome da música
- ⏯️ Controles completos (pausar, pular, parar)
- 📝 Sistema de filas automático
- 🎯 Comandos em português
- 🔊 Entrada automática em canais de voz
- 📱 Interface amigável com emojis

## 🚀 Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [FFmpeg](https://ffmpeg.org/) instalado no sistema
- Conta Discord e servidor para testes

### 1. Clone o projeto

```bash
git clone https://github.com/seu-usuario/cascao-music-bot.git
cd cascao-music-bot
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o bot no Discord

1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications)
2. Crie uma nova aplicação
3. Vá para a seção "Bot" e crie um bot
4. Copie o token do bot
5. Configure as permissões necessárias (veja seção abaixo)

### 4. Configure o token

Substitua `'COLE_SEU_TOKEN_AQUI'` no arquivo `bot.js` pelo token do seu bot:

```javascript
client.login('SEU_TOKEN_REAL_AQUI');
```

**⚠️ IMPORTANTE:** Nunca compartilhe seu token publicamente!

### 5. Instalar FFmpeg

#### Windows (Chocolatey):
```bash
choco install ffmpeg
```

#### Windows (Manual):
1. Baixe de: https://www.gyan.dev/ffmpeg/builds/
2. Extraia para `C:\ffmpeg`
3. Adicione `C:\ffmpeg\bin` ao PATH do sistema

#### Linux:
```bash
sudo apt update
sudo apt install ffmpeg
```

#### macOS:
```bash
brew install ffmpeg
```

### 6. Execute o bot

```bash
node bot.js
```

## 🔐 Permissões Necessárias

No Discord Developer Portal, configure estas permissões para o bot:

### Permissões do Bot:
- ✅ Send Messages
- ✅ Connect
- ✅ Speak
- ✅ Use Voice Activity
- ✅ Read Message History

### Gateway Intents:
- ✅ Presence Intent
- ✅ Server Members Intent
- ✅ Message Content Intent

### Link de Convite:
```
https://discord.com/api/oauth2/authorize?client_id=SEU_APPLICATION_ID&permissions=3148800&scope=bot
```

## 📋 Comandos Disponíveis

### 🎶 Comandos de Música

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `Bot de Musica [música]` | Toca uma música | `Bot de Musica Bohemian Rhapsody` |
| `parar` | Para a música e limpa a fila | `parar` |
| `pausar` | Pausa ou retoma a música | `pausar` |
| `pular` ou `skip` | Pula para a próxima música | `pular` |
| `tocando agora` ou `np` | Mostra a música atual | `tocando agora` |

### 🔊 Comandos de Canal

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `cascão entrar` ou `bot entrar` | Bot entra no canal de voz | `cascão entrar` |
| `sair do canal` ou `cascão sair` | Bot sai do canal de voz | `sair do canal` |

### ❓ Comandos de Ajuda

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `cascão ajuda` ou `bot ajuda` | Mostra lista de comandos | `cascão ajuda` |

## 🧪 Comandos de Teste

### Testes Básicos

1. **Teste de Conexão:**
```bash
# No terminal
node bot.js
# Deve aparecer: "Bot conectado como [Nome]#[Tag]!"
```

2. **Teste de Status Online:**
```
# No Discord, verificar se o bot aparece online
# Status deve mostrar: "Ouvindo músicas 🎵"
```

3. **Teste de Entrada em Canal:**
```
# Entrar em um canal de voz primeiro
cascão entrar
# Esperado: "🔊 Pronto para tocar música no canal: [Nome do Canal]!"
```

4. **Teste de Reprodução:**
```
Bot de Musica teste
# Esperado: "🔍 Procurando e tocando a música..."
# Seguido de: "🎵 Tocando: [nome da música]"
```

### Testes Avançados

5. **Teste de Controles:**
```bash
# Teste pausar
pausar
# Esperado: "⏸️ Música pausada!" ou "▶️ Música retomada!"

# Teste parar
parar
# Esperado: "⏹️ Música parada e fila limpa!"

# Teste informações
tocando agora
# Esperado: Informações da música atual
```

6. **Teste de Múltiplas Plataformas:**
```bash
# YouTube (nome)
Bot de Musica Imagine Dragons Believer

# YouTube (link)
Bot de Musica https://www.youtube.com/watch?v=dQw4w9WgXcQ

# Spotify (se disponível)
Bot de Musica spotify:track:4iV5W9uYEdYUVa79Axb7Rh
```

7. **Teste de Erros:**
```bash
# Sem estar em canal de voz
Bot de Musica teste
# Esperado: "❌ Você precisa estar em um canal de voz..."

# Música inexistente
Bot de Musica xpto1234567890abcdef
# Esperado: Mensagem de erro apropriada
```

## 🔧 Estrutura do Projeto

```
cascao-music-bot/
├── bot.js              # Arquivo principal do bot
├── package.json        # Dependências do projeto
├── README.md          # Este arquivo
└── .env.example       # Exemplo de arquivo de ambiente
```

## 🛠️ Desenvolvimento e Melhorias

### Como Contribuir

1. **Fork o projeto**
2. **Crie uma branch para sua feature:**
```bash
git checkout -b feature/nova-funcionalidade
```
3. **Commit suas mudanças:**
```bash
git commit -m 'Adiciona nova funcionalidade'
```
4. **Push para a branch:**
```bash
git push origin feature/nova-funcionalidade
```
5. **Abra um Pull Request**

### 🚀 Ideias para Melhorias

#### Funcionalidades Básicas
- [ ] Sistema de volume (aumentar/diminuir)
- [ ] Comando de repetição (loop)
- [ ] Fila de reprodução visível
- [ ] Comando para embaralhar fila
- [ ] Histórico de músicas tocadas

#### Funcionalidades Avançadas
- [ ] Sistema de playlists salvas
- [ ] Integração com mais plataformas (Deezer, Apple Music)
- [ ] Comando de equalização
- [ ] Sistema de votação para pular músicas
- [ ] Comando de letras das músicas
- [ ] Dashboard web para controle

#### Melhorias Técnicas
- [ ] Sistema de logs mais robusto
- [ ] Configuração por arquivo .env
- [ ] Sistema de cache para buscas
- [ ] Rate limiting para comandos
- [ ] Banco de dados para estatísticas
- [ ] Docker para deployment

#### Interface e UX
- [ ] Embeds mais bonitos para respostas
- [ ] Reações para controles rápidos
- [ ] Sistema de slash commands
- [ ] Tradução para outros idiomas
- [ ] Temas personalizáveis

### 📝 Como Adicionar uma Funcionalidade

#### Exemplo: Adicionar comando de volume

1. **Adicione o evento de mensagem:**
```javascript
if (message.content.toLowerCase().startsWith('volume')) {
    const volume = parseInt(message.content.split(' ')[1]);
    
    if (isNaN(volume) || volume < 0 || volume > 100) {
        return message.reply('❌ Volume deve ser entre 0 e 100!');
    }
    
    const queue = distube.getQueue(message.guildId);
    if (queue) {
        distube.setVolume(message.guildId, volume);
        message.reply(`🔊 Volume alterado para: ${volume}%`);
    } else {
        message.reply('❌ Nenhuma música tocando!');
    }
}
```

2. **Teste a funcionalidade:**
```bash
volume 50
# Esperado: "🔊 Volume alterado para: 50%"
```

3. **Adicione à documentação** (seção de comandos)

4. **Teste casos extremos:**
```bash
volume abc    # Deve retornar erro
volume -10    # Deve retornar erro  
volume 150    # Deve retornar erro
```

### 🐛 Reportar Bugs

Ao reportar bugs, inclua:

1. **Descrição do problema**
2. **Passos para reproduzir**
3. **Comportamento esperado**
4. **Comportamento atual**
5. **Logs/screenshots**
6. **Versão do Node.js e sistema operacional**

### 📊 Monitoramento

Para monitorar o desempenho do bot:

```javascript
// Adicione logs detalhados
console.log(`Música iniciada: ${song.name} em ${queue.voice.channel.name}`);
console.log(`Usuários no canal: ${queue.voice.channel.members.size}`);
```

## ❗ Troubleshooting

### Problemas Comuns

1. **Bot aparece offline:**
   - Verifique se os Intents estão habilitados no Developer Portal
   - Confirme se o token está correto

2. **Erro "Could not extract functions":**
   - Instale versão específica: `npm install ytdl-core@4.9.1`
   - Ou use DisTube (já implementado)

3. **FFmpeg não encontrado:**
   - Verifique se está no PATH: `ffmpeg -version`
   - Reinstale seguindo as instruções da seção de instalação

4. **Bot não reproduz música:**
   - Verifique permissões do bot no servidor
   - Confirme se você está em um canal de voz
   - Verifique logs no console

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🤝 Suporte

- 🐛 **Bugs:** Abra uma [issue](https://github.com/seu-usuario/cascao-music-bot/issues)
- 💡 **Sugestões:** Use as [discussions](https://github.com/seu-usuario/cascao-music-bot/discussions)
- 📧 **Contato:** seu-email@exemplo.com

## 🙏 Agradecimentos

- [Discord.js](https://discord.js.org/) - Library para Discord
- [DisTube](https://distube.js.org/) - Sistema de música
- [FFmpeg](https://ffmpeg.org/) - Processamento de áudio

---

⭐ **Se este projeto te ajudou, deixe uma estrela no GitHub!** ⭐
