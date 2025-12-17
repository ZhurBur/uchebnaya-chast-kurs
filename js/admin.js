/**
 * АДМИНИСТРАТОРСКАЯ ПАНЕЛЬ
 * Логика для управления учебным учреждением
 */

// При загрузке страницы инициализирует БД, проверяет права администратора и загружает все данные
document.addEventListener("DOMContentLoaded", () => {
  initDatabase();
  const user = checkAuth("admin");
  if (!user) {
    // checkAuth уже перенаправил пользователя, просто выходим
    return;
  }
  loadAll();
});

/**
 * Загружает и отображает все данные на панели администратора:
 * группы, студентов, преподавателей и предметы
 */
function loadAll() {
  renderGroups();
  renderStudents();
  renderTeachers();
  renderSubjects();
}

/**
 * Управляет видимостью вкладок - скрывает все табы
 * @param {string} tabName - имя вкладки для отображения
 */
function manageTabs(tabName) {
  // Скрывает все элементы с классом tab-content
  document
    .querySelectorAll(".tab-content")
    .forEach((t) => (t.style.display = "none"));
  // Показывает нужную вкладку по ID
  const targetTab = document.getElementById(tabName);
  if (targetTab) targetTab.style.display = "block";
}

/**
 * Переключает между вкладками и обновляет активную ссылку навигации
 * @param {string} tabName - имя вкладки для переключения
 */
function showTab(tabName) {
  manageTabs(tabName);
  // Обновляет активную ссылку в навигации
  document
    .querySelectorAll(".dashboard-nav a")
    .forEach((a) => a.classList.remove("active"));
  const navId = "nav-" + tabName;
  const navLink = document.getElementById(navId);
  if (navLink) navLink.classList.add("active");
}

/**
 * Отображает модальное окно по его ID
 * @param {string} id - идентификатор модального окна
 */
function showModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add("show");
  }
}

/**
 * Скрывает модальное окно по его ID
 * @param {string} id - идентификатор модального окна
 */
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove("show");
  }
}

/**
 * ===== УПРАВЛЕНИЕ ГРУППАМИ =====
 */

/**
 * Отображает список всех групп в таблице
 * Позволяет администратору удалять группы
 */
function renderGroups() {
  const groups = getGroups();
  const tbody = document.getElementById("groupsTable");
  if (!tbody) return;

  tbody.innerHTML = groups
    .map(
      (g) => `
        <tr>
            <td>${g.id}</td>
            <td><a href="#" onclick="openGroupProfile(${g.id}); return false;" style="cursor: pointer; color: #007bff; text-decoration: underline;">${escapeHtml(g.name)}</a></td>
            <td>${(g.subjects && g.subjects.length) || 0}</td>
            <td><button class="btn btn-danger btn-sm" onclick="adminDeleteGroup(${
              g.id
            })">Удалить</button></td>
        </tr>
    `
    )
    .join("");
}

/**
 * Обрабатывает добавление новой группы
 * Проверяет уникальность названия и сохраняет в БД
 * @param {Event} e - событие отправки формы
 */
function handleAddGroup(e) {
  e.preventDefault();
  const name = document.getElementById("newGroupName").value.trim();

  if (!name) {
    showAlert("Введите название группы", "error");
    return;
  }

  const groups = getGroups();

  // Проверяет, не существует ли уже группа с таким названием
  if (groups.some((g) => g.name.toLowerCase() === name.toLowerCase())) {
    showAlert("Группа с таким названием уже существует", "error");
    return;
  }

  groups.push({ id: getNextGroupId(), name, subjects: [] });
  saveGroups(groups);
  document.getElementById("newGroupName").value = "";
  closeModal("addGroupModal");
  renderGroups();
  showAlert("Группа добавлена", "success");
}

/**
 * Удаляет группу по ID с подтверждением
 * Проверяет, что в группе нет студентов перед удалением
 * @param {number} id - идентификатор группы
 */
window.adminDeleteGroup = function (id) {
  if (!confirm("Удалить группу?")) return;

  if (!canDeleteGroup(id)) {
    showAlert("Нельзя удалить группу: в ней есть студенты", "error");
    return;
  }

  let groups = getGroups();
  groups = groups.filter((g) => g.id !== id);
  saveGroups(groups);
  renderGroups();
  showAlert("Группа удалена", "success");
};

