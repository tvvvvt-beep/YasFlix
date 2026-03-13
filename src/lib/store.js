export const Store = {
    getFavorites: () => JSON.parse(localStorage.getItem('yasflix_favorites') || '[]'),
    saveFavorites: (favorites) => localStorage.setItem('yasflix_favorites', JSON.stringify(favorites)),
    
    getSettings: () => JSON.parse(localStorage.getItem('yasflix_settings') || '{"providers": []}'),
    saveSettings: (settings) => localStorage.setItem('yasflix_settings', JSON.stringify(settings)),
    
    addFavorite: (show) => {
        const favorites = Store.getFavorites();
        if (!favorites.find(f => f.id === show.id)) {
            favorites.push(show);
            Store.saveFavorites(favorites);
        }
    },
    
    removeFavorite: (id) => {
        const favorites = Store.getFavorites();
        Store.saveFavorites(favorites.filter(f => f.id !== id));
    }
};
