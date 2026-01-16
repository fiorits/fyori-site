export default async function handler(req, res) {
    // Pega a chave que vamos configurar lá no site da Vercel (seguro)
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const CHANNEL_ID = 'UCpZ886pfK3UWIK4ywgHEV6g'; // Seu ID do canal

    if (!API_KEY) {
        return res.status(500).json({ error: 'Chave de API não configurada.' });
    }

    // Transforma ID do Canal em ID da Playlist de Uploads
    const uploadsPlaylistId = CHANNEL_ID.replace(/^UC/, 'UU');

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=3&playlistId=${uploadsPlaylistId}&key=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Erro ao comunicar com o YouTube');
        }

        const data = await response.json();
        
        // Cache: Guarda o resultado por 1 hora (3600 segundos) para economizar sua cota
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}