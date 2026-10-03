// ============================================================================
// 離線 Demo 的示範資料
// 第一次開啟時（localStorage 還是空的）會自動灌入一份示範班級資料，
// 讓教師端／家長端一打開就有東西可以看，而不是空白畫面。
// 之後教師在 Demo 裡做的修改會持續存在同一瀏覽器裡，直到按下「重置示範資料」。
// 必須在 mock-firebase.js 之後、index.html / parent.html 自己的 <script> 之前載入。
// ============================================================================

(function () {
  'use strict';

  function buildSeedData() {
    var today = new Date();
    var dateStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];

    var tasks = ['數學習作 p.12-15', '國語聯絡簿', '社會學習單'];
    var taskDates = {};
    tasks.forEach(function (t) { taskDates[t] = dateStr; });

    var globalTaskData = {
      1: { '數學習作 p.12-15': 2, '國語聯絡簿': 2, '社會學習單': 0 },
      2: { '數學習作 p.12-15': 1, '國語聯絡簿': 2, '社會學習單': 2 },
      3: { '數學習作 p.12-15': 2, '國語聯絡簿': 3, '社會學習單': 0 },
      4: { '數學習作 p.12-15': 0, '國語聯絡簿': 0, '社會學習單': 0 },
      5: { '數學習作 p.12-15': 2, '國語聯絡簿': 2, '社會學習單': 2 }
    };

    var studentPasswords = { 1: '0000', 2: '0000', 3: '0000', 4: '0000', 5: '0000' };

    return {
      tasks: tasks,
      taskDates: taskDates,
      globalTaskData: globalTaskData,
      historyAtt: {},
      dailyNotes: {},
      announcements: '📣 這是離線 Demo 示範資料。\n老師可以直接點選學生格子切換作業狀態，所有變更只會存在你目前的瀏覽器裡。\n家長查詢頁可以用座號 1~5、密碼 0000 登入查看。',
      cleanTasks: ['潔牙', '掃地'],
      historyClean: {},
      grades: { '國語': { categories: [], scores: {} }, '數學': { categories: [], scores: {} } },
      studentPasswords: studentPasswords,
      examSchedule: '08:40 - 09:20 國語\n09:30 - 10:10 數學',
      studentCount: '5'
    };
  }

  function seedIfEmpty() {
    var db = window.firebase.database();
    db.ref('public_board/my_class').once('value').then(function (snap) {
      if (!snap.exists()) {
        var data = buildSeedData();
        db.ref('users/demo-teacher-offline').set(data);
        db.ref('public_board/my_class').set(data);
      }
    });
  }

  window.resetOfflineDemo = function () {
    var data = buildSeedData();
    var db = window.firebase.database();
    db.ref('users/demo-teacher-offline').set(data);
    db.ref('public_board/my_class').set(data);
    return true;
  };

  seedIfEmpty();
})();
