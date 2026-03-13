import { Store } from './store.js';

const getApiKey = () => Store.getApiKey();
const BASE_URL = 'https://api.themoviedb.org/3';

export const TMDB = {
    searchSeries: async (query) => {
        const key = getApiKey();
        if (!key) throw new Error('APIキーが設定されていません。右上の設定から入力してください。');
        const response = await fetch(`${BASE_URL}/search/tv?api_key=${key}&query=${encodeURIComponent(query)}&language=ja-JP`);
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.status_message || `HTTP Error ${response.status}`);
        }
        const data = await response.json();
        return data.results;
    },
    
    getSeriesDetails: async (id) => {
        const key = getApiKey();
        const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${key}&language=ja-JP&append_to_response=watch/providers`);
        return await response.json();
    },

    getLatestEpisode: async (id) => {
        const key = getApiKey();
        const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${key}&language=ja-JP`);
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
