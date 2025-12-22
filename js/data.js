// JavaScript source code
/**
 * ÌÎÄÓËÜ ÓÏÐÀÂËÅÍÈß ÄÀÍÍÛÌÈ
 * Ñîäåðæèò èíèöèàëèçàöèþ ÁÄ, ôóíêöèè äëÿ ðàáîòû ñ localStorage
 * è âñïîìîãàòåëüíûå ôóíêöèè äëÿ âàëèäàöèè
 */

/**
 * Ìàññèâ ïðåïîäàâàòåëåé (ñòàòè÷íûå äàííûå)
 * Ñîäåðæèò 10 ïðåïîäàâàòåëåé ïî 4 êàôåäðàì
 */
const Teachers = [
  {
    id: 2,
    role: "teacher",
    name: "Иванова И.И.",
    login: "teacher",
    password: "123",
    department: "Êàôåäðà ÈÒ",
  },
  {
    id: 3,
    role: "teacher",
    name: "Ñèäîðîâ Ñ.Ñ.",
    login: "teacher2",
    password: "123",
    department: "Êàôåäðà ÈÒ",
  },
  {
    id: 5,
    role: "teacher",
    name: "Âîëêîâ Â.Â.",
    login: "teacher4",
    password: "123",
    department: "Êàôåäðà Ýêîíîìèêè",
  },
  {
    id: 4,
    role: "teacher",
    name: "Êîçëîâ Ê.Ê.",
    login: "teacher3",
    password: "123",
    department: "Êàôåäðà ÈÒ",
  },
  {
    id: 6,
    role: "teacher",
    name: "Ñîêîëîâ Ñ.Î.",
    login: "teacher5",
    password: "123",
    department: "Êàôåäðà Ýêîíîìèêè",
  },
  {
    id: 7,
    role: "teacher",
    name: "Ìîðîçîâ Ì.Ì.",
    login: "teacher6",
    password: "123",
    department: "Êàôåäðà Ýêîíîìèêè",
  },
  {
    id: 8,
    role: "teacher",
    name: "Ïàâëîâ Ï.À.",
    login: "teacher7",
    password: "123",
    department: "Êàôåäðà Ãóìàíèòàðíûõ íàóê",
  },
  {
    id: 9,
    role: "teacher",
    name: "Àëåêñàíäðîâ À.À.",
    login: "teacher8",
    password: "123",
    department: "Êàôåäðà Ãóìàíèòàðíûõ íàóê",
  },
  {
    id: 10,
    role: "teacher",
    name: "Ðîìàíîâ Ð.Ð.",
    login: "teacher9",
    password: "123",
    department: "Êàôåäðà Ãóìàíèòàðíûõ íàóê",
  },
  {
    id: 11,
    role: "teacher",
    name: "Èâàíîâ È.È.",
    login: "teacher10",
    password: "123",
    department: "Êàôåäðà Ôèçêóëüòóðû",
  },
];

/**
 * Èíèöèàëèçèðóåò áàçó äàííûõ â localStorage
 * Ïðè ïåðâîì çàïóñêå ñîçäàåò:
 * - ïîëüçîâàòåëåé (àäìèíèñòðàòîð è äåìî-ñòóäåíò)
 * - ãðóïïû ñòóäåíòîâ
 * - ïðåäìåòû
 * - ñ÷åò÷èêè ID äëÿ ãåíåðàöèè íîâûõ èäåíòèôèêàòîðîâ
 */
function initDatabase() {
  // Èíèöèàëèçèðóåò ìàññèâ ïîëüçîâàòåëåé ñ àäìèíîì è äåìî-ñòóäåíòîì
  if (!localStorage.getItem("users")) {
    const initialUsers = [
      {
        id: 1,
        role: "admin",
        name: "Àäìèíèñòðàòîð",
        login: "admin",
        password: "123",
      },
      {
        id: 12,
        role: "student",
        name: "Èâàíîâ È.È.",
        login: "student",
        password: "123",
        groupId: 1,
      },
    ];
    localStorage.setItem("users", JSON.stringify(initialUsers));
  }
  
  // Èíèöèàëèçèðóåò ìàññèâ ãðóïï ñòóäåíòîâ
  if (!localStorage.getItem("groups")) {
    const initialGroups = [
      { id: 1, name: "ÈÒ-2023", subjects: [] },
      { id: 2, name: "ÝÊ-2023", subjects: [] },
    ];
    localStorage.setItem("groups", JSON.stringify(initialGroups));
  } else {
    // Ìèãðàöèÿ: äîáàâëÿåò ïîëå subjects ê ñóùåñòâóþùèì ãðóïïàì
    const groups = JSON.parse(localStorage.getItem("groups"));
    const updated = groups.map(g => ({
      ...g,
      subjects: g.subjects || []
    }));
    localStorage.setItem("groups", JSON.stringify(updated));
  }
  
  // Èíèöèàëèçèðóåò ìàññèâ ïðåäìåòîâ ñ äåìî-ïðåäìåòîì
  if (!localStorage.getItem("subjects")) {
    const initialSubjects = [
      { id: 1, name: "Ïðîãðàììèðîâàíèå", teacherIds: [2], hours: 72, credits: 3 },
    ];
    localStorage.setItem("subjects", JSON.stringify(initialSubjects));
  }
  
  // Èíèöèàëèçèðóåò ïóñòîé ìàññèâ îöåíîê
  if (!localStorage.getItem("grades")) {
    localStorage.setItem("grades", JSON.stringify([]));
  }

  // Èíèöèàëèçèðóåò ñ÷åò÷èêè äëÿ àâòîìàòè÷åñêîãî ãåíåðèðîâàíèÿ ID
  if (!localStorage.getItem("nextUserId"))
    localStorage.setItem("nextUserId", "13");
  if (!localStorage.getItem("nextGroupId"))
    localStorage.setItem("nextGroupId", "3");
  if (!localStorage.getItem("nextSubjectId"))
    localStorage.setItem("nextSubjectId", "2");

  // Èíèöèàëèçèðóåò ñ÷åò÷èê äëÿ îöåíîê íà îñíîâå ñóùåñòâóþùèõ
  if (!localStorage.getItem("nextGradeId")) {
    const grades = JSON.parse(localStorage.getItem("grades") || "[]");
    const maxId =
      grades.length > 0 ? Math.max(...grades.map((g) => g.id || 0)) : 0;
    localStorage.setItem("nextGradeId", (maxId + 1).toString());
  }
}

