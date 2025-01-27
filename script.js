// Lista de IDs de chat dos vendedores no Telegram
const chatIds = [
    '-4684275921', // Substitua pelo ID do chat obtido
    '7966129352' // Substitua pelo ID do chat obtido
];

// Token do bot do Telegram
const botToken = '8044411190:AAHDXFLz_xESo_3GelX1ve5aFgDc8bGY7-Y'; // Substitua pelo seu Token de API do Bot

// Função para enviar mensagem no Telegram usando a API do Telegram
function enviarMensagemTelegram(mensagem) {
    console.log('Enviando mensagem:', mensagem);
    chatIds.forEach(chatId => {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        axios.post(url, {
            chat_id: chatId,
            text: mensagem
        })
        .then(response => {
            console.log(`Mensagem enviada para ${chatId}:`, response.data);
        })
        .catch(error => {
            console.error(`Erro ao enviar mensagem para ${chatId}:`, error.response ? error.response.data : error.message);
        });
    });
}

// Função para verificar o estoque e enviar alerta no Telegram
function verificarEstoque(produto, quantidadeDisponivel, quantidadeInicial) {
    const quantidadeMinima = 0.3 * quantidadeInicial; // 30% do estoque inicial
    console.log(`Verificando estoque do produto ${produto}: disponível = ${quantidadeDisponivel}, inicial = ${quantidadeInicial}`);
    if (quantidadeDisponivel <= quantidadeMinima && quantidadeDisponivel > 0) {
        const mensagem = `Alerta: O estoque do produto ${produto} está abaixo de 30%. Quantidade disponível: ${quantidadeDisponivel}`;
        enviarMensagemTelegram(mensagem);
    } else if (quantidadeDisponivel === 0) {
        const mensagem = `Alerta: O estoque do produto ${produto} foi zerado.`;
        enviarMensagemTelegram(mensagem);
    }
}

