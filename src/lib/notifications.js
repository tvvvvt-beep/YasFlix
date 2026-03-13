// 通知機能モジュール
export const Notifications = {
    // 通知権限のリクエスト
    async requestPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    },

    // 通知を送信
    async send(title, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            return new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                ...options
            });
        }
    },

    // 新しいエピソード通知
    async notifyNewEpisode(showName, episodeInfo) {
        const title = `🎬 ${showName} - 新しいエピソード！`;
        const body = `最新話: ${episodeInfo.name || ''}\n${episodeInfo.season}シーズン${episodeInfo.episode}話`;

        await this.send(title, {
            body: body,
            tag: `new-episode-${showName}`, // 重複を防ぐためのタグ
            requireInteraction: true,
            actions: [
                {
                    action: 'view',
                    title: '詳細を見る'
                }
            ]
        });
    },

    // お気に入り追加通知
    async notifyFavoriteAdded(showName) {
        await this.send(`✅ ${showName}をお気に入りに追加`, {
            body: 'お気に入りに登録しました！',
            tag: 'favorite-added'
        });
    },

    // お気に入り削除通知
    async notifyFavoriteRemoved(showName) {
        await this.send(`🗑️ ${showName}をお気に入りから削除`, {
            body: 'お気に入りから削除しました',
            tag: 'favorite-removed'
        });
    },

    // エラー通知
    async notifyError(message) {
        await this.send('⚠️ エラー', {
            body: message,
            tag: 'error'
        });
    },

    // 通知がサポートされているかチェック
    isSupported() {
        return 'Notification' in window;
    },

    // 権限の状態を取得
    getPermission() {
        if ('Notification' in window) {
            return Notification.permission;
        }
        return 'denied';
    }
};