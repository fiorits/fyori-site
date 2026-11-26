/**
 * Gera o "cofre" da página secreta. NÃO suba este arquivo para o site.
 * Uso:   node gerar-cofre.js <login> <senha> <caminho-do-arquivo>
 * Ex.:   node gerar-cofre.js GUIA 6285 Imagens/floresta-vazia.png
 *
 * Cole o texto que ele imprimir na constante COFRE do lume.html.
 * Login e senha não ficam escritos no site: eles são a chave que destrava o caminho do arquivo.
 * (Login e senha são comparados sem diferenciar maiúsculas e sem espaços nas pontas.)
 */
const { webcrypto } = require('node:crypto');
const subtle = webcrypto.subtle;

const [login, senha, caminho] = process.argv.slice(2);
if (!login || !senha || !caminho) {
    console.error('Uso: node gerar-cofre.js <login> <senha> <caminho-do-arquivo>');
    process.exit(1);
}

const norm = (s) => s.trim().toLowerCase();

(async () => {
    const enc = new TextEncoder();
    const salt = webcrypto.getRandomValues(new Uint8Array(16));
    const iv = webcrypto.getRandomValues(new Uint8Array(12));

    const base = await subtle.importKey('raw', enc.encode(norm(login) + '\u0000' + norm(senha)), 'PBKDF2', false, ['deriveKey']);
    const chave = await subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' },
        base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
    );
    const cifrado = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, chave, enc.encode(caminho)));

    const tudo = new Uint8Array(salt.length + iv.length + cifrado.length);
    tudo.set(salt, 0); tudo.set(iv, 16); tudo.set(cifrado, 28);
    console.log(Buffer.from(tudo).toString('base64'));
})();