/**
 * Открывает профиль группы и отображает все её данные
 * Показывает таблицу всех предметов с чекбоксами для назначения
 * @param {number} groupId - ID группы
 */
window.openGroupProfile = function(groupId) {
    const groups = getGroups();
    const group = groups.find(g => g.id === groupId);
    if (!group) {
        showAlert('Группа не найдена', 'error');
        return;
    }

    const subjects = getSubjects();

    // Заполняет информацию о группе
    document.getElementById('profileGroupName').textContent = `Профиль группы: ${escapeHtml(group.name)}`;

    // Заполняет таблицу предметов с чекбоксами
    const tbody = document.getElementById('profileGroupSubjectsTable');
    if (tbody) {
        tbody.innerHTML = subjects
            .map(s => {
                const isAssigned = (group.subjects && group.subjects.includes(s.id)) || false;
                return `
                    <tr>
                        <td>${escapeHtml(s.name)}</td>
                        <td>
                            <input 
                                type="checkbox" 
                                ${isAssigned ? 'checked' : ''} 
                                onchange="updateGroupSubject(${groupId}, ${s.id}, this.checked)"
                                style="width: 18px; height: 18px; cursor: pointer;">
                        </td>
                    </tr>
                `;
            })
            .join('');
    }

    // Показывает модальное окно
    showModal('groupProfileModal');
};

/**
 * Закрывает профиль группы
 */
window.closeGroupProfile = function() {
    closeModal('groupProfileModal');
};

/**
 * Обновляет назначение предмета группе
 * При отмечении чекбокса - назначает предмет, при снятии - удаляет назначение
 * @param {number} groupId - ID группы
 * @param {number} subjectId - ID предмета
 * @param {boolean} isChecked - отмечен ли чекбокс
 */
window.updateGroupSubject = function(groupId, subjectId, isChecked) {
    const groups = getGroups();
    const group = groups.find(g => g.id === groupId);
    
    if (!group) {
        showAlert('Группа не найдена', 'error');
        return;
    }

    // Инициализирует массив если нет
    if (!group.subjects) {
        group.subjects = [];
    }

    if (isChecked) {
        // Добавляем предмет если его еще нет в массиве
        if (!group.subjects.includes(subjectId)) {
            group.subjects.push(subjectId);
            showAlert('Предмет назначен группе', 'success');
        }
    } else {
        // Удаляем предмет из массива
        group.subjects = group.subjects.filter(id => id !== subjectId);
        showAlert('Предмет удален из назначения группе', 'success');
    }

    saveGroups(groups);
    renderGroups();
};

/**
 * ===== УПРАВЛЕНИЕ СТУДЕНТАМИ =====
 */

/**
 * Открывает модальное окно для добавления студента
 * Заполняет список доступных групп
 */
function showAddStudentModal() {
  const groups = getGroups();
  const select = document.getElementById("newStudentGroup");
  if (!select) return;

  if (groups.length === 0) {
    showAlert("Сначала создайте группу", "error");
    return;
  }

  select.innerHTML = groups
    .map((g) => `<option value="${g.id}">${escapeHtml(g.name)}</option>`)
    .join("");
  showModal("addStudentModal");
}

/**
 * Отображает список всех студентов с их группами
 * Показывает полную информацию о каждом студенте
 */
function renderStudents() {
  const users = getUsers();
  const groups = getGroups();
  const students = users.filter((u) => u.role === "student");
  const tbody = document.getElementById("studentsTable");
  if (!tbody) return;

  tbody.innerHTML = students
    .map((s) => {
      const groupOptions = groups
        .map((g) => `<option value="${g.id}" ${s.groupId == g.id ? "selected" : ""}>${escapeHtml(g.name)}</option>`)
        .join("");
      
      return `
            <tr>
                <td>${s.id}</td>
                <td>${escapeHtml(s.name)}</td>
                <td>
                  <select onchange="changeStudentGroup(${s.id}, this.value)" style="padding: 4px; border-radius: 4px; border: 1px solid #ddd;">
                    <option value="">-</option>
                    ${groupOptions}
                  </select>
                </td>
                <td>${escapeHtml(s.login)}</td>
                <td><button class="btn btn-danger btn-sm" onclick="adminDeleteUser(${
                  s.id
                })">Удалить</button></td>
            </tr>
        `;
    })
    .join("");
}

