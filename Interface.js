class Interface {
    constructor() {
        this.contatos = null;
        this.numero = [];
        this.texto = [];
        this.puppeteer = require('puppeteer');
        this.sql = require('mssql');
        this.fs = require('fs');
        this.path = require('path');
        this.config = {
            user: 'sa',
            password: 'etropus@147258',
            server: '192.168.4.10',
            database: 'merger',
            options: {
                encrypt: false
            }
        };


        this.initButtons();
    }

    initButtons() {
        let logar = document.getElementById("logar");

        logar.addEventListener("click", async e => {
            try {
                // Caminho para a pasta user_data
                const user_data_path = this.path.resolve(__dirname, 'user_data');
        
                // Exclui a pasta user_data se ela já existir
                if (this.fs.existsSync(user_data_path)) {
                    this.fs.rmdirSync(user_data_path, { recursive: true });
                    console.log('Pasta user_data excluída.');
                }
        
                // Cria a pasta user_data novamente
                this.fs.mkdirSync(user_data_path);
                console.log('Pasta user_data recriada.');
        
                // Inicia o navegador novamente após recriar a pasta
                const browser = await this.puppeteer.launch({
                    headless: false, // Defina como false para ver o navegador
                    userDataDir: './user_data'
                });
        
                // Abre uma nova página
                const page = await browser.newPage();
        
                // Navega para o WhatsApp Web
                await page.goto('https://web.whatsapp.com');
        
                console.log('WhatsApp Web aberto novamente após recriar a pasta user_data.');
            } catch (error) {
                console.error('Erro ao recriar a pasta user_data:', error);
            }
        });

        let iniciar = document.getElementById("iniciar");

        iniciar.addEventListener("click", async e => {
            let arrayDeObjetos = [];
            let contatos = document.getElementById("contatos").value;

            // Divide a string de contatos em linhas
            let linhasDeContatos = contatos.split('\n').map(linha => linha.trim());

            for (let linha of linhasDeContatos) {
                // Adiciona o objeto criado para cada linha no array
                arrayDeObjetos.push(this.criarObjetoDeString(linha));
            }

            console.log(arrayDeObjetos);  // Exibe os objetos no console

            // Exemplo de mensagem com placeholders
            let mensagem = document.getElementById("mensagens").value;

            // Processa e exibe as mensagens personalizadas
            await this.getMessage(arrayDeObjetos, mensagem);
        });
    }

    criarObjetoDeString(texto) {
        let valores = texto.split(',').map(valor => valor.trim());
        return {
            numero: valores[0] || null,
            nome: valores[1] || null,
            contrato: valores[2] || null
        };
    }

    async getMessage(arrayDeObjetos, mensagem) {
        const userDataDir = './user_data';
        const browser = await this.puppeteer.launch({
            headless: false,
            userDataDir: userDataDir
        });
        const page = await browser.newPage();
        const erros = [];
    
        for (let i = 0; i < arrayDeObjetos.length; i++) {
            const objeto = arrayDeObjetos[i];
            let mensagemPersonalizada = mensagem
                .replace(/valor1/g, objeto.nome)
                .replace(/valor2/g, objeto.contrato);
            const numero = objeto.numero;
    
            await page.goto(`https://wa.me/${numero}`);
            console.log('WhatsApp Web aberto no navegador. Se necessário, escaneie o QR code para fazer login.');
    
            try {
                await page.waitForSelector('#action-button');
                await page.click('#action-button');
                console.log('Clicou no botão');
    
                await new Promise(resolve => setTimeout(resolve, 5000));
    
                await page.waitForSelector('span');
                const spans = await page.$$('span');
                for (const span of spans) {
                    const text = await page.evaluate(element => element.textContent, span);
                    if (text.includes('usar o WhatsApp Web')) {
                        await span.click();
                        console.log('Clicou no botão para usar o WhatsApp Web.');
                        break;
                    }
                }
    
                await page.waitForSelector('div[aria-label="Digite uma mensagem"]');
                await page.click('div[aria-label="Digite uma mensagem"]');
                console.log('Clicou na div "Digite uma mensagem".');
                await page.type('div[aria-label="Digite uma mensagem"]', mensagemPersonalizada);
                console.log('Digitou a mensagem personalizada na div.');
    
                await new Promise(resolve => setTimeout(resolve, 5000));
                await page.click('[aria-label="Enviar"]');
                console.log('Clicou no botão de enviar.');
    
                let tempo = document.getElementById('tempo').value;
                let [horas, minutos, segundos] = tempo.split(':').map(Number);
                let ms = ((horas * 60 * 60) + (minutos * 60) + segundos) * 1000;
                await new Promise(resolve => setTimeout(resolve, ms));
    
                let msgEnviada = document.getElementById('cont').value;
                msgEnviada++
                document.getElementById('cont').value = msgEnviada;
            } catch (error) {
                console.error('Erro ao processar o número:', numero, error);
                erros.push(objeto);
            }
        }
    
        await browser.close();
    
        if (erros.length > 0) {
            console.log('Objetos com números inválidos:', erros);
            this.inserirErrosNoBancoDeDados(erros);
        }
    }

    async inserirErrosNoBancoDeDados(erros) {
        try {
            // Conecta ao banco de dados
            await this.sql.connect(this.config);
    
            // Insere cada objeto de erro na tabela
            for (let erro of erros) {
                const request = new this.sql.Request();
                const query = `INSERT INTO ErroDisparador (numero, nome, contrato) VALUES ('${erro.numero}', '${erro.nome}', '${erro.contrato}')`;
                await request.query(query);
                console.log('Objeto de erro inserido no banco de dados:', erro);
            }
    
            // Fecha a conexão com o banco de dados
            await this.sql.close();
        } catch (error) {
            console.error('Erro ao inserir objetos de erro no banco de dados:', error.message);
        }
    }
    
}

var inter = new Interface();