import { Store } from './lib/store.js';
import { TMDB } from './lib/tmdb.js';

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
            removeShow: document.getElementById('remove-show')
        };

        this.currentDetailsId = null;
        this.init();
    }

    init() {
        this.elements.voiceTrigger.addEventListener('click', () => this.startVoiceInput());
        this.elements.closeVoice.addEventListener('click', () => this.hideVoiceModal());
        this.elements.settingsBtn.addEventListener('click', () => this.showSettings());
        this.elements.saveSettings.addEventListener('click', () => this.saveSettings());
        this.elements.closeResults.addEventListener('click', () => this.elements.searchResultsModal.classList.add('hidden'));
        this.elements.closeDetails.addEventListener('click', () => this.elements.detailsModal.classList.add('hidden'));
        this.elements.removeShow.addEventListener('click', () => this.deleteFavorite());
        
        this.renderDashboard();
    }

    async renderDashboard() {
        this.elements.main.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>最新情報を取得中...</p></div>';
        
        if (this.favorites.length === 0) {
            this.elements.main.innerHTML = `
                <div class="empty-state" style="text-align: center; padding-top: 50px; color: var(--text-muted);">
                    <p>お気に入りが登録されていません。<br>下のマイクボタンから登録してね！</p>
                </div>
            `;
            return;
        }

        let html = '<div class="card-grid">';
        const now = new Date();

        for (const show of this.favorites) {
            try {
                const details = await TMDB.getSeriesDetails(show.id);
                const latest = await TMDB.getLatestEpisode(show.id);
                const providers = TMDB.getProviders(details);
                
                const userProviders = providers.filter(p => this.settings.providers.includes(p.id));
                const statusColor = userProviders.length > 0 ? 'var(--accent-green)' : 'var(--text-muted)';
                const statusText = userProviders.length > 0 ? '視聴可能' : '配信なし';
                
                // Check if new (last 7 days)
                const airDate = new Date(latest.air_date);
                const isNew = latest.air_date && (now - airDate) < (7 * 24 * 60 * 60 * 1000);

                html += `
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
            }
        }
        html += '</div>';
        this.elements.main.innerHTML = html;

        document.querySelectorAll('.show-card').forEach(card => {
            card.addEventListener('click', () => this.showDetails(card.dataset.id));
        });
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
        
        this.elements.detailsModal.classList.remove('hidden');
    }

    deleteFavorite() {
        if (confirm('お気に入りから削除しますか？')) {
            Store.removeFavorite(parseInt(this.currentDetailsId));
            this.favorites = Store.getFavorites();
            this.elements.detailsModal.classList.add('hidden');
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

        document.querySelectorAll('.provider-item').forEach(el => {
            el.addEventListener('click', () => el.classList.toggle('selected'));
        });

        this.elements.settingsModal.classList.remove('hidden');
    }

    saveSettings() {
        const selected = Array.from(document.querySelectorAll('.provider-item.selected'))
            .map(el => parseInt(el.dataset.id));
        
        this.settings.providers = selected;
        Store.saveSettings(this.settings);
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
        this.elements.searchResultsList.innerHTML = results.map(show => `
            <div class="result-item" data-id="${show.id}">
                <div class="result-poster" style="background-image: url(https://image.tmdb.org/t/p/w200${show.poster_path})"></div>
                <div>
                    <div style="font-weight: 600;">${show.name}</div>
                    <div style="font-size: 12px; color: var(--text-muted);">${show.first_air_date?.split('-')[0] || ''}</div>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.result-item').forEach(card => {
            card.addEventListener('click', () => {
                const show = results.find(r => r.id == card.dataset.id);
                this.addShow(show);
                this.elements.searchResultsModal.classList.add('hidden');
            });
        });

        this.elements.searchResultsModal.classList.remove('hidden');
    }

    addShow(show) {
        Store.addFavorite({
            id: show.id,
            name: show.name,
            backdrop_path: show.backdrop_path
        });
        this.favorites = Store.getFavorites();
        this.renderDashboard();
    }

    hideVoiceModal() {
        this.elements.voiceModal.classList.add('hidden');
    }
}

location.hash = '#dashboard';
new YasFlixApp();
