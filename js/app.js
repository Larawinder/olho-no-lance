/* ============================================
   APLICAÇÃO PRINCIPAL - OLHO NO LANCE
   ============================================ */

// Estado da aplicação
const STATE = {
    currentScreen: 'login',
    selectedLance: null,
    paymentId: null, // ID do pagamento do Mercado Pago
    formData: {
        quadra: '',
        lado: '',
        dataJogo: '',
        horario: '',
        descricao: '',
        nome: '',
        email: '',
        telefone: ''
    }
};

/* ============================================
   INICIALIZAÇÃO
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Olho no Lance - Sistema iniciado!');
    
    // Garante que começamos na tela de login
    changeScreen('login');
    
    // Fecha todos os modais
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    
    // Carrega quadras no select
    carregarQuadras();
    
    // Gera os cards de lances
    gerarCardsLances();
    
    // Configura eventos
    setupEventListeners();
    
    // Tenta carregar logo
    carregarLogo();
    
    // Inicializa ícones do Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

/* ============================================
   NAVEGAÇÃO ENTRE TELAS
   ============================================ */

function goToMarketplace() {
    changeScreen('marketplace');
}

function goToLogin() {
    changeScreen('login');
    resetForm();
}

function changeScreen(screenName) {
    // Remove active de todas as telas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Adiciona active na tela desejada
    const targetScreen = document.getElementById(`${screenName}Screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
        STATE.currentScreen = screenName;
    }
}

/* ============================================
   CARREGAMENTO DE CONTEÚDO
   ============================================ */

function carregarQuadras() {
    const select = document.getElementById('selectQuadra');
    
    CONFIG.quadras.forEach(quadra => {
        const option = document.createElement('option');
        option.value = quadra;
        option.textContent = quadra;
        select.appendChild(option);
    });
}

function carregarLogo() {
    const logoImg = document.getElementById('logoImage');
    const logoFallback = document.querySelector('.logo-fallback');
    
    if (!logoImg || !logoFallback) return;
    
    logoImg.onerror = () => {
        logoImg.style.display = 'none';
        if (logoFallback) logoFallback.style.display = 'block';
    };
    
    logoImg.onload = () => {
        logoImg.style.display = 'block';
        if (logoFallback) logoFallback.style.display = 'none';
    };
}

function gerarCardsLances() {
    const grid = document.getElementById('lancesGrid');
    
    CONFIG.tiposLance.forEach(lance => {
        const card = createLanceCard(lance);
        grid.appendChild(card);
    });
}

function createLanceCard(lance) {
    const card = document.createElement('div');
    card.className = 'lance-card';
    card.onclick = () => selecionarLance(lance);
    
    card.innerHTML = `
        <div class="lance-image">
            <img src="${lance.lanceImage}" alt="${lance.nome}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div class="lance-icon" style="display: none;">${lance.icon}</div>
        </div>
        <h3 class="lance-name">${lance.nome}</h3>
        <div class="lance-price">R$ ${lance.valor.toFixed(2)}</div>
        <div class="lance-prazo">⏱️ ${lance.prazo}</div>
    `;
    
    return card;
}

/* ============================================
   SELEÇÃO DE LANCE
   ============================================ */

function selecionarLance(lance) {
    STATE.selectedLance = lance;
    openQuadraModal();
}

/* ============================================
   MODAL QUADRA
   ============================================ */

function openQuadraModal() {
    const modal = document.getElementById('quadraModal');
    modal.classList.add('active');
    
    // Reinicializa ícones
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function closeQuadraModal() {
    const modal = document.getElementById('quadraModal');
    modal.classList.remove('active');
}

function selectLado(lado) {
    STATE.formData.lado = lado;
    
    // Atualiza visual dos botões
    document.querySelectorAll('.btn-lado').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[data-lado="${lado}"]`).classList.add('active');
}

