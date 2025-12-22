/**
 * МОДУЛЬ УПРАВЛЕНИЯ ДАННЫМИ
 * Содержит инициализацию БД, функции для работы с localStorage
 * и вспомогательные функции для валидации
 */

/**
 * Массив преподавателей (статичные данные)
 * Содержит 10 преподавателей по 4 кафедрам
 */
const Teachers = [
  {
    id: 2,
    role: "teacher",
    name: "Петров П.П.",
    login: "teacher",
    password: "123",
    department: "Кафедра ИТ",
  },

  {
    id: 3,
    role: "teacher",
    name: "Сидоров С.С.",
    login: "teacher2",
    password: "123",
    department: "Кафедра ИТ",
  },
  {
    id: 5,
    role: "teacher",
    name: "Волков В.В.",
    login: "teacher4",
    password: "123",
    department: "Кафедра Экономики",
  },
  {
    id: 4,
    role: "teacher",
    name: "Козлов К.К.",
    login: "teacher3",
    password: "123",
    department: "Кафедра ИТ",
  },
  {
    id: 6,
    role: "teacher",
    name: "Соколов С.О.",
    login: "teacher5",
    password: "123",
    department: "Кафедра Экономики",
  },
  {
    id: 7,
    role: "teacher",
    name: "Морозов М.М.",
    login: "teacher6",
    password: "123",
    department: "Кафедра Экономики",
  },
  {
    id: 8,
    role: "teacher",
    name: "Павлов П.А.",
    login: "teacher7",
    password: "123",
    department: "Кафедра Гуманитарных наук",
  },
  {
    id: 9,
    role: "teacher",
    name: "Александров А.А.",
    login: "teacher8",
    password: "123",
    department: "Кафедра Гуманитарных наук",
  },
  {
    id: 10,
    role: "teacher",
    name: "Романов Р.Р.",
    login: "teacher9",
    password: "123",
    department: "Кафедра Гуманитарных наук",
  },
  {
    id: 11,
    role: "teacher",
    name: "Иванов И.И.",
    login: "teacher10",
    password: "123",
    department: "Кафедра Физкультуры",
  },
];

/**
 * Инициализирует базу данных в localStorage
 * При первом запуске создает:
 * - пользователей (администратор и демо-студент)
 * - группы студентов
 * - предметы
 * - счетчики ID для генерации новых идентификаторов
 */
function initDatabase() {
  // Инициализирует массив пользователей с админом и демо-студентом
  if (!localStorage.getItem("users")) {
    const initialUsers = [
      {
        id: 1,
        role: "admin",
        name: "Администратор",
        login: "admin",
        password: "123",
      },
      {
        id: 12,
        role: "student",
        name: "Иванов И.И.",
        login: "student",
        password: "123",
        groupId: 1,
      },
    ];
    localStorage.setItem("users", JSON.stringify(initialUsers));
  }
  
  // Инициализирует массив групп студентов
  if (!localStorage.getItem("groups")) {
    const initialGroups = [
      { id: 1, name: "ИТ-2023", subjects: [] },
      { id: 2, name: "ЭК-2023", subjects: [] },
    ];
    localStorage.setItem("groups", JSON.stringify(initialGroups));
  } else {
    // Миграция: добавляет поле subjects к существующим группам
    const groups = JSON.parse(localStorage.getItem("groups"));
    const updated = groups.map(g => ({
      ...g,
      subjects: g.subjects || []
    }));
    localStorage.setItem("groups", JSON.stringify(updated));
  }
  
  // Инициализирует массив предметов с демо-предметом
  if (!localStorage.getItem("subjects")) {
    const initialSubjects = [
      { id: 1, name: "Программирование", teacherIds: [2], hours: 72, credits: 3 },
    ];
    localStorage.setItem("subjects", JSON.stringify(initialSubjects));
  }
  
  // Инициализирует пустой массив оценок
  if (!localStorage.getItem("grades")) {
    localStorage.setItem("grades", JSON.stringify([]));
  }

  // Инициализирует счетчики для автоматического генерирования ID
  if (!localStorage.getItem("nextUserId"))
    localStorage.setItem("nextUserId", "13");
  if (!localStorage.getItem("nextGroupId"))
    localStorage.setItem("nextGroupId", "3");
  if (!localStorage.getItem("nextSubjectId"))
    localStorage.setItem("nextSubjectId", "2");

  // Инициализирует счетчик для оценок на основе существующих
  if (!localStorage.getItem("nextGradeId")) {
    const grades = JSON.parse(localStorage.getItem("grades") || "[]");
    const maxId =
      grades.length > 0 ? Math.max(...grades.map((g) => g.id || 0)) : 0;
    localStorage.setItem("nextGradeId", (maxId + 1).toString());
  }
}

/**
 * ===== ФУНКЦИИ ДЛЯ ПОЛУЧЕНИЯ ДАННЫХ (GETTERS) =====
 */

/**
 * Получает массив всех пользователей из localStorage
 * @returns {Array} массив пользователей (админ, преподаватели, студенты)
 */
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

