/**
 * Fyori Website - Global Application Script
 * Controla a busca dinâmica de vídeos e o efeito interativo da lanterna (Spotlight).
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a escuta dos vídeos do canal
    if (document.getElementById('last-videos')) {
        fetchYouTubeVideos();
    }

    // Inicializa o Efeito Lanterna Interativa no Fundo do Site
    setupSpotlightLantern();
});

// --- EFEITO SPOTLIGHT LANTERNA ---
function setupSpotlightLantern() {
    // Só ativa se o dispositivo possuir ponteiro de mouse estável (evita gargalos em mobile)
    if (window.matchMedia('(hover: hover)').matches) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;

            // Seta as coordenadas calculadas dinamicamente nas variáveis do CSS
            document.body.style.setProperty('--mouse-x', `${x}%`);
            document.body.style.setProperty('--mouse-y', `${y}%`);
        });
    }
}

// --- VÍDEOS DO YOUTUBE (Backend Seguro na Vercel) ---
async function fetchYouTubeVideos() {
    const container = document.getElementById('last-videos');
    if (!container) return;

    container.innerHTML = '<p style="color:var(--cor-texto-secundario); font-family:Montserrat,sans-serif;">Acessando arquivos do canal...</p>';

    try {
        const response = await fetch('/api/videos');
        
        if (!response.ok) throw new Error('Falha ao sincronizar banco de dados do YouTube.');
        
        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            container.innerHTML = '<p style="color:var(--cor-texto-secundario);">Nenhum arquivo recente encontrado.</p>';
            return;
        }

        container.innerHTML = '';
        data.items.forEach(item => {
            const { title, resourceId, thumbnails } = item.snippet;
            const videoId = resourceId.videoId;
            const thumbnailUrl = thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default.url;
            
            container.innerHTML += `
                <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener noreferrer" class="video-card">
                    <div class="thumbnail-container">
                        <img src="${thumbnailUrl}" alt="${title}" loading="lazy">
                        <div class="play-overlay">
                            <svg class="play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                    </div>
                    <h3>${title}</h3>
                </a>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar feeds de vídeo:', error);
        container.innerHTML = `<p style="color:var(--cor-destaque); text-align:center; font-family:Montserrat,sans-serif; font-size:0.9rem;">Feed temporariamente indisponível.</p>`;
    }
}