function submitQuadra() {
    const quadra = document.getElementById('selectQuadra').value;
    
    if (!quadra) {
        alert('Por favor, selecione uma quadra');
        return;
    }
    
    STATE.formData.quadra = quadra;
    
    // Verifica se precisa do lado
    if (quadra === 'Dono da Bola') {
        document.getElementById('ladoQuadraGroup').classList.remove('hidden');
        
        if (!STATE.formData.lado) {
            alert('Por favor, selecione o lado da quadra');
            return;
        }
    }
    
    closeQuadraModal();
    openDescricaoModal();
}

/* ============================================
   MODAL DESCRIÇÃO
   ============================================ */

function openDescricaoModal() {
    const modal = document.getElementById('descricaoModal');
    modal.classList.add('active');
    
    // Reinicializa ícones
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function closeDescricaoModal() {
    const modal = document.getElementById('descricaoModal');
    modal.classList.remove('active');
}

async function submitDescricao() {
    // Coleta dados do formulário
    STATE.formData.dataJogo = document.getElementById('dataJogo').value;
    STATE.formData.horario = document.getElementById('horarioJogo').value;
    STATE.formData.descricao = document.getElementById('descricaoLance').value;
    STATE.formData.nome = document.getElementById('nomeCliente').value;
    STATE.formData.email = document.getElementById('emailCliente').value;
    STATE.formData.telefone = document.getElementById('telefoneCliente').value;
    
    // Validação
    if (!STATE.formData.dataJogo || !STATE.formData.horario || !STATE.formData.descricao || 
        !STATE.formData.nome || !STATE.formData.email || !STATE.formData.telefone) {
        alert('Por favor, preencha todos os campos');
        return;
    }
    
    // Fecha modal e mostra tela de pagamento
    closeDescricaoModal();
    await mostrarPagamento();
}

/* ============================================
   TELA DE PAGAMENTO - MERCADO PAGO
   ============================================ */

async function mostrarPagamento() {
    showLoading();
    
    try {
        // Cria pagamento no Mercado Pago
        const pagamento = await MercadoPago.criarPagamentoPix({
            tipoLance: STATE.selectedLance.nome,
            valor: STATE.selectedLance.valor,
            quadra: STATE.formData.quadra,
            lado: STATE.formData.lado,
            dataJogo: STATE.formData.dataJogo,
            horario: STATE.formData.horario,
            descricao: STATE.formData.descricao,
            nome: STATE.formData.nome,
            email: STATE.formData.email,
            telefone: STATE.formData.telefone
        });

        if (!pagamento || !pagamento.success) {
            alert('Erro ao gerar PIX. Tente novamente.');
            hideLoading();
            return;
        }

        // Salva o ID do pagamento
        STATE.paymentId = pagamento.paymentId;

        // Preenche informações
        document.getElementById('paymentLanceName').textContent = STATE.selectedLance.nome;
        document.getElementById('paymentValue').textContent = `R$ ${STATE.selectedLance.valor.toFixed(2)}`;
        document.getElementById('qrValue').textContent = `R$ ${STATE.selectedLance.valor.toFixed(2)}`;
        document.getElementById('pixCode').textContent = pagamento.qrCode;
        document.getElementById('prazoText').textContent = STATE.selectedLance.prazo;

        // Exibe QR Code gerado pelo Mercado Pago
        const qrImage = document.getElementById('qrCodeImage');
        const qrPlaceholder = document.querySelector('.qr-code-placeholder');
        
        qrImage.src = `data:image/png;base64,${pagamento.qrCodeBase64}`;
        qrImage.onload = () => {
            qrImage.style.display = 'block';
            qrPlaceholder.style.display = 'none';
        };
        qrImage.onerror = () => {
            qrImage.style.display = 'none';
            qrPlaceholder.style.display = 'flex';
        };

        // Preenche resumo
        document.getElementById('summaryQuadra').textContent = STATE.formData.quadra + 
            (STATE.formData.lado ? ` (${STATE.formData.lado === 'cima' ? '🔼 Cima' : '🔽 Baixo'})` : '');
        document.getElementById('summaryData').textContent = `${STATE.formData.dataJogo} às ${STATE.formData.horario}`;
        document.getElementById('summaryNome').textContent = STATE.formData.nome;

        // Vai para tela de pagamento
        changeScreen('payment');

        // Inicia verificação automática de pagamento
        iniciarVerificacaoPagamento(pagamento.paymentId);

        // Processa pedido em background (Telegram, etc)
        await processarPedido();

    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao processar. Tente novamente.');
    } finally {
        hideLoading();
    }
}

function copyPixCode() {
    const pixCode = document.getElementById('pixCode').textContent;
    const btn = document.getElementById('btnCopyPix');
    
    navigator.clipboard.writeText(pixCode).then(() => {
        // Muda visual do botão
        btn.classList.add('copied');
        btn.innerHTML = '<i data-lucide="check"></i> Copiado!';
        
        // Reinicializa ícones
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Volta ao normal após 2 segundos
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = '<i data-lucide="copy"></i> Copiar Código';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 2000);
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        alert('Erro ao copiar código. Tente manualmente.');
    });
}

