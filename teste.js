const puppeteer = require('puppeteer');

var nome = 'Edson Vitor';
var codigo = '85975485';
var mensagem = `1º ALERTA DE AJUIZAMENTO ⚖️
Sr(a) *VALOR1*
🚨ATENÇÃO CLIENTE
CORRA ENQUANTO HÁ TEMPO! 🚨
Devido a quantidade de tempo em aberto
Aproveite a *ÚLTIMA CHANCE DE NEGOCIAÇÃO AMIGÁVEL
Temos ofertas para QUITAR COM DESCONTOS
Reverta essa situação HOJE! Evite aborrecimentos 🙏🏻
1️⃣ - QUERO DEVOLVER
2️⃣ - QUERO QUITAR
3️⃣ - QUERO PARCELAR
Código: *VALOR2*
mais informações 0800 585 0800. 😉 Falar com Consultor financeira Wilton Silva`;

// Substitui todas as ocorrências de 'valor1' (ignorando maiúsculas e minúsculas) por 'nome'
let novoTexto = mensagem.replace(/valor1/gi, nome)
                        .replace(/valor2/gi, codigo);



(async () => {
  // Defina o caminho para o diretório de dados do usuário
  const userDataDir = './user_data';

  // Inicie o navegador com o diretório de dados do usuário
  const browser = await puppeteer.launch({
    headless: false, // Defina como false para ver o navegador
    userDataDir: userDataDir
  });

  // Abra uma nova aba e navegue para o WhatsApp Web
  const page = await browser.newPage();
  await page.goto('https://wa.me/55625729379');

  console.log('WhatsApp Web aberto no navegador. Se necessário, escaneie o QR code para fazer login.');
  // Mantém o navegador aberto para que você possa fazer login e o estado da sessão seja salvo
  // await new Promise(resolve => setTimeout(resolve, 5000)); // 60 segundos para você escanear o QR code e fazer login
  
  // Clicar no botão com o ID "action-button"
  await page.waitForSelector('#action-button'); // Espera o botão aparecer na página
  await page.click('#action-button'); // Clica no botão
  console.log('clicou no botao');
  // Adicione qualquer outra interação ou lógica aqui

  // Aguarda mais um tempo para você poder ver o resultado
  await new Promise(resolve => setTimeout(resolve, 5000)); // 10 segundos

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

  // Espera até que a div com o atributo aria-label="Digite uma mensagem" seja carregada e clica nela
await page.waitForSelector('div[aria-label="Digite uma mensagem"]');
await page.click('div[aria-label="Digite uma mensagem"]');
console.log('Clicou na div "Digite uma mensagem".');

// Digita 'Olá' na div
// Digita a mensagem na div
await page.type('div[aria-label="Digite uma mensagem"]', novoTexto + '');

console.log('Digitou "Olá" na div.');

await page.click('[aria-label="Enviar"]');

})();