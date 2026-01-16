module.exports = async (req, res) => {
    // Pega a chave do "cofre" da Vercel
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const CHANNEL_ID = 'UCpZ886pfK3UWIK4ywgHEV6g'; // Seu ID do canal

    if (!API_KEY) {
        return res.status(500).json({ error: 'Chave de API não configurada.' });
    }

    const uploadsPlaylistId = CHANNEL_ID.replace(/^UC/, 'UU');

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=3&playlistId=${uploadsPlaylistId}&key=${API_KEY}`
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Erro YouTube:', errorData); // Isso ajuda a ver o erro no log da Vercel
            throw new Error(`Erro do YouTube: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Cache de 1 hora
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};