function novopedido() {
    // Para a verificação de pagamento anterior
    if (verificacaoInterval) {
        clearInterval(verificacaoInterval);
        verificacaoInterval = null;
    }
    
    resetForm();
    goToMarketplace();
}

/* ============================================
   VERIFICAÇÃO AUTOMÁTICA DE PAGAMENTO
   ============================================ */

let verificacaoInterval = null;

function iniciarVerificacaoPagamento(paymentId) {
    console.log('🔍 Iniciando verificação automática de pagamento...');
    
    // Verifica a cada 5 segundos
    verificacaoInterval = setInterval(async () => {
        const status = await MercadoPago.consultarPagamento(paymentId);
        
        console.log('📊 Status do pagamento:', status);
        
        if (status && status.approved) {
            clearInterval(verificacaoInterval);
            verificacaoInterval = null;
            mostrarPagamentoAprovado();
        }
    }, 5000);

    // Para após 10 minutos (600 segundos)
    setTimeout(() => {
        if (verificacaoInterval) {
            clearInterval(verificacaoInterval);
            verificacaoInterval = null;
            console.log('⏱️ Tempo de verificação esgotado');
        }
    }, 600000);
}

function mostrarPagamentoAprovado() {
    // Cria modal de confirmação
    const modalHTML = `
        <div class="modal active" id="confirmacaoModal">
            <div class="modal-overlay"></div>
            <div class="modal-content" style="text-align: center; padding: 40px;">
                <div style="font-size: 60px; margin-bottom: 20px;">✅</div>
                <h2 style="color: #00ff88; margin-bottom: 15px;">Pagamento Confirmado!</h2>
                <p style="color: #ccc; margin-bottom: 10px;">Seu pedido foi recebido com sucesso.</p>
                <p style="color: #fff; font-size: 18px; margin-bottom: 20px;">
                    <strong>Prazo de entrega:</strong> ${STATE.selectedLance.prazo}
                </p>
                <p style="color: #888; font-size: 14px; margin-bottom: 30px;">
                    Você receberá uma confirmação no seu email.
                </p>
                <button class="btn-primary" onclick="fecharConfirmacao()" style="padding: 15px 40px;">
                    OK
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function fecharConfirmacao() {
    const modal = document.getElementById('confirmacaoModal');
    if (modal) modal.remove();
    novopedido();
}
/* ============================================
   PROCESSAMENTO DO PEDIDO
   ============================================ */

async function processarPedido() {
    // Monta objeto do pedido
    const pedido = {
        tipoLance: STATE.selectedLance.nome,
        valor: STATE.selectedLance.valor,
        prazo: STATE.selectedLance.prazo,
        quadra: STATE.formData.quadra,
        lado: STATE.formData.lado,
        dataJogo: STATE.formData.dataJogo,
        horario: STATE.formData.horario,
        descricao: STATE.formData.descricao,
        nome: STATE.formData.nome,
        email: STATE.formData.email,
        telefone: STATE.formData.telefone,
        paymentId: STATE.paymentId // ID do pagamento do Mercado Pago
    };
    
    try {
        // Envia para API (Telegram, Google Sheets, etc)
        const resultados = await API.processarPedido(pedido);
        
        console.log('✅ Pedido processado:', resultados);
        
        // Se pelo menos uma integração funcionou, considera sucesso
        const sucesso = resultados.telegram || resultados.googleSheets || resultados.email;
        
        if (!sucesso) {
            console.warn('⚠️ Nenhuma integração está configurada ou todas falharam');
        }
        
    } catch (error) {
        console.error('❌ Erro ao processar pedido:', error);
    }
}

/* ============================================
   UTILITÁRIOS
   ============================================ */

function resetForm() {
    STATE.selectedLance = null;
    STATE.paymentId = null;
    STATE.formData = {
        quadra: '',
        lado: '',
        dataJogo: '',
        horario: '',
        descricao: '',
        nome: '',
        email: '',
        telefone: ''
    };
    
    // Limpa formulários
    const selectQuadra = document.getElementById('selectQuadra');
    if (selectQuadra) selectQuadra.value = '';
    
    const ladoGroup = document.getElementById('ladoQuadraGroup');
    if (ladoGroup) ladoGroup.classList.add('hidden');
    
    document.querySelectorAll('.btn-lado').forEach(btn => btn.classList.remove('active'));
    
    const dataJogo = document.getElementById('dataJogo');
    if (dataJogo) dataJogo.value = '';
    
    const horarioJogo = document.getElementById('horarioJogo');
    if (horarioJogo) horarioJogo.value = '';
    
    const descricaoLance = document.getElementById('descricaoLance');
    if (descricaoLance) descricaoLance.value = '';
    
    const nomeCliente = document.getElementById('nomeCliente');
    if (nomeCliente) nomeCliente.value = '';
    
    const emailCliente = document.getElementById('emailCliente');
    if (emailCliente) emailCliente.value = '';
    
    const telefoneCliente = document.getElementById('telefoneCliente');
    if (telefoneCliente) telefoneCliente.value = '';
    
    // Fecha todos os modais
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

function showLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) loading.classList.remove('hidden');
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) loading.classList.add('hidden');
}

/* ============================================
   EVENT LISTENERS
   ============================================ */

function setupEventListeners() {
    // Select de quadra - mostra/esconde lado
    const selectQuadra = document.getElementById('selectQuadra');
    if (selectQuadra) {
        selectQuadra.addEventListener('change', (e) => {
            const ladoGroup = document.getElementById('ladoQuadraGroup');
            
            if (e.target.value === 'Dono da Bola') {
                ladoGroup.classList.remove('hidden');
            } else {
                ladoGroup.classList.add('hidden');
                STATE.formData.lado = '';
                document.querySelectorAll('.btn-lado').forEach(btn => btn.classList.remove('active'));
            }
        });
    }
    
    // Fecha modais ao clicar no overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) modal.classList.remove('active');
        });
    });
    
    // Previne fechamento ao clicar dentro do modal
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
    
    // Máscara de telefone
    const telefoneInput = document.getElementById('telefoneCliente');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 11) {
                value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
                value = value.replace(/(\d)(\d{4})$/, '$1-$2');
            }
            
            e.target.value = value;
        });
    }
}

/* ============================================
   LOG DE DESENVOLVIMENTO
   ============================================ */

console.log(`
╔═══════════════════════════════════════╗
║   OLHO NO LANCE - SISTEMA V2.0       ║
║   Com Mercado Pago Integrado! 💳     ║
╚═══════════════════════════════════════╝

📋 Configurações:
   Mercado Pago: ${CONFIG.mercadoPago.enabled ? '✅ Ativado' : '❌ Desativado'}
   Modo: ${CONFIG.mercadoPago.testMode ? '🧪 Teste' : '🚀 Produção'}
   Telegram: ${CONFIG.telegram.enabled ? '✅ Ativado' : '❌ Desativado'}
   Google Sheets: ${CONFIG.googleSheets.enabled ? '✅ Ativado' : '❌ Desativado'}

🎯 Tipos de Lance: ${CONFIG.tiposLance.length}
🏟️  Quadras: ${CONFIG.quadras.length}
`);