const axios = require('axios');

const botToken = '8044411190:AAHDXFLz_xESo_3GelX1ve5aFgDc8bGY7-Y'; // Substitua pelo seu Token de API do Bot
const chatIds = [
  '-4684275921', // Substitua pelo ID do chat obtido
  '7966129352'   // Substitua pelo ID do chat obtido
];

function enviarMensagemTelegram(mensagem) {
  chatIds.forEach(chatId => {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    axios.post(url, {
      chat_id: chatId,
      text: mensagem
    })
    .then(response => {
      console.log(`Mensagem enviada para ${chatId}: ${response.data.result.message_id}`);
    })
    .catch(error => {
      console.error(`Erro ao enviar mensagem para ${chatId}:`, error);
    });
  });
}

// Exemplo de uso
const mensagem = "Alerta: O estoque do produto X está abaixo de 30%.";
enviarMensagemTelegram(mensagem);