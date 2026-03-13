const TMDB_API_KEY = '4fb6e1d446979a0ebcc0230f36746864'; // Demo key, user should ideally use their own
const BASE_URL = 'https://api.themoviedb.org/3';

export const TMDB = {
    searchSeries: async (query) => {
        const response = await fetch(`${BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=ja-JP`);
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.status_message || `HTTP Error ${response.status}`);
        }
        const data = await response.json();
        return data.results;
    },
    
    getSeriesDetails: async (id) => {
        const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=ja-JP&append_to_response=watch/providers`);
        return await response.json();
    },
    
    getLatestEpisode: async (id) => {
        const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=ja-JP`);
        const data = await response.json();
        return {
            season: data.number_of_seasons,
            episode: data.last_episode_to_air?.episode_number,
            air_date: data.last_episode_to_air?.air_date,
            name: data.last_episode_to_air?.name
        };
    },

    getProviders: (details) => {
        const providers = details['watch/providers']?.results?.JP?.flatrate || [];
        return providers.map(p => ({
            id: p.provider_id,
            name: p.provider_name,
            logo: `https://image.tmdb.org/t/p/original${p.logo_path}`
        }));
    }
};