/**
 * Обрабатывает добавление нового студента
 * Валидирует все поля, проверяет уникальность логина и наличие группы
 * @param {Event} e - событие отправки формы
 */
function handleAddStudent(e) {
  e.preventDefault();
  const name = document.getElementById("newStudentName").value.trim();
  const groupId = parseInt(document.getElementById("newStudentGroup").value);
  const login = document.getElementById("newStudentLogin").value.trim();
  const password = document.getElementById("newStudentPassword").value.trim();

  if (!name || !groupId || !login || !password) {
    showAlert("Заполните все поля", "error");
    return;
  }

  // Проверяет уникальность логина
  if (!isLoginUnique(login)) {
    showAlert("Логин уже используется", "error");
    return;
  }

  // Проверяет существование выбранной группы
  const groups = getGroups();
  if (!groups.some((g) => g.id === groupId)) {
    showAlert("Выбранная группа не существует", "error");
    return;
  }

  const users = getUsers();
  users.push({
    id: getNextUserId(),
    role: "student",
    name,
    groupId,
    login,
    password,
  });
  saveUsers(users);

  // Очищает форму
  document.getElementById("newStudentName").value = "";
  document.getElementById("newStudentGroup").value = "";
  document.getElementById("newStudentLogin").value = "";
  document.getElementById("newStudentPassword").value = "123";

  closeModal("addStudentModal");
  renderStudents();
  showAlert("Студент добавлен", "success");
}

/**
 * Изменяет группу студента
 * @param {number} studentId - ID студента
 * @param {number|string} newGroupId - ID новой группы (или пустая строка)
 */
window.changeStudentGroup = function(studentId, newGroupId) {
  const users = getUsers();
  const student = users.find(u => u.id === studentId);
  
  if (!student) {
    showAlert('Студент не найден', 'error');
    return;
  }

  const groupId = newGroupId ? parseInt(newGroupId) : null;
  
  // Если группа выбрана, проверяем её существование
  if (groupId) {
    const groups = getGroups();
    if (!groups.some(g => g.id === groupId)) {
      showAlert('Выбранная группа не существует', 'error');
      renderStudents();
      return;
    }
  }

  student.groupId = groupId || null;
  saveUsers(users);
  renderStudents();
  showAlert('Группа студента изменена', 'success');
};

/**
 * ===== УПРАВЛЕНИЕ ПРЕПОДАВАТЕЛЯМИ =====
 */

/**
 * Отображает список статичных преподавателей
 * Преподаватели хранятся в отдельном массиве Teachers (не редактируются из панели)
 * Имена преподавателей кликабельны и ведут на профиль
 */
function renderTeachers() {
  const tbody = document.getElementById("teachersTable");
  if (!tbody || !Teachers) return;

  tbody.innerHTML = Teachers.map(
    (t) => `
        <tr>
            <td>${t.id}</td>
            <td><a href="#" onclick="openTeacherProfile(${
              t.id
            }); return false;">${escapeHtml(t.name)}</a></td>
            <td>${escapeHtml(t.department || "-")}</td>
            <td>${escapeHtml(t.login)}</td>
        </tr>
    `
  ).join("");
}

/**
 * Открывает профиль преподавателя и отображает все его данные
 * Показывает таблицу всех предметов с чекбоксами для назначения
 * @param {number} teacherId - ID преподавателя
 */
window.openTeacherProfile = function(teacherId) {
  const teacher = Teachers.find((t) => t.id === teacherId);
  if (!teacher) {
    showAlert("Преподаватель не найден", "error");
    return;
  }

  const subjects = getSubjects();

  // Заполняет личную информацию преподавателя
  document.getElementById("profileTeacherName").textContent = teacher.name;
  document.getElementById("profileTeacherFullName").textContent = teacher.name;
  document.getElementById("profileTeacherDept").textContent =
    teacher.department || "-";
  document.getElementById("profileTeacherLogin").textContent = teacher.login;

  // Заполняет таблицу предметов с чекбоксами
  const profileTeacherSubjectsTable = document.getElementById(
    "profileTeacherSubjectsTable"
  );
  if (profileTeacherSubjectsTable) {
    profileTeacherSubjectsTable.innerHTML = subjects
      .map((s) => {
        const isAssigned =
          (s.teacherIds && s.teacherIds.includes(teacher.id)) || false;
        return `
                    <tr>
                        <td>${escapeHtml(s.name)}</td>
                        <td>
                            <input 
                                type="checkbox" 
                                ${isAssigned ? "checked" : ""} 
                                onchange="updateTeacherSubject(${teacher.id}, ${
          s.id
        }, this.checked)"
                                style="width: 18px; height: 18px; cursor: pointer;">
                        </td>
                    </tr>
                `;
      })
      .join("");
  }

  // Показывает модальное окно
  showModal("teacherProfileModal");
};

