let texto = "Este é o texto original contendo Valor1 e valor1 que serão substituídos.";
let nome = "novoValor";

// Substitui todas as ocorrências de 'valor1' (ignorando maiúsculas e minúsculas) por 'nome'
let novoTexto = texto.replace(/valor1/gi, nome);

console.log(novoTexto); // Este é o texto original contendo novoValor e novoValor que serão substituídos.
