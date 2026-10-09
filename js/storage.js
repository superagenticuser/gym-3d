/* FORGE - IndexedDB storage layer with localStorage fallback.
   Moves large/unbounded data (photos, workout logs) to IndexedDB for 50MB+ capacity.
   Uses an in-memory cache for synchronous API compatibility.
   Small settings stay in localStorage for simplicity. */

const ForgeDB = (() => {
  const DB_NAME = "forge-db";
  const DB_VERSION = 1;
  const PHOTO_STORE = "photos";
  const LOG_STORE = "logs";

  let db = null;
  let idbAvailable = typeof indexedDB !== "undefined";
  let photoCache = null; // in-memory cache for sync access
  let logCache = null;
  let migrationDone = false;

  function open() {
    if (!idbAvailable) return Promise.resolve(null);
    if (db) return Promise.resolve(db);
    return new Promise(resolve => {
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = e => {
          const d = e.target.result;
          if (!d.objectStoreNames.contains(PHOTO_STORE)) {
            d.createObjectStore(PHOTO_STORE, { keyPath: "id", autoIncrement: true });
          }
          if (!d.objectStoreNames.contains(LOG_STORE)) {
            d.createObjectStore(LOG_STORE, { keyPath: "id", autoIncrement: true });
          }
        };
        req.onsuccess = e => {
          db = e.target.result;
          resolve(db);
        };
        req.onerror = () => {
          idbAvailable = false;
          resolve(null);
        };
        req.onblocked = () => resolve(null);
      } catch (e) {
        idbAvailable = false;
        resolve(null);
      }
    });
  }

  function getAllFromStore(store) {
    return open().then(d => {
      if (!d) return Promise.reject(new Error("IDB unavailable"));
      return new Promise((resolve, reject) => {
        try {
          const t = d.transaction(store, "readonly");
          const req = t.objectStore(store).getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  function addToStore(store, obj) {
    return open().then(d => {
      if (!d) return Promise.reject(new Error("IDB unavailable"));
      return new Promise((resolve, reject) => {
        try {
          const t = d.transaction(store, "readwrite");
          const req = t.objectStore(store).add(obj);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  function clearStore(store) {
    return open().then(d => {
      if (!d) return Promise.resolve();
      return new Promise(resolve => {
        try {
          const t = d.transaction(store, "readwrite");
          const req = t.objectStore(store).clear();
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        } catch (e) {
          resolve();
        }
      });
    });
  }

  function deleteFromStore(store, id) {
    return open().then(d => {
      if (!d) return Promise.resolve();
      return new Promise(resolve => {
        try {
          const t = d.transaction(store, "readwrite");
          const req = t.objectStore(store).delete(id);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        } catch (e) {
          resolve();
        }
      });
    });
  }

  // Migrate localStorage to IndexedDB, then hydrate caches
  async function init() {
    if (migrationDone) return;
    migrationDone = true;

    if (!idbAvailable) {
      // Fallback: use localStorage directly
      try {
        photoCache = JSON.parse(localStorage.getItem("forge-photos") || "[]");
      } catch (e) {
        photoCache = [];
      }
      try {
        logCache = JSON.parse(localStorage.getItem("forge-log") || "[]");
      } catch (e) {
        logCache = [];
      }
      return;
    }

    const d = await open();
    if (!d) {
      photoCache = [];
      logCache = [];
      return;
    }

    try {
      // Migrate photos from localStorage if present and IDB is empty
      const lsPhotos = localStorage.getItem("forge-photos");
      if (lsPhotos) {
        const arr = JSON.parse(lsPhotos);
        if (Array.isArray(arr) && arr.length > 0) {
          const existing = await getAllFromStore(PHOTO_STORE).catch(() => []);
          if (existing.length === 0) {
            for (const p of arr) {
              await addToStore(PHOTO_STORE, p).catch(() => {});
            }
            console.log(`Migrated ${arr.length} photos to IndexedDB`);
          }
          localStorage.removeItem("forge-photos");
        }
      }

      // Migrate logs from localStorage if present and IDB is empty
      const lsLogs = localStorage.getItem("forge-log");
      if (lsLogs) {
        const arr = JSON.parse(lsLogs);
        if (Array.isArray(arr) && arr.length > 0) {
          const existing = await getAllFromStore(LOG_STORE).catch(() => []);
          if (existing.length === 0) {
            for (const w of arr) {
              await addToStore(LOG_STORE, w).catch(() => {});
            }
            console.log(`Migrated ${arr.length} workout logs to IndexedDB`);
          }
          localStorage.removeItem("forge-log");
        }
      }

      // Hydrate caches from IndexedDB
      photoCache = await getAllFromStore(PHOTO_STORE).catch(() => []);
      logCache = await getAllFromStore(LOG_STORE).catch(() => []);
    } catch (e) {
      console.error("ForgeDB init failed:", e);
      photoCache = photoCache || [];
      logCache = logCache || [];
    }
  }

  // Synchronous getters (use cache)
  function getPhotos() {
    if (photoCache === null) {
      // Not initialized yet, fallback to localStorage
      try {
        return JSON.parse(localStorage.getItem("forge-photos") || "[]");
      } catch (e) {
        return [];
      }
    }
    return photoCache;
  }

  function getLogs() {
    if (logCache === null) {
      try {
        return JSON.parse(localStorage.getItem("forge-log") || "[]");
      } catch (e) {
        return [];
      }
    }
    return logCache;
  }

  // Synchronous setters (update cache + persist async)
  function savePhotos(arr) {
    photoCache = arr;
    if (!idbAvailable) {
      try {
        localStorage.setItem("forge-photos", JSON.stringify(arr));
      } catch (e) {
        console.error("Photo save failed (quota?):", e);
      }
      return;
    }
    // Clear and re-add all (simple approach for now)
    clearStore(PHOTO_STORE).then(() => {
      arr.forEach(p => addToStore(PHOTO_STORE, p).catch(() => {}));
    });
  }

  function saveLogs(arr) {
    logCache = arr;
    if (!idbAvailable) {
      try {
        localStorage.setItem("forge-log", JSON.stringify(arr));
      } catch (e) {
        console.error("Log save failed (quota?):", e);
      }
      return;
    }
    clearStore(LOG_STORE).then(() => {
      arr.forEach(w => addToStore(LOG_STORE, w).catch(() => {}));
    });
  }

  function addPhoto(photo) {
    const arr = getPhotos();
    arr.push(photo);
    savePhotos(arr);
  }

  function addLog(workout) {
    const arr = getLogs();
    arr.push(workout);
    saveLogs(arr);
  }

  function deletePhoto(index) {
    const arr = getPhotos();
    arr.splice(index, 1);
    savePhotos(arr);
  }

  // Storage usage estimate
  async function usage() {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        return {
          used: est.usage || 0,
          quota: est.quota || 0,
          percent: est.quota ? Math.round((est.usage / est.quota) * 100) : 0
        };
      }
    } catch (e) {}
    return { used: 0, quota: 0, percent: 0 };
  }

  function formatBytes(b) {
    if (b < 1024) return b + " B";
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
    return (b / (1024 * 1024)).toFixed(1) + " MB";
  }

  return {
    init,
    getPhotos,
    getLogs,
    savePhotos,
    saveLogs,
    addPhoto,
    addLog,
    deletePhoto,
    usage,
    formatBytes,
    isIndexedDB: () => idbAvailable
  };
})();

// Initialize on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => ForgeDB.init());
} else {
  ForgeDB.init();
}
