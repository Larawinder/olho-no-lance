from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)

ACCESS_TOKEN = 'APP_USR-5218653994789783-011223-69adc260e8b319508ad3c1fbc1df5d4d-419702265'
# Servir arquivos estáticos
@app.route('/')
def index():
    return send_from_directory('.', 'INDEX.HTML')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

# Endpoint para criar pagamento
@app.route('/api/criar-pagamento', methods=['POST'])
def criar_pagamento():
    try:
        payment_data = request.json
        
        print('📦 Dados recebidos:', json.dumps(payment_data, indent=2))
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {ACCESS_TOKEN}',
            'X-Idempotency-Key': f'{payment_data.get("payer", {}).get("email", "default")}-{payment_data.get("transaction_amount", 0)}'
        }
        
        response = requests.post(
            'https://api.mercadopago.com/v1/payments',
            json=payment_data,
            headers=headers
        )
        
        print('📡 Status da resposta:', response.status_code)
        print('📄 Resposta do MP:', json.dumps(response.json(), indent=2))
        
        return jsonify(response.json()), response.status_code
        
    except Exception as e:
        print('❌ Erro:', str(e))
        return jsonify({'error': str(e)}), 500

# Endpoint para consultar pagamento
@app.route('/api/consultar-pagamento/<payment_id>', methods=['GET'])
def consultar_pagamento(payment_id):
    try:
        headers = {
            'Authorization': f'Bearer {ACCESS_TOKEN}'
        }
        
        response = requests.get(
            f'https://api.mercadopago.com/v1/payments/{payment_id}',
            headers=headers
        )
        
        return jsonify(response.json()), response.status_code
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

iif __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 3000))
    print(f'🚀 Servidor rodando na porta {port}')
    print('💳 Mercado Pago em modo PRODUÇÃO')
    app.run(host='0.0.0.0', port=port, debug=False)