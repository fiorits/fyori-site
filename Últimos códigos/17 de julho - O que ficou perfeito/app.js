/**
 * Fyori Website - Global Application Script
 * Controla o tema, o easter egg da chuva persistente, animações e vídeos.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa todas as funcionalidades quando a página carrega
    setupTheme();
    handleFirstVisitAnimation();
    
    // Funções específicas para cada página
    if (document.getElementById('last-videos')) {
        fetchYouTubeVideos();
    }
    if (document.getElementById('rain-trigger-faq')) {
        setupEasterEggButton();
    }

    // Sincroniza o estado da chuva em todas as páginas
    syncRainState();
});

// --- GERENCIAMENTO DE TEMA ---
function setupTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    // Aplica o tema no carregamento inicial
    const currentTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (currentTheme === 'light' || (!currentTheme && !prefersDark)) {
        document.body.classList.add('light-mode');
    }

    // Lida com o clique no botão de tema
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const newTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);

        // Se mudar para o modo claro, para a chuva
        if (newTheme === 'light' && localStorage.getItem('rainState') === 'playing') {
            toggleRain(true); // Força a parada
        }
    });
}

// --- EASTER EGG DA CHUVA ---
let animationFrameId;
const FADE_TIME = 800;
const MAX_VOLUME = 0.36;

const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

function fadeAudio(audio, targetVolume) {
    cancelAnimationFrame(animationFrameId);
    const startVolume = audio.volume;
    const volumeChange = targetVolume - startVolume;
    let startTime = null;

    if (targetVolume > 0 && audio.paused) {
        audio.play().catch(e => console.error("Erro ao tocar áudio:", e));
    }

    function animate(currentTime) {
        if (startTime === null) startTime = currentTime;
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / FADE_TIME, 1);
        const easedProgress = easeInOutQuad(progress);

        audio.volume = startVolume + volumeChange * easedProgress;

        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            if (targetVolume === 0) {
                audio.pause();
                audio.currentTime = 0;
            }
        }
    }
    animationFrameId = requestAnimationFrame(animate);
}

function toggleRain(forceStop = false) {
    const rainSound = document.getElementById('rain-sound');
    if (!rainSound) return;

    const currentState = localStorage.getItem('rainState');
    const isRaining = currentState === 'playing';
    
    let newState;
    if (forceStop) {
        newState = 'stopped';
    } else {
        newState = isRaining ? 'stopped' : 'playing';
    }

    localStorage.setItem('rainState', newState);
    syncRainState();
}

function syncRainState() {
    const rainSound = document.getElementById('rain-sound');
    const rainTrigger = document.getElementById('rain-trigger-faq');
    if (!rainSound) return;

    const state = localStorage.getItem('rainState');
    const isLightMode = document.body.classList.contains('light-mode');

    if (state === 'playing' && !isLightMode) {
        fadeAudio(rainSound, MAX_VOLUME);
        if (rainTrigger) rainTrigger.classList.add('active');
    } else {
        fadeAudio(rainSound, 0);
        if (rainTrigger) rainTrigger.classList.remove('active');
    }
}

function setupEasterEggButton() {
    const rainTrigger = document.getElementById('rain-trigger-faq');
    if (!rainTrigger) return;

    rainTrigger.addEventListener('click', () => {
        if (!document.body.classList.contains('light-mode')) {
            toggleRain();
        }
    });
}


// --- ANIMAÇÃO DE PRIMEIRA VISITA ---
function handleFirstVisitAnimation() {
    if (!sessionStorage.getItem('fyoriSiteVisited')) {
        const elementsToAnimate = document.querySelectorAll('.animatable');
        elementsToAnimate.forEach((el, index) => {
            el.classList.add('animated', `delay-${index + 1}`);
        });
        sessionStorage.setItem('fyoriSiteVisited', 'true');
    } else {
        const elements = document.querySelectorAll('.animatable');
        elements.forEach(el => { el.style.opacity = 1; });
    }
}

// --- VÍDEOS DO YOUTUBE (para a página Index) ---
async function fetchYouTubeVideos() {
    const API_KEY = 'AIzaSyDaRPzw4KNZElP4dFKwulF75Oun9pLmkh8';
    const CHANNEL_ID = 'UCpZ886pfK3UWIK4ywgHEV6g';
    const container = document.getElementById('last-videos');
    if (!container) return;

    if (API_KEY === 'SUA_CHAVE_DE_API_AQUI' || !API_KEY) {
        container.innerHTML = '<p style="color:var(--cor-destaque);text-align:center;">Configure a chave da API do YouTube.</p>';
        return;
    }
    const uploadsPlaylistId = CHANNEL_ID.replace(/^UC/, 'UU');
    container.innerHTML = '<p style="color:var(--cor-texto-secundario);">Carregando vídeos...</p>';
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=3&playlistId=${uploadsPlaylistId}&key=${API_KEY}`);
        if (!response.ok) throw new Error('Falha ao buscar os vídeos.');
        const data = await response.json();
        if (!data.items || data.items.length === 0) {
            container.innerHTML = '<p>Nenhum vídeo encontrado.</p>';
            return;
        }
        container.innerHTML = '';
        data.items.forEach(item => {
            const { title, resourceId, thumbnails } = item.snippet;
            const videoId = resourceId.videoId;
            const thumbnailUrl = thumbnails.high?.url || thumbnails.default.url;
            container.innerHTML += `
                <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener noreferrer" class="video-card">
                    <div class="thumbnail-container">
                        <img src="${thumbnailUrl}" alt="${title}">
                        <div class="play-overlay">
                            <svg class="play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                    </div>
                    <h3>${title}</h3>
                </a>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar vídeos:', error);
        container.innerHTML = `<p style="color:var(--cor-destaque);text-align:center;">${error.message}</p>`;
    }
}
