import { Store } from './lib/store.js';
import { TMDB } from './lib/tmdb.js';
import { Notifications } from './lib/notifications.js';

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const PROVIDERS = [
    { id: 8, name: 'Netflix', logo: 'N' },
    { id: 337, name: 'Disney+', logo: 'D+' },
    { id: 119, name: 'Amazon Prime', logo: 'AP' },
    { id: 350, name: 'Apple TV+', logo: 'AT' },
    { id: 11, name: 'Hulu', logo: 'H' },
    { id: 318, name: 'U-NEXT', logo: 'U' }
];

class YasFlixApp {
    constructor() {
        this.favorites = Store.getFavorites();
        this.settings = Store.getSettings();
        
        this.elements = {
            main: document.getElementById('main-content'),
            voiceTrigger: document.getElementById('voice-trigger'),
            voiceModal: document.getElementById('voice-modal'),
            voiceStatus: document.getElementById('voice-status'),
            voiceTranscript: document.getElementById('voice-transcript'),
            closeVoice: document.getElementById('close-voice'),
            settingsBtn: document.getElementById('settings-btn'),
            settingsModal: document.getElementById('settings-modal'),
            providerSelector: document.getElementById('provider-selector'),
            saveSettings: document.getElementById('save-settings'),
            searchResultsModal: document.getElementById('search-results-modal'),
            searchResultsList: document.getElementById('search-results-list'),
            closeResults: document.getElementById('close-results'),
            detailsModal: document.getElementById('details-modal'),
            closeDetails: document.getElementById('close-details'),
            removeShow: document.getElementById('remove-show'),
            apiKeyInput: document.getElementById('api-key-input')
        };

        this.currentDetailsId = null;
        this.init();
    }

    async init() {
        // 通知機能の初期化
        if (Notifications.isSupported() && Notifications.getPermission() === 'default') {
            await Notifications.requestPermission();
        }

        this.elements.voiceTrigger.addEventListener('click', () => this.startVoiceInput());
        this.elements.closeVoice.addEventListener('click', () => this.hideVoiceModal());
        this.elements.settingsBtn.addEventListener('click', () => this.showSettings());
        this.elements.saveSettings.addEventListener('click', () => this.saveSettings());
        this.elements.closeResults.addEventListener('click', () => this.elements.searchResultsModal.classList.add('hidden'));
        this.elements.closeDetails.addEventListener('click', () => this.elements.detailsModal.classList.add('hidden'));
        this.elements.removeShow.addEventListener('click', () => this.deleteFavorite());

        // Add navigation handlers
        document.getElementById('nav-dashboard').addEventListener('click', () => this.renderDashboard());
        document.getElementById('nav-search').addEventListener('click', () => this.showSearchPage());

        this.renderDashboard();
    }

