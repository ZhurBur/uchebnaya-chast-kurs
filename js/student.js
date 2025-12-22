/**
 * ПАНЕЛЬ СТУДЕНТА
 * Логика для отображения информации и оценок студента
 */

// Переменная для хранения текущего авторизованного студента
let currentUser = null;

/**
 * При загрузке страницы инициализирует БД, проверяет права студента
 * и загружает его информацию и оценки
 */
document.addEventListener('DOMContentLoaded', () => {
    initDatabase();
    currentUser = checkAuth('student');
    if (currentUser) {
        loadStudentInfo();
        loadGrades();
    }
});

/**
 * Загружает и отображает личную информацию студента:
 * ФИО, номер группы
 */
function loadStudentInfo() {
    const nameElement = document.getElementById('studentName');
    const infoNameElement = document.getElementById('infoName');
    const infoGroupElement = document.getElementById('infoGroup');
    
    // Отображает имя студента в шапке
    if (nameElement) nameElement.textContent = currentUser.name;
    // Отображает имя студента в информационной таблице
    if (infoNameElement) infoNameElement.textContent = currentUser.name;
    
    // Получает информацию о группе студента
    const groups = getGroups();
    const group = groups.find(g => g.id == currentUser.groupId);
    if (infoGroupElement) {
        infoGroupElement.textContent = group ? group.name : 'Не назначена';
    }
}

/**
 * Загружает и отображает таблицу предметов и оценок студента
 * Для каждого предмета показывает:
 * - Название предмета
 * - ФИО преподавателя
 * - Количество часов и кредитов
 * - Полученную оценку (если есть)
 * Оценки цветируются: 5=зелёный, 4=синий, 3=оранжевый, 2=красный
 * 
 * Предмет показывается, если:
 * 1. У студента уже есть оценка по предмету, ИЛИ
 * 2. Предмет привязан к группе студента
 */
function loadGrades() {
    const subjects = getSubjects();
    const grades = getGrades();
    const users = getUsers();
    const groups = getGroups();
    const tbody = document.getElementById('gradesTable');
    
    if (!tbody) return;
    
    // Получает группу текущего студента
    const studentGroup = groups.find(g => g.id == currentUser.groupId);
    const groupSubjectIds = (studentGroup && studentGroup.subjects) ? studentGroup.subjects : [];
    
    // Если предметов не найдено, показывает сообщение
    if (subjects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Предметы не найдены</td></tr>';
        return;
    }
    
    // Фильтрует предметы: показывает только те, у которых есть оценка или которые привязаны к группе
    const visibleSubjects = subjects.filter(s => {
        const hasGrade = grades.some(g => g.studentId === currentUser.id && g.subjectId === s.id);
        const isInGroup = groupSubjectIds.includes(s.id);
        return hasGrade || isInGroup;
    });
    
    // Если нет видимых предметов, показывает сообщение
    if (visibleSubjects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">"Нет предметов"</td></tr>';
        return;
    }
    
    // Заполняет таблицу предметами и оценками
    tbody.innerHTML = visibleSubjects.map(s => {
        // Получает список преподавателей для предмета
        const teacherIds = s.teacherIds && s.teacherIds.length > 0 ? s.teacherIds : [];
        const teacherNames = teacherIds
            .map(id => {
                const teacher = Teachers.find(t => t.id === id);
                return teacher ? teacher.name : 'Неизвестен';
            })
            .join(', ');
        
        const gradeRecord = grades.find(g => g.studentId === currentUser.id && g.subjectId === s.id);
        const grade = gradeRecord ? gradeRecord.grade : '-';
        
        // Устанавливает цвет для оценки
        let gradeStyle = '';
        if (grade === 5) gradeStyle = 'color: green; font-weight: bold;';
        else if (grade === 4) gradeStyle = 'color: blue; font-weight: bold;';
        else if (grade === 3) gradeStyle = 'color: orange; font-weight: bold;';
        else if (grade === 2) gradeStyle = 'color: red; font-weight: bold;';
        
        return `
            <tr>
                <td>${escapeHtml(s.name)}</td>
                <td>${escapeHtml(teacherNames || '-')}</td>
                <td>${parseInt(s.hours) || 0}ч / ${parseInt(s.credits) || 0}кр</td>
                <td style="${gradeStyle}">${grade}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Экранирует HTML-символы в тексте для безопасного отображения
 * Предотвращает XSS-атаки
 * @param {string} text - текст для экранирования
 * @returns {string} экранированный текст
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