// Função para mostrar a seção selecionada
window.showSection = function(sectionId) {
    const sections = document.querySelectorAll('main section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

// Adicionar evento de carregamento para garantir que o JavaScript seja executado após o carregamento completo do DOM
window.addEventListener('DOMContentLoaded', (event) => {
    // Função para salvar o produto
    window.saveProduct = function(button) {
        const row = button.parentElement.parentElement;
        const produto = row.children[0].innerText;
        const tam = row.children[1].innerText;
        const qtdMinima = row.children[2].innerText;
        const valor = row.children[3].innerText;
        const vendido = row.children[4].innerText;
        const disponivel = row.children[5].innerText;
        const imagem = row.children[6].querySelector('img').src;

        const ofertasRow = Array.from(document.getElementById('ofertas-tbody').rows).find(row => row.getAttribute('data-produto') === produto);
        if (ofertasRow) {
            atualizarTabela(ofertasRow, produto, tam, qtdMinima, valor, vendido, disponivel, imagem);
        } else {
            adicionarLinhaTabela(document.getElementById('ofertas-tbody'), produto, tam, qtdMinima, valor, vendido, disponivel, imagem);
        }

        // Adiciona ou atualiza a linha na tabela de lançamentos
        const lancamentoRow = Array.from(document.getElementById('lancamento-tbody').rows).find(row => row.getAttribute('data-produto') === produto);
        if (lancamentoRow) {
            atualizarTabela(lancamentoRow, produto, tam, qtdMinima, valor, vendido, disponivel, imagem);
        } else {
            adicionarLinhaTabela(document.getElementById('lancamento-tbody'), produto, tam, qtdMinima, valor, vendido, disponivel, imagem);
        }

        // Verifica o estoque após salvar o produto
        const quantidadeInicial = parseInt(row.getAttribute('data-quantidade-inicial')) || parseInt(disponivel);
        verificarEstoque(produto, parseInt(disponivel), quantidadeInicial);
    }

    // Função para abrir o modal de compra
    window.openModal = function(button) {
        const row = button.parentElement.parentElement;
        const produto = row.children[0].innerText;
        const disponivel = row.children[5].innerText;
        const qtdMinima = row.children[2].innerText;
        document.getElementById('quantidade').max = disponivel;
        document.getElementById('quantidade').dataset.qtdMinima = qtdMinima;
        document.getElementById('comprar-form').dataset.rowIndex = row.rowIndex;
        document.getElementById('modal').style.display = 'block';
    }

    // Função para fechar o modal de compra
    window.closeModal = function() {
        document.getElementById('modal').style.display = 'none';
    }

    // Função para editar o produto
    window.editProduct = function(button) {
        const row = button.parentElement.parentElement;
        const produto = row.children[0].innerText;
        const tam = row.children[1].innerText;
        const qtdMinima = row.children[2].innerText;
        const valor = row.children[3].innerText;
        const vendido = row.children[4].innerText;
        const disponivel = row.children[5].innerText;
        document.getElementById('produto').value = produto;
        document.getElementById('tam').value = tam;
        document.getElementById('qtd-minima').value = qtdMinima;
        document.getElementById('valor').value = valor;
        document.getElementById('vendido').value = vendido;
        document.getElementById('disponivel').value = disponivel;
        document.getElementById('edit-index').value = row.rowIndex - 1;
        document.getElementById('disponivel').dataset.quantidadeInicial = disponivel; // Atualiza a quantidade inicial
    }

    // Função para corrigir os produtos lançados
    document.getElementById('corrigir').addEventListener('click', function() {
        const lancamentoRows = document.querySelectorAll('#lancamento-tbody tr');
        lancamentoRows.forEach(row => {
            row.classList.remove('zero-quantidade', 'atualizado');
        });
    });

    // Evento de submissão do formulário de compra
    document.getElementById('comprar-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const quantidade = document.getElementById('quantidade').value;
        const qtdMinima = document.getElementById('quantidade').dataset.qtdMinima;
        if (quantidade % qtdMinima !== 0) {
            alert(`A quantidade deve ser um múltiplo de ${qtdMinima}.`);
            return;
        }
        const rowIndex = event.target.dataset.rowIndex;
        const ofertasRow = document.getElementById('ofertas-tbody').rows[rowIndex - 1];
        const lancamentoRow = document.getElementById('lancamento-tbody').rows[rowIndex - 1];
        const disponivelCellOfertas = ofertasRow.children[5];
        const disponivelCellLancamento = lancamentoRow.children[5];
        const vendidoCellLancamento = lancamentoRow.children[4];
        const vendidoCellOfertas = ofertasRow.children[4];
        const quantidadeVendida = parseInt(vendidoCellLancamento.innerText) + parseInt(quantidade);
        vendidoCellLancamento.innerText = quantidadeVendida;
        vendidoCellOfertas.innerText = quantidadeVendida;
        disponivelCellOfertas.innerText = parseInt(disponivelCellOfertas.innerText) - parseInt(quantidade);
        disponivelCellLancamento.innerText = disponivelCellOfertas.innerText;
        const produto = ofertasRow.children[0].innerText; // Obtém o nome do produto
        if (disponivelCellOfertas.innerText == 0) {
            ofertasRow.remove();
            lancamentoRow.classList.add('zero-quantidade');
            const mensagem = `Alerta: O estoque do produto ${produto} foi zerado.`;
            enviarMensagemTelegram(mensagem);
        }
        const quantidadeInicial = parseInt(lancamentoRow.getAttribute('data-quantidade-inicial'));
        verificarEstoque(produto, parseInt(disponivelCellOfertas.innerText), quantidadeInicial);
        closeModal();
    });

    // Função para deletar o produto
    window.deleteProduct = function(button) {
        const row = button.parentElement.parentElement;
        const produto = row.children[0].innerText;
        row.remove();
        const ofertasRow = Array.from(document.getElementById('ofertas-tbody').rows).find(row => row.getAttribute('data-produto') === produto);
        if (ofertasRow) {
            ofertasRow.remove();
        }
    }

    // Evento de submissão do formulário de lançamento
    document.getElementById('lancamento-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const produto = document.getElementById('produto').value;
        const tam = document.getElementById('tam').value;
        const qtdMinima = document.getElementById('qtd-minima').value;
        const valor = document.getElementById('valor').value;
        const vendido = document.getElementById('vendido').value;
        const disponivel = document.getElementById('disponivel').value;
        const imagem = document.getElementById('imagem').files[0];
        const editIndex = document.getElementById('edit-index').value;
        const lancamentoTbody = document.getElementById('lancamento-tbody');
        const ofertasTbody = document.getElementById('ofertas-tbody');
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            if (editIndex === "") {
                const row = document.createElement('tr');
                row.setAttribute('data-produto', produto);
                row.setAttribute('data-quantidade-inicial', disponivel); // Armazena a quantidade inicial
                row.innerHTML = `
                    <td contenteditable="true">${produto}</td>
                    <td contenteditable="true">${tam}</td>
                    <td contenteditable="true">${qtdMinima}</td>
                    <td contenteditable="true">${valor}</td>
                    <td contenteditable="true">${vendido}</td>
                    <td contenteditable="true">${disponivel}</td>
                    <td><img src="${imageUrl}" alt="${produto}" width="50"></td>
                    <td>
                        <button class="salvar" onclick="saveProduct(this)">Salvar</button>
                        <button class="editar" onclick="editProduct(this)">Editar</button>
                        <button class="excluir" onclick="deleteProduct(this)">Excluir</button>
                    </td>
                `;
                lancamentoTbody.appendChild(row);
                const ofertasRow = document.createElement('tr');
                ofertasRow.setAttribute('data-produto', produto);
                ofertasRow.setAttribute('data-quantidade-inicial', disponivel); // Armazena a quantidade inicial
                ofertasRow.innerHTML = `
                    <td>${produto}</td>
                    <td>${tam}</td>
                    <td>${qtdMinima}</td>
                    <td>${valor}</td>
                    <td>${vendido}</td>
                    <td>${disponivel}</td>
                    <td><img src="${imageUrl}" alt="${produto}" width="50"></td>
                    <td>
                        <button class="comprar" onclick="openModal(this)">Comprar</button>
                    </td>
                `;
                ofertasTbody.appendChild(ofertasRow);
            } else {
                const lancamentoRow = lancamentoTbody.rows[editIndex];
                atualizarTabela(lancamentoRow, produto, tam, qtdMinima, valor, vendido, disponivel, imageUrl);
                lancamentoRow.setAttribute('data-quantidade-inicial', disponivel); // Atualiza a quantidade inicial
                const ofertasRow = Array.from(ofertasTbody.rows).find(row => row.getAttribute('data-produto') === produto);
                if (ofertasRow) {
                    atualizarTabela(ofertasRow, produto, tam, qtdMinima, valor, vendido, disponivel, imageUrl);
                    ofertasRow.setAttribute('data-quantidade-inicial', disponivel); // Atualiza a quantidade inicial
                } else {
                    adicionarLinhaTabela(ofertasTbody, produto, tam, qtdMinima, valor, vendido, disponivel, imageUrl);
                }
            }
            document.getElementById('lancamento-form').reset();
            document.getElementById('edit-index').value = "";
        };
        reader.readAsDataURL(imagem);
    });
});

// Função para atualizar a tabela
function atualizarTabela(row, produto, tam, qtdMinima, valor, vendido, disponivel, imagem) {
    row.cells[0].innerText = produto;
    row.cells[1].innerText = tam;
    row.cells[2].innerText = qtdMinima;
    row.cells[3].innerText = valor;
    row.cells[4].innerText = vendido;
    row.cells[5].innerText = disponivel;
    row.cells[6].innerHTML = `<img src="${imagem}" alt="${produto}" width="50">`;
}

// Função para adicionar uma linha na tabela
function adicionarLinhaTabela(tbody, produto, tam, qtdMinima, valor, vendido, disponivel, imagem) {
    const row = document.createElement('tr');
    row.setAttribute('data-produto', produto);
    row.setAttribute('data-quantidade-inicial', disponivel); // Armazena a quantidade inicial
    row.innerHTML = `
        <td>${produto}</td>
        <td>${tam}</td>
        <td>${qtdMinima}</td>
        <td>${valor}</td>
        <td>${vendido}</td>
        <td>${disponivel}</td>
        <td><img src="${imagem}" alt="${produto}" width="50"></td>
        <td>
            <button class="comprar" onclick="openModal(this)">Comprar</button>
        </td>
    `;
    tbody.appendChild(row);
}