// ============================================================================
// 離線 Demo 用的「假 Firebase」
// 這個檔案模仿了 Firebase Compat SDK（firebase-app / firebase-auth / firebase-database）
// 這個專案實際會用到的那一小部分 API，讓 index.html / parent.html 完全不需要修改
// 商業邏輯，就能在沒有網路、沒有真實 Firebase 專案的情況下正常運作。
//
// 支援的 API：
//   firebase.initializeApp(config)                 -> 什麼都不做（忽略設定）
//   firebase.auth()                                 -> auth 物件
//     auth.onAuthStateChanged(cb)
//     auth.signInWithPopup(provider)
//     auth.signOut()
//   firebase.auth.GoogleAuthProvider                -> 空殼建構子
//   firebase.database()                             -> db 物件
//     db.ref(path).set(value)
//     db.ref(path).on('value', callback)
//
// 資料實際上存在瀏覽器的 localStorage，key 會加上 rtdb__ 前綴。
// 同一瀏覽器開兩個分頁（例如 index.html 教師端 + parent.html 家長端）時，
// 會透過瀏覽器原生的 `storage` 事件互相同步，模擬「即時」資料庫的效果。
// ============================================================================

(function () {
  'use strict';

  var KEY_PREFIX = 'rtdb__';
  var AUTH_KEY = KEY_PREFIX + '__auth_user';

  function storageKey(path) { return KEY_PREFIX + path; }

  function readValue(path) {
    try {
      var raw = window.localStorage.getItem(storageKey(path));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('[mock-firebase] 讀取失敗', path, e);
      return null;
    }
  }

  function writeValue(path, value) {
    try {
      window.localStorage.setItem(storageKey(path), JSON.stringify(value === undefined ? null : value));
    } catch (e) {
      console.warn('[mock-firebase] 寫入失敗（可能是瀏覽器隱私模式或容量已滿）', path, e);
    }
    notify(path);
  }

  var listeners = {}; // path -> Array<callback>

  function notify(path) {
    var subs = listeners[path];
    if (!subs || subs.length === 0) return;
    var snapshot = makeSnapshot(path);
    subs.forEach(function (cb) { cb(snapshot); });
  }

  function makeSnapshot(path) {
    var val = readValue(path);
    return { val: function () { return val; }, exists: function () { return val !== null && val !== undefined; } };
  }

  // 其他分頁（同一瀏覽器）寫入 localStorage 時，這個分頁會收到原生的 storage 事件，
  // 藉此模擬「即時資料庫」在多個裝置/分頁間同步的效果。
  window.addEventListener('storage', function (e) {
    if (!e.key || e.key.indexOf(KEY_PREFIX) !== 0) return;
    var path = e.key.slice(KEY_PREFIX.length);
    if (path === '__auth_user') return; // 登入狀態不需要跨分頁同步
    notify(path);
  });

  function ref(path) {
    return {
      set: function (value) {
        writeValue(path, value);
        return Promise.resolve();
      },
      update: function (patch) {
        var current = readValue(path) || {};
        writeValue(path, Object.assign({}, current, patch));
        return Promise.resolve();
      },
      on: function (eventType, callback) {
        if (eventType !== 'value') return;
        if (!listeners[path]) listeners[path] = [];
        listeners[path].push(callback);
        callback(makeSnapshot(path));
      },
      off: function () {
        delete listeners[path];
      },
      once: function () {
        return Promise.resolve(makeSnapshot(path));
      }
    };
  }

  // --- 假登入（Auth）---
  var DEMO_TEACHER = { uid: 'demo-teacher-offline', displayName: '示範老師', email: 'teacher@demo.local' };
  var authListeners = [];

  function getCurrentUser() {
    try {
      var raw = window.localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function setCurrentUser(user) {
    try {
      if (user) window.localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      else window.localStorage.removeItem(AUTH_KEY);
    } catch (e) { /* ignore */ }
    authListeners.forEach(function (cb) { cb(user); });
  }

  function GoogleAuthProvider() {}

  function authInstance() {
    return {
      onAuthStateChanged: function (cb) {
        authListeners.push(cb);
        cb(getCurrentUser());
        return function () { authListeners = authListeners.filter(function (l) { return l !== cb; }); };
      },
      signInWithPopup: function () {
        return new Promise(function (resolve) {
          setTimeout(function () {
            setCurrentUser(DEMO_TEACHER);
            resolve({ user: DEMO_TEACHER });
          }, 250);
        });
      },
      signOut: function () {
        setCurrentUser(null);
        return Promise.resolve();
      }
    };
  }
  authInstance.GoogleAuthProvider = GoogleAuthProvider;

  window.firebase = {
    initializeApp: function () { /* 離線 Demo：不連線任何伺服器 */ },
    auth: authInstance,
    database: function () { return { ref: ref }; }
  };
})();
