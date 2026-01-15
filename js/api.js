/* ============================================
   API E INTEGRAÇÕES
   ============================================ */

const API = {
    
    /* ============================================
       TELEGRAM
       ============================================ */
    
    /**
     * Envia notificação para o Telegram
     * @param {Object} pedido - Dados do pedido
     * @returns {Promise<boolean>}
     */
    async enviarTelegram(pedido) {
        if (!CONFIG.telegram.enabled) {
            console.log('Telegram não configurado. Pulando notificação...');
            return false;
        }

        const { botToken, chatId } = CONFIG.telegram;
        
        // Formata a mensagem
        const mensagem = this.formatarMensagemTelegram(pedido);
        
        try {
            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: mensagem,
                    parse_mode: 'HTML'
                })
            });

            const data = await response.json();
            
            if (data.ok) {
                console.log('✅ Notificação Telegram enviada com sucesso!');
                return true;
            } else {
                console.error('❌ Erro ao enviar Telegram:', data);
                return false;
            }
        } catch (error) {
            console.error('❌ Erro na requisição Telegram:', error);
            return false;
        }
    },

    /**
     * Formata mensagem para o Telegram
     * @param {Object} pedido - Dados do pedido
     * @returns {string}
     */
    formatarMensagemTelegram(pedido) {
        return `
🎥 <b>NOVO PEDIDO - OLHO NO LANCE</b> 🎥

━━━━━━━━━━━━━━━━━━━━━━
<b>📋 Tipo de Lance:</b>
${pedido.tipoLance}

<b>💰 Valor:</b> R$ ${pedido.valor.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━
<b>🏟️ INFORMAÇÕES DO JOGO</b>

<b>Quadra:</b> ${pedido.quadra}${pedido.lado ? ` (Lado ${pedido.lado})` : ''}
<b>Data:</b> ${pedido.dataJogo}
<b>Horário:</b> ${pedido.horario}

<b>📝 Descrição:</b>
${pedido.descricao}

━━━━━━━━━━━━━━━━━━━━━━
<b>👤 DADOS DO CLIENTE</b>

<b>Nome:</b> ${pedido.nome}
<b>Email:</b> ${pedido.email}
<b>Telefone:</b> ${pedido.telefone}

━━━━━━━━━━━━━━━━━━━━━━
<b>⏱️ Prazo:</b> ${pedido.prazo}
<b>🕐 Data do Pedido:</b> ${new Date().toLocaleString('pt-BR')}

━━━━━━━━━━━━━━━━━━━━━━
`;
    },

    /* ============================================
       GOOGLE SHEETS
       ============================================ */
    
    /**
     * Salva pedido no Google Sheets
     * @param {Object} pedido - Dados do pedido
     * @returns {Promise<boolean>}
     */
    async salvarGoogleSheets(pedido) {
        if (!CONFIG.googleSheets.enabled) {
            console.log('Google Sheets não configurado. Pulando salvamento...');
            return false;
        }

        try {
            const response = await fetch(CONFIG.googleSheets.scriptUrl, {
                method: 'POST',
                mode: 'no-cors', // Importante para Google Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...pedido,
                    timestamp: new Date().toISOString()
                })
            });

            console.log('✅ Pedido enviado para Google Sheets!');
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar no Google Sheets:', error);
            return false;
        }
    },

    /* ============================================
       EMAIL (FORMSPREE)
       ============================================ */
    
    /**
     * Envia notificação por email usando Formspree
     * @param {Object} pedido - Dados do pedido
     * @returns {Promise<boolean>}
     */
    async enviarEmail(pedido) {
        if (!CONFIG.notifications.email.enabled) {
            console.log('Email não configurado. Pulando notificação...');
            return false;
        }

        try {
            const response = await fetch(`https://formspree.io/f/${CONFIG.notifications.email.formspreeId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject: `Novo Pedido - ${pedido.tipoLance}`,
                    message: this.formatarMensagemEmail(pedido)
                })
            });

            if (response.ok) {
                console.log('✅ Email enviado com sucesso!');
                return true;
            } else {
                console.error('❌ Erro ao enviar email');
                return false;
            }
        } catch (error) {
            console.error('❌ Erro na requisição de email:', error);
            return false;
        }
    },

    /**
     * Formata mensagem para email
     * @param {Object} pedido - Dados do pedido
     * @returns {string}
     */
    formatarMensagemEmail(pedido) {
        return `
NOVO PEDIDO - OLHO NO LANCE

━━━━━━━━━━━━━━━━━━━━━━
TIPO DE LANCE
${pedido.tipoLance}
Valor: R$ ${pedido.valor.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━
INFORMAÇÕES DO JOGO

Quadra: ${pedido.quadra}${pedido.lado ? ` (Lado ${pedido.lado})` : ''}
Data: ${pedido.dataJogo}
Horário: ${pedido.horario}

Descrição:
${pedido.descricao}

━━━━━━━━━━━━━━━━━━━━━━
DADOS DO CLIENTE

Nome: ${pedido.nome}
Email: ${pedido.email}
Telefone: ${pedido.telefone}

━━━━━━━━━━━━━━━━━━━━━━
Prazo: ${pedido.prazo}
Data do Pedido: ${new Date().toLocaleString('pt-BR')}
        `;
    },

    /* ============================================
       PROCESSAMENTO DE PEDIDO
       ============================================ */
    
    /**
     * Processa e envia o pedido para todos os destinos configurados
     * @param {Object} pedido - Dados do pedido
     * @returns {Promise<Object>}
     */
    async processarPedido(pedido) {
        console.log('🚀 Processando pedido...');
        
        const resultados = {
            telegram: false,
            googleSheets: false,
            email: false
        };

        // Envia para Telegram
        if (CONFIG.telegram.enabled) {
            resultados.telegram = await this.enviarTelegram(pedido);
        }

        // Salva no Google Sheets
        if (CONFIG.googleSheets.enabled) {
            resultados.googleSheets = await this.salvarGoogleSheets(pedido);
        }

        // Envia por Email
        if (CONFIG.notifications.email.enabled) {
            resultados.email = await this.enviarEmail(pedido);
        }

        console.log('✅ Processamento concluído:', resultados);
        return resultados;
    }
};

/* ============================================
   CÓDIGO PARA GOOGLE APPS SCRIPT
   ============================================ */

/*
COLE ESTE CÓDIGO NO GOOGLE APPS SCRIPT:
================================================

function doPost(e) {
  try {
    // Obtém os dados do pedido
    const dados = JSON.parse(e.postData.contents);
    
    // Abre a planilha (substitua pelo ID da sua planilha)
    const planilha = SpreadsheetApp.openById('SEU_ID_DA_PLANILHA_AQUI');
    const aba = planilha.getActiveSheet();
    
    // Adiciona uma nova linha com os dados
    aba.appendRow([
      dados.timestamp,
      dados.tipoLance,
      dados.valor,
      dados.quadra,
      dados.lado || '',
      dados.dataJogo,
      dados.horario,
      dados.descricao,
      dados.nome,
      dados.email,
      dados.telefone,
      dados.prazo
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Pedido salvo com sucesso!'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

================================================

CONFIGURAÇÃO DA PLANILHA:
Crie os seguintes cabeçalhos na primeira linha (A1 até L1):

A1: Timestamp
B1: Tipo de Lance
C1: Valor
D1: Quadra
E1: Lado
F1: Data do Jogo
G1: Horário
H1: Descrição
I1: Nome
J1: Email
K1: Telefone
L1: Prazo

DEPLOY:
1. Clique em "Implantar" > "Nova implantação"
2. Tipo: "Aplicativo da Web"
3. Executar como: "Eu"
4. Quem tem acesso: "Qualquer pessoa"
5. Copie a URL gerada e cole em CONFIG.googleSheets.scriptUrl

*/