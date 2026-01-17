/* ============================================
   INTEGRAÇÃO MERCADO PAGO - VIA BACKEND
   ============================================ */
const MercadoPago = {
    
    async criarPagamentoPix(pedido) {
        const paymentData = {
            transaction_amount: parseFloat(pedido.valor),
            description: `${pedido.tipoLance} - ${pedido.quadra}`,
            payment_method_id: 'pix',
            payer: {
                email: pedido.email,
                first_name: pedido.nome.split(' ')[0] || pedido.nome,
                last_name: pedido.nome.split(' ').slice(1).join(' ') || pedido.nome
            },
            metadata: {
                quadra: pedido.quadra,
                lado: pedido.lado || 'N/A',
                dataJogo: pedido.dataJogo,
                horario: pedido.horario,
                descricao: pedido.descricao,
                telefone: pedido.telefone
            }
        };
        try {
            console.log('🚀 Criando pagamento PIX via backend...');
            
            const response = await fetch('https://olho-no-lance-api.onrender.com/api/criar-pagamento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });
            const data = await response.json();
            if (response.ok && data.status === 'pending') {
                console.log('✅ Pagamento PIX criado com sucesso!');
                console.log('🆔 Payment ID:', data.id);
                
                return {
                    success: true,
                    paymentId: data.id,
                    qrCode: data.point_of_interaction.transaction_data.qr_code,
                    qrCodeBase64: data.point_of_interaction.transaction_data.qr_code_base64,
                    expirationDate: data.date_of_expiration
                };
            } else {
                console.error('❌ Erro ao criar pagamento:', data);
                
                let errorMessage = 'Erro ao gerar PIX';
                if (data.message) {
                    errorMessage = data.message;
                } else if (data.cause && data.cause.length > 0) {
                    errorMessage = data.cause[0].description || errorMessage;
                }
                
                return {
                    success: false,
                    error: errorMessage
                };
            }
        } catch (error) {
            console.error('❌ Erro na requisição:', error);
            return {
                success: false,
                error: 'Erro de conexão com o servidor. Verifique se o backend está rodando.'
            };
        }
    },
    
    async consultarPagamento(paymentId) {
        try {
            const response = await fetch(`https://olho-no-lance-api.onrender.com/api/consultar-pagamento/${paymentId}`);
            const data = await response.json();
            if (response.ok) {
                return {
                    status: data.status,
                    statusDetail: data.status_detail,
                    approved: data.status === 'approved',
                    pending: data.status === 'pending'
                };
            } else {
                console.error('❌ Erro ao consultar pagamento:', data);
                return null;
            }
        } catch (error) {
            console.error('❌ Erro ao consultar pagamento:', error);
            return null;
        }
    }
};

console.log('💳 Mercado Pago carregado (via backend Python)!');
