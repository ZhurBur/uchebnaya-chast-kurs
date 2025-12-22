/**
 * ПАНЕЛЬ ПРЕПОДАВАТЕЛЯ
 * Логика для отображения списка студентов по группам
 */

// Переменная для хранения текущего авторизованного преподавателя
let currentUser = null;

// Переменная для хранения выбранного студента при просмотре профиля
let selectedStudent = null;

/**
 * При загрузке страницы инициализирует БД, проверяет права преподавателя
 * и загружает список студентов
 */
document.addEventListener("DOMContentLoaded", () => {
  initDatabase();
  currentUser = checkAuth("teacher");
  if (currentUser) {
    const teacherNameElement = document.getElementById("teacherName");
    if (teacherNameElement) teacherNameElement.textContent = currentUser.name;
    loadStudentsTable();
  }
});

/**
 * Загружает и отображает таблицы студентов, разделив на две категории:
 * - со оценками по предметам преподавателя
 * - без оценок по предметам преподавателя
 */
function loadStudentsTable() {
  const users = getUsers();
  const groups = getGroups();
  const subjects = getSubjects();
  const grades = getGrades();
  const students = users.filter((u) => u.role === "student");

  // Получает предметы текущего преподавателя
  const mySubjectIds = subjects
    .filter((s) => s.teacherIds && s.teacherIds.includes(currentUser.id))
    .map((s) => s.id);

  // Разделяет студентов на две группы
  const studentsWithGrades = [];
  const studentsWithoutGrades = [];

  students.forEach((student) => {
    // Проверяет есть ли хотя бы одна оценка по предметам преподавателя
    const hasGrade = grades.some(
      (g) =>
        g.studentId === student.id && mySubjectIds.includes(g.subjectId)
    );

    if (hasGrade) {
      studentsWithGrades.push(student);
    } else {
      studentsWithoutGrades.push(student);
    }
  });

  // Отображает студентов со оценками
  const tbodyWithGrades = document.getElementById("studentsTableWithGrades");
  if (tbodyWithGrades) {
    tbodyWithGrades.innerHTML = studentsWithGrades
      .map((s) => {
        const group = groups.find((g) => g.id == s.groupId);
        return `
          <tr>
            <td><a href="#" onclick="openStudentProfile(${s.id}); return false;">${escapeHtml(s.name)}</a></td>
            <td>${escapeHtml(group ? group.name : "-")}</td>
          </tr>
        `;
      })
      .join("");
  }

  // Отображает студентов без оценок
  const tbodyWithoutGrades = document.getElementById("studentsTableWithoutGrades");
  if (tbodyWithoutGrades) {
    tbodyWithoutGrades.innerHTML = studentsWithoutGrades
      .map((s) => {
        const group = groups.find((g) => g.id == s.groupId);
        return `
          <tr>
            <td><a href="#" onclick="openStudentProfile(${s.id}); return false;">${escapeHtml(s.name)}</a></td>
            <td>${escapeHtml(group ? group.name : "-")}</td>
          </tr>
        `;
      })
      .join("");
  }
}

/**
 * Открывает профиль студента и отображает его данные
 * Показывает только предметы, на которые назначен текущий преподаватель
 * @param {number} studentId - ID студента
 */
