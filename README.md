# YasFlix 🎬

A beautiful Japanese drama and anime tracking application with voice search capabilities. YasFlix helps you keep track of your favorite shows and tells you where you can watch them based on your streaming subscriptions.

## ✨ Features

- **🎤 Voice Search**: Use Japanese voice commands to find and add shows instantly
- **🔍 Smart Text Search**: Traditional text-based search with debouncing for optimal performance
- **🔔 Native Notifications**: Desktop notifications for new episodes and favorites management
- **⚡ Optimized Performance**: Parallel API calls for faster dashboard loading
- **📊 Dashboard**: Beautiful card-based layout showing your favorites with latest episode info
- **🆕 New Episode Alerts**: Automatic "NEW" badges and desktop notifications for recent episodes
- **📺 Provider Tracking**: Configure your streaming services (Netflix, Disney+, etc.) to see availability
- **💾 Local Storage**: All data stored locally in your browser - no account needed
- **📤 Export/Import**: Backup and restore your favorites with JSON export/import
- **🛡️ Error Handling**: Graceful error recovery with retry options
- **🌙 Beautiful UI**: Modern glassmorphism design with smooth animations

## 🚀 Getting Started

### Recent Updates

**🎉 Version 2.1 - Notification & UX Improvements:**
- 🔔 **Native desktop notifications** for new episodes and actions
- ✨ **Better favorite management** with visual indicators and quick-add buttons
- 🎯 **Improved search UX** showing already-favorite status
- ⚡ **2x faster dashboard loading** with parallel API calls
- 🔍 **Smart search with debouncing** - no more API spam while typing
- 💾 **Backup your data** with export/import functionality
- 🛡️ **Better error handling** with graceful fallbacks
- 📱 **Improved mobile experience** with responsive design

## 🌐 Deployment

YasFlix is a static application and can be deployed to any static hosting service.

### Quick Deploy Options

