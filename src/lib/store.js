export const Store = {
    getFavorites: () => JSON.parse(localStorage.getItem('yasflix_favorites') || '[]'),
    saveFavorites: (favorites) => localStorage.setItem('yasflix_favorites', JSON.stringify(favorites)),

    getSettings: () => JSON.parse(localStorage.getItem('yasflix_settings') || '{"providers": []}'),
    saveSettings: (settings) => localStorage.setItem('yasflix_settings', JSON.stringify(settings)),

    getApiKey: () => localStorage.getItem('yasflix_tmdb_key') || '',
    saveApiKey: (key) => localStorage.setItem('yasflix_tmdb_key', key),

    // お気に入りに追加済みかチェック
    isFavorite: (id) => {
        const favorites = Store.getFavorites();
        return favorites.some(f => f.id === id);
    },

    addFavorite: (show) => {
        const favorites = Store.getFavorites();
        if (!Store.isFavorite(show.id)) {
            favorites.push(show);
            Store.saveFavorites(favorites);
            return true; // 追加成功
        }
        return false; // すでに存在
    },

    removeFavorite: (id) => {
        const favorites = Store.getFavorites();
        Store.saveFavorites(favorites.filter(f => f.id !== id));
    },

    exportData: () => {
        const data = {
            favorites: Store.getFavorites(),
            settings: Store.getSettings(),
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    },

    importData: (jsonData) => {
        try {
            const data = JSON.parse(jsonData);
            if (data.favorites && Array.isArray(data.favorites)) {
                Store.saveFavorites(data.favorites);
            }
            if (data.settings && data.settings.providers) {
                Store.saveSettings(data.settings);
            }
            return true;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    }
};