function openStudentProfile(studentId) {
  const users = getUsers();
  const groups = getGroups();
  const subjects = getSubjects();
  const grades = getGrades();

  const student = users.find((u) => u.id === studentId && u.role === "student");
  if (!student) {
    showAlert("Студент не найден", "error");
    return;
  }

  selectedStudent = student;

  // Заполняет личную информацию
  const group = groups.find((g) => g.id == student.groupId);
  document.getElementById("profileStudentName").textContent = student.name;
  document.getElementById("profileName").textContent = student.name;
  document.getElementById("profileGroup").textContent = group ? group.name : "-";
  document.getElementById("profileLogin").textContent = student.login;

  // Фильтрует предметы - показывает только те, на которые назначен текущий преподаватель
  const mySubjects = subjects.filter(
    (s) => s.teacherIds && s.teacherIds.includes(currentUser.id)
  );

  // Заполняет предметы и оценки студента с выпадающими списками
  const profileSubjectsTable = document.getElementById("profileSubjectsTable");
  if (profileSubjectsTable) {
    profileSubjectsTable.innerHTML = mySubjects
      .map((s) => {
        const gradeRecord = grades.find(
          (g) => g.studentId === student.id && g.subjectId === s.id
        );
        const currentGrade = gradeRecord ? gradeRecord.grade : "";
        return `
          <tr>
            <td>${escapeHtml(s.name)}</td>
            <td>
              <select id="grade_${s.id}" onchange="saveGradeFromProfile(${student.id}, ${s.id})" style="padding: 0.25rem;">
                <option value="">-</option>
                <option value="5" ${currentGrade === 5 ? "selected" : ""}>5 (Отлично)</option>
                <option value="4" ${currentGrade === 4 ? "selected" : ""}>4 (Хорошо)</option>
                <option value="3" ${currentGrade === 3 ? "selected" : ""}>3 (Удовл.)</option>
                <option value="2" ${currentGrade === 2 ? "selected" : ""}>2 (Неуд.)</option>
              </select>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  // Показывает модальное окно
  showModal("studentProfileModal");
}

/**
 * Сохраняет оценку студента по предмету
 * Вызывается сразу при выборе оценки в выпадающем списке
 * @param {number} studentId - ID студента
 * @param {number} subjectId - ID предмета
 */
function saveGradeFromProfile(studentId, subjectId) {
  const gradeSelect = document.getElementById(`grade_${subjectId}`);
  if (!gradeSelect) return;

  const gradeValue = gradeSelect.value;

  // Если оценка пустая, удаляем оценку
  if (!gradeValue) {
    let grades = getGrades();
    grades = grades.filter(
      (g) => !(g.studentId === studentId && g.subjectId === subjectId)
    );
    saveGrades(grades);
    showAlert("Оценка удалена", "success");
    loadStudentsTable(); // Перезагружает список студентов
    return;
  }

  const grade = parseInt(gradeValue);

  // Валидирует оценку
  if (grade < 2 || grade > 5) {
    showAlert("Некорректная оценка", "error");
    return;
  }

  let grades = getGrades();
  const existingIndex = grades.findIndex(
    (g) => g.studentId === studentId && g.subjectId === subjectId
  );

  // Создает новую оценку или обновляет существующую
  const newGrade = {
    id:
      existingIndex >= 0 ? grades[existingIndex].id : getNextGradeId(),
    studentId: parseInt(studentId),
    subjectId: parseInt(subjectId),
    grade: grade,
    date: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    grades[existingIndex] = newGrade;
  } else {
    grades.push(newGrade);
  }

  saveGrades(grades);
  showAlert("Оценка сохранена", "success");
  loadStudentsTable(); // Перезагружает список студентов
}

/**
 * Закрывает профиль студента
 */
function closeStudentProfile() {
  selectedStudent = null;
  closeModal("studentProfileModal");
}

/**
 * Удаляет студента с подтверждением
 */
function deleteStudent() {
  if (!selectedStudent) {
    showAlert("Студент не выбран", "error");
    return;
  }

  if (!confirm(`Удалить студента ${selectedStudent.name}?`)) {
    return;
  }

  const users = getUsers();
  const filteredUsers = users.filter((u) => u.id !== selectedStudent.id);
  saveUsers(filteredUsers);

  // Удаляет все оценки студента
  const grades = getGrades();
  const filteredGrades = grades.filter((g) => g.studentId !== selectedStudent.id);
  saveGrades(filteredGrades);

  closeStudentProfile();
  loadStudentsTable();
  showAlert("Студент удален", "success");
}

/**
 * Переключает между табами студентов
 * @param {string} tabName - имя таба ('withGrades' или 'withoutGrades')
 */
function showStudentsTab(tabName) {
  // Скрывает все табы
  const tabs = document.querySelectorAll(".tab-content");
  tabs.forEach((tab) => {
    tab.style.display = "none";
  });

  // Показывает выбранный таб
  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.style.display = "block";
  }

  // Обновляет активный навигационный элемент
  const navItems = document.querySelectorAll(".dashboard-nav a");
  navItems.forEach((item) => {
    item.classList.remove("active");
  });

  const activeNavId = "nav-" + tabName;
  const activeNav = document.getElementById(activeNavId);
  if (activeNav) {
    activeNav.classList.add("active");
  }
}

/**
 * Показывает модальное окно по ID
 * @param {string} id - идентификатор модального окна
 */
function showModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add("show");
  }
}

/**
 * Скрывает модальное окно по ID
 * @param {string} id - идентификатор модального окна
 */
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove("show");
  }
}

/**
 * Экранирует HTML-символы в тексте для безопасного отображения
 * Предотвращает XSS-атаки
 * @param {string} text - текст для экранирования
 * @returns {string} экранированный текст
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