#### **Netlify** (Recommended - Free)
1. Drag and drop the project folder to [Netlify Drop](https://app.netlify.com/drop)
2. Or connect your GitHub repository to Netlify
3. Done! Your site will be live in seconds.

#### **Vercel** (Recommended - Free)
1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel` in the project directory
3. Follow the prompts

#### **GitHub Pages** (Free)
1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select main branch as source
4. Your site will be available at `https://username.github.io/YasFlix/`

### Manual Deployment

1. **Prepare files**: Remove development files (`server.js`, `start.command`)
2. **Upload**: Upload all remaining files to your hosting service
3. **Configure**: Ensure your hosting serves `index.html` as the default page

### Deployment Files Included

- `netlify.toml` - Netlify configuration
- `vercel.json` - Vercel configuration
- `.gitignore` - Git ignore patterns
- `package.json` - Project metadata

### Environment Variables (Optional)

If you want to set a default API key for your deployment:

**Netlify**: Settings → Environment variables → Add `TMDB_API_KEY`

**Vercel**: Settings → Environment variables → Add `TMDB_API_KEY`

## 🚀 Getting Started

### Prerequisites

- Node.js (for the development server)
- A TMDB API key (free to get from [themoviedb.org](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone or download the project**
   ```bash
   cd /path/to/YasFlix
   ```

2. **Start the development server**
   ```bash
   node server.js
   ```
   Or on macOS with the provided script:
   ```bash
   ./start.command
   ```

3. **Open in your browser**
   - Navigate to [http://localhost:3002/](http://localhost:3002/)

4. **Configure your API key**
   - Click the settings icon (⚙️) in the top-right corner
   - Enter your TMDB API key
   - Select your streaming services
   - Click "設定を保存" (Save Settings)

## 🎯 How to Use

### Adding Shows

**Voice Search (Recommended):**
1. Tap the microphone button in the bottom navigation
2. Speak the name of a drama or anime in Japanese
3. The app will find and add it to your favorites

**Text Search:**
1. Tap the "検索" (Search) button in the bottom navigation
2. Type the name of a show
3. Select from the search results

### Managing Favorites

**View Details:**
- Tap any show card to see detailed information including:
  - Latest episode name and overview
  - Available streaming platforms
  - Season count

**Remove Shows:**
- Open show details → Tap "お気に入りから削除" (Remove from favorites)

### Backup & Restore

**Export Your Favorites:**
- Settings (⚙️) → Scroll to "データ管理" → Click "エクスポート"
- Saves a JSON file with all your favorites and settings

**Import from Backup:**
- Settings (⚙️) → Scroll to "データ管理" → Click "インポート"
- Select your previously exported JSON file
- Automatically restores all your data

### Tracking New Episodes

- Shows with episodes aired in the last 7 days display a "NEW" badge
- Dashboard shows the latest season and episode number for each show
- Status indicators show if a show is available on your subscribed services
- **Desktop notifications** when you open details of shows with new episodes

### Notifications

**Enable Notifications:**
- Settings (⚙️) → Scroll to "通知設定" → Click "通知を有効にする"
- Grant permission when prompted by your browser

**You'll receive notifications for:**
- 🔔 New episodes when opening show details
- ✅ When adding shows to favorites
- 🗑️ When removing shows from favorites

## 🛠️ Technical Details

### Architecture

- **Frontend**: Vanilla JavaScript with ES6 modules
- **Backend**: Simple Node.js HTTP server for development
- **Storage**: Browser localStorage
- **API**: TMDB (The Movie Database) API for show information

### Project Structure

```
YasFlix/
├── index.html          # Main HTML structure
├── style.css           # Beautiful glassmorphism styling
├── server.js           # Development server
├── start.command       # macOS startup script
├── src/
│   ├── main.js         # Main application logic
│   └── lib/
│       ├── store.js    # localStorage wrapper
│       └── tmdb.js     # TMDB API integration
└── README.md           # This file
```

### Key Features Implementation

**Performance Optimizations:**
- Parallel API calls using `Promise.all()` for faster dashboard loading
- Debounced search input to prevent excessive API calls
- Efficient error handling with partial data rendering
- Optimized image loading with TMDB CDN

**Voice Recognition:**
- Uses Web Speech API (SpeechRecognition)
- Japanese language support (ja-JP)
- Real-time transcription and visual feedback

**Data Management:**
- Export favorites to JSON for backup
- Import from previous backups
- Automatic error recovery and validation

**TMDB Integration:**
- Search for TV series
- Get detailed show information
- Fetch latest episode data
- Retrieve streaming provider availability for Japan

**Responsive Design:**
- Mobile-first approach
- Smooth animations and transitions
- Glassmorphism UI with beautiful gradients

## 🔧 Configuration

### TMDB API Setup

1. Visit [TMDB Settings](https://www.themoviedb.org/settings/api)
2. Sign up for a free account
3. Generate an API key
4. Copy the key into YasFlix settings

### Supported Streaming Services

- Netflix
- Disney+
- Amazon Prime Video
- Apple TV+
- Hulu
- U-NEXT

## 📱 Browser Compatibility

- ✅ Chrome/Edge (full support including voice)
- ✅ Safari (voice support may vary)
- ⚠️ Firefox (voice recognition not supported)

## 🎨 Customization

The app uses CSS variables for easy theming:

```css
:root {
    --bg-dark: #0a0510;          /* Dark background */
    --primary: #c084fc;          /* Primary purple */
    --secondary: #6366f1;        /* Secondary blue */
    --accent-red: #f43f5e;       /* Red for badges */
    --accent-green: #10b981;     /* Green for status */
}
```

## 🚀 Deployment

The app is ready for deployment! Simply:

1. **For static hosting** (GitHub Pages, Netlify, etc.):
   - Upload all files except `server.js` and `start.command`
   - No backend needed - it's a pure client-side app

2. **For production servers**:
   - Use any static file server (nginx, Apache, etc.)
   - Configure proper MIME types for ES modules (.js files)

## 📝 Notes

- All data is stored locally in your browser
- No user tracking or analytics
- TMDB API calls are made directly from the browser
- The development server (server.js) is only for local testing

## 🐛 Troubleshooting

**Voice search not working?**
- Ensure you're using Chrome or Safari
- Check microphone permissions in your browser
- Try a different browser if issues persist

**Shows not loading?**
- Verify your TMDB API key is correct
- Check your internet connection
- Open browser console (F12) for error messages

**Images not displaying?**
- TMDB image servers may be temporarily unavailable
- Some shows may not have poster/backdrop images

## 📄 License

This project uses the TMDB API but is not endorsed or certified by TMDB.

---

**Made with ❤️ for Japanese drama and anime fans!**