    async renderDashboard() {
        // Update navigation active state
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        document.getElementById('nav-dashboard').classList.add('active');

        this.elements.main.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>最新情報を取得中...</p></div>';

        if (!Store.getApiKey()) {
            this.elements.main.innerHTML = `
                <div class="api-warning">
                    ⚠️ TMDB APIキーが設定されていません。右上の設定から入力してください。
                </div>
                <div class="empty-state" style="text-align: center; color: var(--text-muted);">
                    <p>APIキーを設定すると、音声で作品を追加できるようになります。</p>
                </div>
            `;
            return;
        }

        if (this.favorites.length === 0) {
            this.elements.main.innerHTML = `
                <div class="empty-state" style="text-align: center; padding-top: 50px; color: var(--text-muted);">
                    <p>お気に入りが登録されていません。<br>下のマイクボタンから登録してね！</p>
                </div>
            `;
            return;
        }

        try {
            const showCards = await Promise.all(this.favorites.map(async (show) => {
                try {
                    const [details, latest] = await Promise.all([
                        TMDB.getSeriesDetails(show.id),
                        TMDB.getLatestEpisode(show.id)
                    ]);
                    const providers = TMDB.getProviders(details);

                    const userProviders = providers.filter(p => this.settings.providers.includes(p.id));
                    const statusColor = userProviders.length > 0 ? 'var(--accent-green)' : 'var(--text-muted)';
                    const statusText = userProviders.length > 0 ? '視聴可能' : '配信なし';

                    // Check if new (last 7 days)
                    const airDate = new Date(latest.air_date);
                    const isNew = latest.air_date && (new Date() - airDate) < (7 * 24 * 60 * 60 * 1000);

                    return `
                        <div class="show-card" data-id="${show.id}">
                            ${isNew ? '<div class="new-badge">NEW</div>' : ''}
                            <div class="show-poster" style="background-image: url(https://image.tmdb.org/t/p/w500${show.backdrop_path})"></div>
                            <div class="show-info">
                                <div class="show-title">${show.name}</div>
                                <div class="show-status">
                                    <span class="status-dot" style="background: ${statusColor}"></span>
                                    ${statusText} • 最新: S${latest.season} E${latest.episode}
                                </div>
                                <div class="watch-on">
                                    ${userProviders.map(p => `<span class="provider-tag">${p.name}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    `;
                } catch (e) {
                    console.error('Error loading show:', show.name, e);
                    return `
                        <div class="show-card error-card" data-id="${show.id}">
                            <div class="show-poster" style="background-image: url(https://image.tmdb.org/t/p/w500${show.backdrop_path}); opacity: 0.5;"></div>
                            <div class="show-info">
                                <div class="show-title">${show.name}</div>
                                <div class="show-status error">読み込みエラー</div>
                            </div>
                        </div>
                    `;
                }
            }));

            this.elements.main.innerHTML = `<div class="card-grid">${showCards.join('')}</div>`;

            document.querySelectorAll('.show-card').forEach(card => {
                card.addEventListener('click', () => this.showDetails(card.dataset.id));
            });
        } catch (e) {
            console.error('Dashboard render error:', e);
            this.elements.main.innerHTML = `
                <div class="error-state">
                    <p>データの読み込み中にエラーが発生しました。</p>
                    <button class="retry-btn" onclick="location.reload()">再読み込み</button>
                </div>
            `;
        }
    }

    async showDetails(id) {
        this.currentDetailsId = id;
        const details = await TMDB.getSeriesDetails(id);
        const latestInfo = await TMDB.getLatestEpisode(id);
        const providers = TMDB.getProviders(details);
        const userProviders = providers.filter(p => this.settings.providers.includes(p.id));

        document.getElementById('details-backdrop').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${details.backdrop_path})`;
        document.getElementById('details-title').innerText = details.name;
        document.getElementById('details-status').innerText = `${details.number_of_seasons}シーズン • ${userProviders.length > 0 ? '視聴可能' : '配信サービスなし'}`;
        document.getElementById('details-ep-name').innerText = `最新話: ${latestInfo.name || 'タイトルなし'}`;
        document.getElementById('details-ep-overview').innerText = details.last_episode_to_air?.overview || 'あらすじ情報がありません。';

        const providersEl = document.getElementById('details-providers');
        providersEl.innerHTML = userProviders.map(p => `<span class="provider-tag">${p.name}</span>`).join('');

        // 新しいエピソードの通知をチェック
        const airDate = new Date(latestInfo.air_date);
        const isNew = latestInfo.air_date && (new Date() - airDate) < (7 * 24 * 60 * 60 * 1000);

        if (isNew && Notifications.isSupported()) {
            // 既に通知していなければ通知
            const notifiedKey = `notified_${id}_${latestInfo.episode}`;
            if (!localStorage.getItem(notifiedKey)) {
                await Notifications.notifyNewEpisode(details.name, latestInfo);
                localStorage.setItem(notifiedKey, 'true');
            }
        }

        this.elements.detailsModal.classList.remove('hidden');
    }

    async deleteFavorite() {
        if (confirm('お気に入りから削除しますか？')) {
            const showId = parseInt(this.currentDetailsId);

            // 削除前に作品名を取得
            const show = this.favorites.find(f => f.id === showId);
            const showName = show?.name || '作品';

            Store.removeFavorite(showId);
            this.favorites = Store.getFavorites();
            this.elements.detailsModal.classList.add('hidden');

            // 通知を送信
            await Notifications.notifyFavoriteRemoved(showName);

            this.renderDashboard();
        }
    }

    showSettings() {
        this.elements.providerSelector.innerHTML = PROVIDERS.map(p => `
            <div class="provider-item ${this.settings.providers.includes(p.id) ? 'selected' : ''}" data-id="${p.id}">
                <div class="provider-logo">${p.logo}</div>
                <span>${p.name}</span>
            </div>
        `).join('');

        this.elements.apiKeyInput.value = Store.getApiKey();

        document.querySelectorAll('.provider-item').forEach(el => {
            el.addEventListener('click', () => el.classList.toggle('selected'));
        });

        // Setup export/import handlers
        const exportBtn = document.getElementById('export-btn');
        const importBtn = document.getElementById('import-btn');
        const importInput = document.getElementById('import-file-input');

        exportBtn.onclick = () => {
            const dataStr = Store.exportData();
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `yasflix-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        };

        importBtn.onclick = () => importInput.click();

        importInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (Store.importData(event.target.result)) {
                        this.favorites = Store.getFavorites();
                        this.settings = Store.getSettings();
                        alert('データをインポートしました！');
                        this.elements.settingsModal.classList.add('hidden');
                        this.renderDashboard();
                    } else {
                        alert('インポートに失敗しました。ファイル形式を確認してください。');
                    }
                };
                reader.readAsText(file);
            }
        };

        // 通知設定
        const notifBtn = document.getElementById('enable-notifications');
        const notifStatus = document.getElementById('notification-status');

        if (Notifications.isSupported()) {
            const permission = Notifications.getPermission();
            if (permission === 'granted') {
                notifBtn.style.display = 'none';
                notifStatus.innerText = '✅ 通知が有効になっています';
                notifStatus.style.color = 'var(--accent-green)';
            } else if (permission === 'denied') {
                notifBtn.style.display = 'none';
                notifStatus.innerText = '❌ 通知が拒否されています';
                notifStatus.style.color = 'var(--accent-red)';
            } else {
                notifBtn.onclick = async () => {
                    const granted = await Notifications.requestPermission();
                    if (granted) {
                        notifBtn.style.display = 'none';
                        notifStatus.innerText = '✅ 通知が有効になりました！';
                        notifStatus.style.color = 'var(--accent-green)';
                    } else {
                        notifStatus.innerText = '❌ 通知が拒否されました';
                        notifStatus.style.color = 'var(--accent-red)';
                    }
                };
            }
        } else {
            notifBtn.style.display = 'none';
            notifStatus.innerText = '⚠️ このブラウザは通知をサポートしていません';
            notifStatus.style.color = 'var(--text-muted)';
        }

        this.elements.settingsModal.classList.remove('hidden');
    }

    saveSettings() {
        const selected = Array.from(document.querySelectorAll('.provider-item.selected'))
            .map(el => parseInt(el.dataset.id));
        
        this.settings.providers = selected;
        Store.saveSettings(this.settings);
        
        const apiKey = this.elements.apiKeyInput.value.trim();
        Store.saveApiKey(apiKey);

        this.elements.settingsModal.classList.add('hidden');
        this.renderDashboard();
    }

    startVoiceInput() {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'ja-JP';
        recognition.interimResults = true;

        this.elements.voiceModal.classList.remove('hidden');
        this.elements.voiceStatus.innerText = '聴いています...';
        this.elements.voiceTranscript.innerText = '';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.elements.voiceTranscript.innerText = transcript;
            if (event.results[0].isFinal) {
                this.searchShows(transcript);
            }
        };

        recognition.onerror = () => {
            this.elements.voiceStatus.innerText = 'うまく聞き取れませんでした';
            setTimeout(() => this.hideVoiceModal(), 1500);
        };

        recognition.start();
    }

    async searchShows(query) {
        this.elements.voiceStatus.innerText = `「${query}」を探しています...`;
        try {
            const results = await TMDB.searchSeries(query);
            this.hideVoiceModal();
            
            if (results.length === 0) {
                alert('見つかりませんでした。別の名前で試してね！');
                return;
            }

            if (results.length === 1) {
                this.addShow(results[0]);
            } else {
                this.showResultsSelection(results.slice(0, 5));
            }
        } catch (e) {
            console.error('Search error:', e);
            alert(`検索中にエラーが発生しました: ${e.message || '不明なエラー'}\nAPIキーが原因の可能性があります。`);
        }
    }

    showResultsSelection(results) {
        this.elements.searchResultsList.innerHTML = results.map(show => {
            const isFav = Store.isFavorite(show.id);
            return `
                <div class="result-item ${isFav ? 'already-favorite' : ''}" data-id="${show.id}">
                    <div class="result-poster" style="background-image: url(https://image.tmdb.org/t/p/w200${show.poster_path})"></div>
                    <div class="result-info">
                        <div class="result-title">${show.name}</div>
                        <div class="result-meta">${show.first_air_date?.split('-')[0] || ''}</div>
                        ${isFav ? '<span class="fav-badge">✓ お気に入り済み</span>' : ''}
                    </div>
                    ${!isFav ? '<button class="add-fav-btn">追加</button>' : ''}
                </div>
            `;
        }).join('');

        document.querySelectorAll('.result-item').forEach(card => {
            const addBtn = card.querySelector('.add-fav-btn');
            if (addBtn && !card.classList.contains('already-favorite')) {
                addBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const show = results.find(r => r.id == card.dataset.id);
                    this.addShow(show);

                    // UIを更新
                    card.classList.add('already-favorite');
                    addBtn.remove();
                    const info = card.querySelector('.result-info');
                    info.insertAdjacentHTML('beforeend', '<span class="fav-badge">✓ 追加完了！</span>');
                });
            }

            // カードクリックでも追加できる
            if (!card.classList.contains('already-favorite')) {
                card.addEventListener('click', () => {
                    const show = results.find(r => r.id == card.dataset.id);
                    this.addShow(show);
                    this.elements.searchResultsModal.classList.add('hidden');
                });
            }
        });

        this.elements.searchResultsModal.classList.remove('hidden');
    }

    addShow(show) {
        const showData = {
            id: show.id,
            name: show.name,
            backdrop_path: show.backdrop_path || show.poster_path,
            poster_path: show.poster_path
        };

        const isNew = Store.addFavorite(showData);
        this.favorites = Store.getFavorites();

        if (isNew) {
            // 通知を送信
            Notifications.notifyFavoriteAdded(show.name);
        }

        this.renderDashboard();
    }

    hideVoiceModal() {
        this.elements.voiceModal.classList.add('hidden');
    }

    showSearchPage() {
        // Update navigation active state
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        document.getElementById('nav-search').classList.add('active');

        this.elements.main.innerHTML = `
            <div class="search-page">
                <h2>作品を探す</h2>
                <div class="search-input-container">
                    <input type="text" id="text-search-input" placeholder="ドラマやアニメの名前を入力..." class="search-input">
                    <button id="text-search-btn" class="search-button">検索</button>
                </div>
                <div class="search-hint">
                    <p>💡 マイクボタンで音声検索もできます！</p>
                </div>
            </div>
        `;

        const searchInput = document.getElementById('text-search-input');
        const searchBtn = document.getElementById('text-search-btn');

        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                this.textSearchShows(query);
            }
        };

        // Debounced search for better performance
        const debouncedSearch = debounce(() => {
            const query = searchInput.value.trim();
            if (query.length >= 2) { // Only search if 2+ characters
                this.textSearchShows(query);
            }
        }, 500);

        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
        searchInput.addEventListener('input', debouncedSearch);

        // Auto-focus input
        setTimeout(() => searchInput.focus(), 100);
    }

    async textSearchShows(query) {
        // Show loading indicator for better feedback
        const searchInput = document.getElementById('text-search-input');
        const originalPlaceholder = searchInput.placeholder;
        searchInput.placeholder = '検索中...';

        try {
            const results = await TMDB.searchSeries(query);

            if (results.length === 0) {
                // Don't show alert for debounced searches, just subtle feedback
                searchInput.placeholder = '結果がありません';
                setTimeout(() => searchInput.placeholder = originalPlaceholder, 1500);
                return;
            }

            // Show results in modal
            this.showResultsSelection(results.slice(0, 8));
        } catch (e) {
            console.error('Search error:', e);
            // Only show error alert for explicit searches (Enter/Click), not debounced
            if (searchInput.value.trim() === query) {
                alert(`検索中にエラーが発生しました: ${e.message || '不明なエラー'}`);
            }
        } finally {
            searchInput.placeholder = originalPlaceholder;
        }
    }
}

location.hash = '#dashboard';
new YasFlixApp();
