const axios = require('axios');

const botToken = '8044411190:AAHDXFLz_xESo_3GelX1ve5aFgDc8bGY7-Y'; // Substitua pelo seu Token de API do Bot

// Função para obter o ID do chat
async function obterChatId() {
  const url = `https://api.telegram.org/bot${botToken}/getUpdates`;
  try {
    const response = await axios.get(url);
    const updates = response.data.result;

    if (updates.length > 0) {
      updates.forEach(update => {
        if (update.message && update.message.chat) {
          const chatId = update.message.chat.id;
          console.log(`ID do Chat: ${chatId}`);
        } else {
          console.log('Nenhuma mensagem encontrada nas atualizações.');
        }
      });
    } else {
      console.log('Nenhuma atualização encontrada.');
    }
  } catch (error) {
    console.error('Erro ao obter o ID do chat:', error);
  }
}

// Chamar a função para obter o ID do chat
obterChatId();