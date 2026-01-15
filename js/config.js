/* ============================================
   CONFIGURAÇÕES DO SISTEMA - OLHO NO LANCE
   ============================================ */

const CONFIG = {
    // Informações do Negócio
    business: {
        name: "Olho no Lance",
        handle: "@olhonolancetm",
        email: "olhonolancetm@gmail.com",
        phone: "+5541999513-8430"
    },

    // Quadras Disponíveis
    quadras: [
        'FM Sports',
        'KF Sports',
        'Pedroso Sports',
        'KS Fut7',
        'Park Sports',
        'É Gol Sports',
        'Jr Sports',
        'GG Sports',
        'Paredão da Bola',
        'DG Sports',
        'Potência Society',
        'Dono da Bola'
    ],

    // Tipos de Lance
    tiposLance: [
        {
            id: 1,
            nome: 'Apertando a Botoeira',
            icon: '⚡',
            valor: 15.00,
            prazo: '24 horas úteis',
            lanceImage: 'images/lances/lance-1.jpg'
        },
        {
            id: 2,
            nome: 'Lance sem a hora exata',
            icon: '🎯',
            valor: 20.00,
            prazo: '72 horas úteis',
            lanceImage: 'images/lances/lance-2.jpeg'
        },
        {
            id: 3,
            nome: 'Todas as Defesas Goleiro',
            icon: '🧤',
            valor: 25.00,
            prazo: '72 horas úteis',
            lanceImage: 'images/lances/lance-3.jpg'
        },
        {
            id: 4,
            nome: 'Todos os gols de um jogador', 
            icon: '⚽',
            valor: 30.00,
            prazo: '72 horas úteis',
            lanceImage: 'images/lances/lance-4.jpg'
        },
        {
            id: 5,
            nome: 'Todos os gols e dribles de um jogador',
            icon: '🔥',
            valor: 40.00,
            prazo: '72 horas úteis',
            lanceImage: 'images/lances/lance-5.jpg'
        },
        {
            id: 6,
            nome: 'Todos os gols do time',
            icon: '🏆',
            valor: 45.00,
            prazo: '72 horas úteis',
            lanceImage: 'images/lances/lance-6.jpg'
        },
        {
            id: 7,
            nome: 'Todos os lances do time',
            icon: '📹',
            valor: 60.00,
            prazo: '72 horas úteis',
            lanceImage: 'images/lances/lance-7.jpeg'
        },
        {
            id: 8,
            nome: 'Link Jogo completo sem edição',
            icon: '🎬',
            valor: 20.00,
            prazo: '72 horas úteis',
            lanceImage: 'images/lances/lance-8.jpg'
        }
    ],

    // ============================================
    // 💳 INTEGRAÇÃO MERCADO PAGO - PIX DINÂMICO
    // ============================================
    mercadoPago: {
        enabled: true,
        publicKey: 'TEST-304e0d6a-41a9-456d-8488-120a29286a71',
        accessToken: 'TEST-5218653994789783-011223-79a0918f493f46a42142ad8b93589406-419702265',
        testMode: true // true = testes | false = produção
    },

    // ============================================
    // 🔥 INTEGRAÇÃO TELEGRAM - CONFIGURADO!
    // ============================================
    telegram: {
        enabled: true,
        botToken: '8539567789:AAGDDhOEpXRHJv92OAW_uOxFoCLZjpcrel4',
        chatId: '8212337244'
    },

    // ============================================
    // INTEGRAÇÃO GOOGLE SHEETS (OPCIONAL)
    // ============================================
    googleSheets: {
        enabled: false,
        scriptUrl: 'SUA_URL_DO_GOOGLE_APPS_SCRIPT_AQUI',
    },

    // ============================================
    // CONFIGURAÇÕES DE NOTIFICAÇÃO
    // ============================================
    notifications: {
        method: 'telegram',
        
        email: {
            enabled: false,
            formspreeId: 'SEU_FORMSPREE_ID_AQUI'
        }
    }
};

// Não altere abaixo desta linha
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}