/**
 * Закрывает профиль преподавателя
 */
window.closeTeacherProfile = function() {
  closeModal("teacherProfileModal");
};

/**
 * Обновляет назначение предмета преподавателю
 * При отмечении чекбокса - назначает предмет, при снятии - удаляет назначение
 * @param {number} teacherId - ID преподавателя
 * @param {number} subjectId - ID предмета
 * @param {boolean} isChecked - отмечен ли чекбокс
 */
window.updateTeacherSubject = function(teacherId, subjectId, isChecked) {
  const subjects = getSubjects();
  const subject = subjects.find((s) => s.id === subjectId);

  if (!subject) {
    showAlert("Предмет не найден", "error");
    return;
  }

  // Инициализирует массив если нет
  if (!subject.teacherIds) {
    subject.teacherIds = [];
  }

  if (isChecked) {
    // Добавляем преподавателя если его еще нет в массиве
    if (!subject.teacherIds.includes(teacherId)) {
      subject.teacherIds.push(teacherId);
      showAlert("Предмет назначен", "success");
    }
  } else {
    // Удаляем преподавателя из массива
    subject.teacherIds = subject.teacherIds.filter((id) => id !== teacherId);
    showAlert("Предмет удален из назначения", "success");
  }

  saveSubjects(subjects);
  renderSubjects(); // Обновляем таблицу предметов на главной странице
};

/**
 * ===== УПРАВЛЕНИЕ ПРЕДМЕТАМИ =====
 */

/**
 * Открывает модальное окно для добавления предмета
 * Заполняет список преподавателей, которым назначены предметы
 */
/**
 * Открывает модальное окно для добавления предмета
 */
function showAddSubjectModal() {
  showModal("addSubjectModal");
}

/**
 * Отображает список всех предметов с преподавателями, часами и кредитами
 * Позволяет удалять предметы, если по ним нет оценок
 */
function renderSubjects() {
  const subjects = getSubjects();
  const tbody = document.getElementById("subjectsTable");
  if (!tbody) return;

  tbody.innerHTML = subjects
    .map((s) => {
      return `
            <tr>
                <td>${s.id}</td>
                <td><a href="#" onclick="openSubjectProfile(${
                  s.id
                }); return false;" style="cursor: pointer; color: #007bff; text-decoration: underline;">${escapeHtml(
        s.name
      )}</a></td>
                <td>${parseInt(s.hours) || 0}ч / ${
        parseInt(s.credits) || 0
      }кр</td>
                <td><button class="btn btn-danger btn-sm" onclick="adminDeleteSubject(${
                  s.id
                })">Удалить</button></td>
            </tr>
        `;
    })
    .join("");
}

/**
 * Обрабатывает добавление нового предмета
 * Валидирует все поля, проверяет существование преподавателя
 * @param {Event} e - событие отправки формы
 */
function handleAddSubject(e) {
  e.preventDefault();
  const name = document.getElementById("newSubjectName").value.trim();
  const hoursInput = document.getElementById("newSubjectHours").value.trim();
  const creditsInput = document
    .getElementById("newSubjectCredits")
    .value.trim();
  const hours = parseInt(hoursInput);
  const credits = parseInt(creditsInput);

  if (!name || !hoursInput || !creditsInput || isNaN(hours) || isNaN(credits)) {
    showAlert("Заполните все поля корректно", "error");
    return;
  }

  if (hours <= 0 || credits <= 0) {
    showAlert("Часы и кредиты должны быть положительными числами", "error");
    return;
  }

  const subjects = getSubjects();
  subjects.push({
    id: getNextSubjectId(),
    name,
    teacherIds: [],
    hours,
    credits,
  });
  saveSubjects(subjects);

  // Очищает форму
  document.getElementById("newSubjectName").value = "";
  document.getElementById("newSubjectHours").value = "";
  document.getElementById("newSubjectCredits").value = "";

  closeModal("addSubjectModal");
  renderSubjects();
  showAlert("Предмет добавлен", "success");
}