/**
 * Получает массив всех групп студентов
 * @returns {Array} массив групп
 */
function getGroups() {
  return JSON.parse(localStorage.getItem("groups")) || [];
}

/**
 * Получает массив всех предметов
 * @returns {Array} массив предметов с информацией о преподавателях
 */
function getSubjects() {
  return JSON.parse(localStorage.getItem("subjects")) || [];
}

/**
 * Получает массив всех оценок студентов
 * @returns {Array} массив оценок с ID студента, предмета, оценкой и датой
 */
function getGrades() {
  return JSON.parse(localStorage.getItem("grades")) || [];
}

/**
 * ===== ФУНКЦИИ ДЛЯ СОХРАНЕНИЯ ДАННЫХ (SETTERS) =====
 */

/**
 * Сохраняет массив пользователей в localStorage
 * @param {Array} users - массив пользователей
 */
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

/**
 * Сохраняет массив групп в localStorage
 * @param {Array} groups - массив групп
 */
function saveGroups(groups) {
  localStorage.setItem("groups", JSON.stringify(groups));
}

/**
 * Сохраняет массив предметов в localStorage
 * @param {Array} subjects - массив предметов
 */
function saveSubjects(subjects) {
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

/**
 * Сохраняет массив оценок в localStorage
 * @param {Array} grades - массив оценок
 */
function saveGrades(grades) {
  localStorage.setItem("grades", JSON.stringify(grades));
}

/**
 * ===== ФУНКЦИИ ДЛЯ ГЕНЕРАЦИИ ID =====
 */

/**
 * Получает следующий уникальный ID для пользователя и увеличивает счетчик
 * @returns {number} новый ID пользователя
 */
function getNextUserId() {
  const id = parseInt(localStorage.getItem("nextUserId"));
  localStorage.setItem("nextUserId", (id + 1).toString());
  return id;
}

/**
 * Получает следующий уникальный ID для группы и увеличивает счетчик
 * @returns {number} новый ID группы
 */
function getNextGroupId() {
  const id = parseInt(localStorage.getItem("nextGroupId"));
  localStorage.setItem("nextGroupId", (id + 1).toString());
  return id;
}

/**
 * Получает следующий уникальный ID для предмета и увеличивает счетчик
 * @returns {number} новый ID предмета
 */
function getNextSubjectId() {
  const id = parseInt(localStorage.getItem("nextSubjectId"));
  localStorage.setItem("nextSubjectId", (id + 1).toString());
  return id;
}

/**
 * Получает следующий уникальный ID для оценки и увеличивает счетчик
 * @returns {number} новый ID оценки
 */
function getNextGradeId() {
  const id = parseInt(localStorage.getItem("nextGradeId") || "1");
  localStorage.setItem("nextGradeId", (id + 1).toString());
  return id;
}

/**
 * ===== ФУНКЦИИ ВАЛИДАЦИИ =====
 */

/**
 * Проверяет уникальность логина в системе
 * @param {string} login - логин для проверки
 * @param {number} excludeUserId - ID пользователя, который нужно исключить из проверки
 * @returns {boolean} true если логин уникален, false если уже существует
 */
function isLoginUnique(login, excludeUserId = null) {
  const users = getUsers();
  return !users.some(
    (u) =>
      u.login === login && (excludeUserId === null || u.id !== excludeUserId)
  );
}

/**
 * Проверяет возможность удаления группы
 * Группу можно удалить только если в ней нет студентов
 * @param {number} groupId - ID группы
 * @returns {boolean} true если группу можно удалить
 */
function canDeleteGroup(groupId) {
  const users = getUsers();
  return !users.some((u) => u.role === "student" && u.groupId == groupId);
}

/**
 * Проверяет возможность удаления предмета
 * Предмет можно удалить только если по нему нет оценок
 * @param {number} subjectId - ID предмета
 * @returns {boolean} true если предмет можно удалить
 */
function canDeleteSubject(subjectId) {
  const grades = getGrades();
  return !grades.some((g) => g.subjectId == subjectId);
}

/**
 * ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
 */

/**
 * Отображает алертное уведомление пользователю
 * Автоматически скрывается через 3 секунды
 * @param {string} message - текст сообщения
 * @param {string} type - тип алерта (info, success, error)
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
 * Выполняет выход пользователя из системы
 * Очищает сессию и перенаправляет на страницу входа
 */
function logout() {
  sessionStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

/**
 * Проверяет права доступа пользователя
 * Если пользователь не авторизован или не имеет нужных прав, выполняет выход
 * @param {string} requiredRole - требуемая роль (admin, teacher, student)
 * @returns {Object|null} объект текущего пользователя или null если нет доступа
 */
function checkAuth(requiredRole) {
  const userStr = sessionStorage.getItem("currentUser");
  if (!userStr) {
    window.location.href = "index.html";
    return null;
  }
  const user = JSON.parse(userStr);
  if (requiredRole && user.role !== requiredRole) {
    alert("Доступ запрещен");
    window.location.href = "index.html";
    return null;
  }
  return user;
}