/**
 * ===== ÔÓÍÊÖÈÈ ÄËß ÏÎËÓ×ÅÍÈß ÄÀÍÍÛÕ (GETTERS) =====
 */

/**
 * Ïîëó÷àåò ìàññèâ âñåõ ïîëüçîâàòåëåé èç localStorage
 * @returns {Array} ìàññèâ ïîëüçîâàòåëåé (àäìèí, ïðåïîäàâàòåëè, ñòóäåíòû)
 */
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

/**
 * Ïîëó÷àåò ìàññèâ âñåõ ãðóïï ñòóäåíòîâ
 * @returns {Array} ìàññèâ ãðóïï
 */
function getGroups() {
  return JSON.parse(localStorage.getItem("groups")) || [];
}

/**
 * Ïîëó÷àåò ìàññèâ âñåõ ïðåäìåòîâ
 * @returns {Array} ìàññèâ ïðåäìåòîâ ñ èíôîðìàöèåé î ïðåïîäàâàòåëÿõ
 */
function getSubjects() {
  return JSON.parse(localStorage.getItem("subjects")) || [];
}

/**
 * Ïîëó÷àåò ìàññèâ âñåõ îöåíîê ñòóäåíòîâ
 * @returns {Array} ìàññèâ îöåíîê ñ ID ñòóäåíòà, ïðåäìåòà, îöåíêîé è äàòîé
 */
function getGrades() {
  return JSON.parse(localStorage.getItem("grades")) || [];
}

/**
 * ===== ÔÓÍÊÖÈÈ ÄËß ÑÎÕÐÀÍÅÍÈß ÄÀÍÍÛÕ (SETTERS) =====
 */

/**
 * Ñîõðàíÿåò ìàññèâ ïîëüçîâàòåëåé â localStorage
 * @param {Array} users - ìàññèâ ïîëüçîâàòåëåé
 */
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

/**
 * Ñîõðàíÿåò ìàññèâ ãðóïï â localStorage
 * @param {Array} groups - ìàññèâ ãðóïï
 */
function saveGroups(groups) {
  localStorage.setItem("groups", JSON.stringify(groups));
}

/**
 * Ñîõðàíÿåò ìàññèâ ïðåäìåòîâ â localStorage
 * @param {Array} subjects - ìàññèâ ïðåäìåòîâ
 */
