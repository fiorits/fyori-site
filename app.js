/**
 * Fyori Website - Global Application Script
 * Controla apenas a busca assíncrona de vídeos da API do YouTube.
 */

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('last-videos')) {
        fetchYouTubeVideos();
    }
});

// --- VÍDEOS DO YOUTUBE (Backend Seguro) ---
async function fetchYouTubeVideos() {
    const container = document.getElementById('last-videos');
    if (!container) return;

    container.innerHTML = '<p style="color:var(--cor-texto-secundario);">Carregando vídeos...</p>';

    try {
        const response = await fetch('/api/videos');
        
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
        console.error('Erro ao carregar vídeos:', error);
        container.innerHTML = `<p style="color:var(--cor-destaque);text-align:center;">Indisponível no momento.</p>`;
    }
}