/**
 * Удаляет предмет по ID с подтверждением
 * Проверяет, что по предмету нет оценок перед удалением
 * @param {number} id - идентификатор предмета
 */
window.adminDeleteSubject = function (id) {
  if (!confirm("Удалить предмет?")) return;

  if (!canDeleteSubject(id)) {
    showAlert("Нельзя удалить предмет: по нему есть оценки", "error");
    return;
  }

  let subjects = getSubjects();
  subjects = subjects.filter((s) => s.id !== id);
  saveSubjects(subjects);
  renderSubjects();
  showAlert("Предмет удален", "success");
};

/**
 * ===== УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЕЙ =====
 */

/**
 * Удаляет студента по ID (администратор может удалять только студентов)
 * Удаляет все оценки студента перед удалением самого студента
 * @param {number} id - идентификатор пользователя
 */
window.adminDeleteUser = function (id) {
  if (!confirm("Удалить пользователя?")) return;

  const users = getUsers();
  const user = users.find((u) => u.id === id);

  if (!user) {
    showAlert("Пользователь не найден", "error");
    return;
  }

  // Можно удалять только студентов
  if (user.role !== "student") {
    showAlert("Удалять можно только студентов", "error");
    return;
  }

  // Удаляет все оценки студента перед его удалением
  let grades = getGrades();
  grades = grades.filter((g) => g.studentId !== id);
  saveGrades(grades);

  const filteredUsers = users.filter((u) => u.id !== id);
  saveUsers(filteredUsers);
  renderStudents();
  showAlert("Студент удален", "success");
};

/**
 * ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
 */

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

/**
 * Открывает профиль предмета с информацией и таблицей преподавателей
 * @param {number} subjectId - идентификатор предмета
 */
window.openSubjectProfile = function (subjectId) {
  const subjects = getSubjects();
  const subject = subjects.find((s) => s.id === subjectId);
  if (!subject) return;

  // Заполняет информацию о предмете
  document.getElementById(
    "profileSubjectName"
  ).textContent = `Профиль предмета: ${escapeHtml(subject.name)}`;
  document.getElementById("profileSubjectTitle").textContent = escapeHtml(
    subject.name
  );
  document.getElementById(
    "profileSubjectHours"
  ).textContent = `${subject.hours}`;
  document.getElementById(
    "profileSubjectCredits"
  ).textContent = `${subject.credits}`;

  // Заполняет таблицу преподавателей с чекбоксами
  const tbody = document.getElementById("profileSubjectTeachersTable");
  tbody.innerHTML = Teachers.map((teacher) => {
    const isAssigned =
      (subject.teacherIds && subject.teacherIds.includes(teacher.id)) ||
      false;
    return `
            <tr>
                <td>${escapeHtml(teacher.name)}</td>
                <td>
                    <input type="checkbox" ${isAssigned ? "checked" : ""} 
                           onchange="updateSubjectTeacher(${subjectId}, ${
      teacher.id
    }, this.checked)"
                           style="width: 18px; height: 18px; cursor: pointer;">
                </td>
            </tr>
        `;
  }).join("");

  showModal("subjectProfileModal");
};

/**
 * Закрывает профиль предмета
 */
window.closeSubjectProfile = function () {
  closeModal("subjectProfileModal");
};

/**
 * Обновляет назначение преподавателя к предмету
 * @param {number} subjectId - идентификатор предмета
 * @param {number} teacherId - идентификатор преподавателя
 * @param {boolean} isChecked - назначен ли предмет преподавателю
 */
window.updateSubjectTeacher = function (subjectId, teacherId, isChecked) {
  const subjects = getSubjects();
  const subject = subjects.find((s) => s.id === subjectId);
  if (!subject) return;

  // Инициализирует массив если нет
  if (!subject.teacherIds) {
    subject.teacherIds = [];
  }

  if (isChecked) {
    // Добавить преподавателя если его еще нет
    if (!subject.teacherIds.includes(teacherId)) {
      subject.teacherIds.push(teacherId);
    }
  } else {
    // Удалить преподавателя из массива
    subject.teacherIds = subject.teacherIds.filter((id) => id !== teacherId);
  }

  saveSubjects(subjects);
  renderSubjects();
};