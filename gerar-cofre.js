/**
 * Gera o "cofre" da página secreta (clareira.html). Este arquivo não vai para o site (ver .vercelignore).
 * Uso:   node gerar-cofre.js <login> <senha> <caminho-do-arquivo>
 * Ex.:   node gerar-cofre.js meulogin 1234 Imagens/arquivo.png
 *
 * Ele imprime três linhas (COFRE, MARCA_LOGIN e MARCA_SENHA): cole as três no clareira.html, no lugar das atuais.
 * Login e senha não ficam escritos no site:
 *  - COFRE só abre com login + senha juntos e revela o caminho do arquivo;
 *  - MARCA_LOGIN e MARCA_SENHA só dizem se cada um, sozinho, está certo (para a página dar a pista certa).
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
const enc = new TextEncoder();
const ITER = 200000;
const b64 = (u8) => Buffer.from(u8).toString('base64');

async function cofre() {
    const salt = webcrypto.getRandomValues(new Uint8Array(16));
    const iv = webcrypto.getRandomValues(new Uint8Array(12));
    const base = await subtle.importKey('raw', enc.encode(norm(login) + '\u0000' + norm(senha)), 'PBKDF2', false, ['deriveKey']);
    const chave = await subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' },
        base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
    );
    const cifrado = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, chave, enc.encode(caminho)));
    const tudo = new Uint8Array(28 + cifrado.length);
    tudo.set(salt, 0); tudo.set(iv, 16); tudo.set(cifrado, 28);
    return b64(tudo);
}

async function marca(valor) {
    const salt = webcrypto.getRandomValues(new Uint8Array(16));
    const base = await subtle.importKey('raw', enc.encode(norm(valor)), 'PBKDF2', false, ['deriveBits']);
    const bits = new Uint8Array(await subtle.deriveBits({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base, 256));
    const tudo = new Uint8Array(16 + bits.length);
    tudo.set(salt, 0); tudo.set(bits, 16);
    return b64(tudo);
}

(async () => {
    console.log(`        const COFRE = '${await cofre()}';`);
    console.log(`        const MARCA_LOGIN = '${await marca(login)}';`);
    console.log(`        const MARCA_SENHA = '${await marca(senha)}';`);
})();