function saveSubjects(subjects) {
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

/**
 * Ñîõðàíÿåò ìàññèâ îöåíîê â localStorage
 * @param {Array} grades - ìàññèâ îöåíîê
 */
function saveGrades(grades) {
  localStorage.setItem("grades", JSON.stringify(grades));
}

/**
 * ===== ÔÓÍÊÖÈÈ ÄËß ÃÅÍÅÐÀÖÈÈ ID =====
 */

/**
 * Ïîëó÷àåò ñëåäóþùèé óíèêàëüíûé ID äëÿ ïîëüçîâàòåëÿ è óâåëè÷èâàåò ñ÷åò÷èê
 * @returns {number} íîâûé ID ïîëüçîâàòåëÿ
 */
function getNextUserId() {
  const id = parseInt(localStorage.getItem("nextUserId"));
  localStorage.setItem("nextUserId", (id + 1).toString());
  return id;
}

/**
 * Ïîëó÷àåò ñëåäóþùèé óíèêàëüíûé ID äëÿ ãðóïïû è óâåëè÷èâàåò ñ÷åò÷èê
 * @returns {number} íîâûé ID ãðóïïû
 */
function getNextGroupId() {
  const id = parseInt(localStorage.getItem("nextGroupId"));
  localStorage.setItem("nextGroupId", (id + 1).toString());
  return id;
}

/**
 * Ïîëó÷àåò ñëåäóþùèé óíèêàëüíûé ID äëÿ ïðåäìåòà è óâåëè÷èâàåò ñ÷åò÷èê
 * @returns {number} íîâûé ID ïðåäìåòà
 */
function getNextSubjectId() {
  const id = parseInt(localStorage.getItem("nextSubjectId"));
  localStorage.setItem("nextSubjectId", (id + 1).toString());
  return id;
}

/**
 * Ïîëó÷àåò ñëåäóþùèé óíèêàëüíûé ID äëÿ îöåíêè è óâåëè÷èâàåò ñ÷åò÷èê
 * @returns {number} íîâûé ID îöåíêè
 */
function getNextGradeId() {
  const id = parseInt(localStorage.getItem("nextGradeId") || "1");
  localStorage.setItem("nextGradeId", (id + 1).toString());
  return id;
}

/**
 * ===== ÔÓÍÊÖÈÈ ÂÀËÈÄÀÖÈÈ =====
 */

/**
 * Ïðîâåðÿåò óíèêàëüíîñòü ëîãèíà â ñèñòåìå
 * @param {string} login - ëîãèí äëÿ ïðîâåðêè
 * @param {number} excludeUserId - ID ïîëüçîâàòåëÿ, êîòîðûé íóæíî èñêëþ÷èòü èç ïðîâåðêè
 * @returns {boolean} true åñëè ëîãèí óíèêàëåí, false åñëè óæå ñóùåñòâóåò
 */
function isLoginUnique(login, excludeUserId = null) {
  const users = getUsers();
  return !users.some(
    (u) =>
      u.login === login && (excludeUserId === null || u.id !== excludeUserId)
  );
}

/**
 * Ïðîâåðÿåò âîçìîæíîñòü óäàëåíèÿ ãðóïïû
 * Ãðóïïó ìîæíî óäàëèòü òîëüêî åñëè â íåé íåò ñòóäåíòîâ
 * @param {number} groupId - ID ãðóïïû
 * @returns {boolean} true åñëè ãðóïïó ìîæíî óäàëèòü
 */
function canDeleteGroup(groupId) {
  const users = getUsers();
  return !users.some((u) => u.role === "student" && u.groupId == groupId);
}

/**
 * Ïðîâåðÿåò âîçìîæíîñòü óäàëåíèÿ ïðåäìåòà
 * Ïðåäìåò ìîæíî óäàëèòü òîëüêî åñëè ïî íåìó íåò îöåíîê
 * @param {number} subjectId - ID ïðåäìåòà
 * @returns {boolean} true åñëè ïðåäìåò ìîæíî óäàëèòü
 */
function canDeleteSubject(subjectId) {
  const grades = getGrades();
  return !grades.some((g) => g.subjectId == subjectId);
}

/**
 * ===== ÂÑÏÎÌÎÃÀÒÅËÜÍÛÅ ÔÓÍÊÖÈÈ =====
 */

/**
 * Îòîáðàæàåò àëåðòíîå óâåäîìëåíèå ïîëüçîâàòåëþ
 * Àâòîìàòè÷åñêè ñêðûâàåòñÿ ÷åðåç 3 ñåêóíäû
 * @param {string} message - òåêñò ñîîáùåíèÿ
 * @param {string} type - òèï àëåðòà (info, success, error)
 */
function showAlert(message, type = "info") {
  const container = document.getElementById("alertContainer");
  if (!container) return;

  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  container.appendChild(alert);

  setTimeout(() => alert.remove(), 3000);
}

/**
 * Âûïîëíÿåò âûõîä ïîëüçîâàòåëÿ èç ñèñòåìû
 * Î÷èùàåò ñåññèþ è ïåðåíàïðàâëÿåò íà ñòðàíèöó âõîäà
 */
function logout() {
  sessionStorage.removeItem("currentUser");
  window.location.href = "auth.html"; // Èñïðàâëåíî: áûëî index.html
}

/**
 * Ïðîâåðÿåò ïðàâà äîñòóïà ïîëüçîâàòåëÿ
 * Åñëè ïîëüçîâàòåëü íå àâòîðèçîâàí èëè íå èìååò íóæíûõ ïðàâ, âûïîëíÿåò âûõîä
 * @param {string} requiredRole - òðåáóåìàÿ ðîëü (admin, teacher, student)
 * @returns {Object|null} îáúåêò òåêóùåãî ïîëüçîâàòåëÿ èëè null åñëè íåò äîñòóïà
 */
function checkAuth(requiredRole) {
  const userStr = sessionStorage.getItem("currentUser");
  if (!userStr) {
    window.location.href = "auth.html"; // Èñïðàâëåíî: áûëî index.html
    return null;
  }
  const user = JSON.parse(userStr);
  if (requiredRole && user.role !== requiredRole) {
    alert("Äîñòóï çàïðåùåí");
    window.location.href = "auth.html"; // Èñïðàâëåíî: áûëî index.html
    return null;
  }
  return user;

}
