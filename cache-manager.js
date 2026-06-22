/**
 * cache-manager.js
 * ──────────────────────────────────────────────────────────────
 * Unified local storage manager for Tunisia Statistics.
 * Saves previewed data to allow "Recent" history and offline access.
 * ──────────────────────────────────────────────────────────────
 */

const CacheManager = {
  KEY: 'ins_stats_history',
  MAX_ITEMS: 10,

  /**
   * Saves a data snapshot to history
   */
  saveToHistory(sectionId, data, lang) {
    let history = this.getHistory();
    
    // Create new entry
    const entry = {
      id: Date.now(),
      sectionId,
      timestamp: new Date().toISOString(),
      lang,
      // We store a subset or the whole data depending on size
      data: data, 
      label: sectionId.toUpperCase()
    };

    // Remove duplicates of same section if they are very recent (e.g., within 5 mins)
    history = history.filter(h => !(h.sectionId === sectionId && (Date.now() - h.id < 300000)));

    // Insert at beginning
    history.unshift(entry);

    // Trim to MAX_ITEMS
    if (history.length > this.MAX_ITEMS) {
      history = history.slice(0, this.MAX_ITEMS);
    }

    localStorage.setItem(this.KEY, JSON.stringify(history));
    return entry;
  },

  /**
   * Retrieves full history
   */
  getHistory() {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('History load error:', e);
      return [];
    }
  },

  /**
   * Clears history
   */
  clearHistory() {
    localStorage.removeItem(this.KEY);
  }
};

window.CacheManager = CacheManager;
