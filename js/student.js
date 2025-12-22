// JavaScript source code
/**
 * ÏÀÍÅËÜ ÑÒÓÄÅÍÒÀ
 * Ëîãèêà äëÿ îòîáðàæåíèÿ èíôîðìàöèè è îöåíîê ñòóäåíòà
 */

// Ïåðåìåííàÿ äëÿ õðàíåíèÿ òåêóùåãî àâòîðèçîâàííîãî ñòóäåíòà
let currentUser = null;

// Ôóíêöèÿ äëÿ ýêðàíèðîâàíèÿ HTML (äîáàâëåíà)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Ïðè çàãðóçêå ñòðàíèöû èíèöèàëèçèðóåò ÁÄ, ïðîâåðÿåò ïðàâà ñòóäåíòà
 * è çàãðóæàåò åãî èíôîðìàöèþ è îöåíêè
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
 * Çàãðóæàåò è îòîáðàæàåò ëè÷íóþ èíôîðìàöèþ ñòóäåíòà:
 * ÔÈÎ, íîìåð ãðóïïû
 */
function loadStudentInfo() {
    const nameElement = document.getElementById('studentName');
    const infoNameElement = document.getElementById('infoName');
    const infoGroupElement = document.getElementById('infoGroup');
    
    // Îòîáðàæàåò èìÿ ñòóäåíòà â øàïêå
    if (nameElement) nameElement.textContent = currentUser.name;
    // Îòîáðàæàåò èìÿ ñòóäåíòà â èíôîðìàöèîííîé òàáëèöå
    if (infoNameElement) infoNameElement.textContent = currentUser.name;
    
    // Ïîëó÷àåò èíôîðìàöèþ î ãðóïïå ñòóäåíòà
    const groups = getGroups();
    const group = groups.find(g => g.id == currentUser.groupId);
    if (infoGroupElement) {
        infoGroupElement.textContent = group ? group.name : 'Íå íàçíà÷åíà';
    }
}

/**
 * Çàãðóæàåò è îòîáðàæàåò òàáëèöó ïðåäìåòîâ è îöåíîê ñòóäåíòà
 * Äëÿ êàæäîãî ïðåäìåòà ïîêàçûâàåò:
 * - Íàçâàíèå ïðåäìåòà
 * - ÔÈÎ ïðåïîäàâàòåëÿ
 * - Êîëè÷åñòâî ÷àñîâ è êðåäèòîâ
 * - Ïîëó÷åííóþ îöåíêó (åñëè åñòü)
 * Îöåíêè öâåòèðóþòñÿ: 5=çåë¸íûé, 4=ñèíèé, 3=îðàíæåâûé, 2=êðàñíûé
 * 
 * Ïðåäìåò ïîêàçûâàåòñÿ, åñëè:
 * 1. Ó ñòóäåíòà óæå åñòü îöåíêà ïî ïðåäìåòó, ÈËÈ
 * 2. Ïðåäìåò ïðèâÿçàí ê ãðóïïå ñòóäåíòà
 */
function loadGrades() {
    const subjects = getSubjects();
    const grades = getGrades();
    const users = getUsers();
    const groups = getGroups();
    const tbody = document.getElementById('gradesTable');
    
    if (!tbody) return;
    
    // Ïîëó÷àåò ãðóïïó òåêóùåãî ñòóäåíòà
    const studentGroup = groups.find(g => g.id == currentUser.groupId);
    const groupSubjectIds = (studentGroup && studentGroup.subjects) ? studentGroup.subjects : [];
    
    // Åñëè ïðåäìåòîâ íå íàéäåíî, ïîêàçûâàåò ñîîáùåíèå
    if (subjects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Ïðåäìåòû íå íàéäåíû</td></tr>';
        return;
    }
    
    // Ôèëüòðóåò ïðåäìåòû: ïîêàçûâàåò òîëüêî òå, ó êîòîðûõ åñòü îöåíêà èëè êîòîðûå ïðèâÿçàíû ê ãðóïïå
    const visibleSubjects = subjects.filter(s => {
        const hasGrade = grades.some(g => g.studentId === currentUser.id && g.subjectId === s.id);
        const isInGroup = groupSubjectIds.includes(s.id);
        return hasGrade || isInGroup;
    });
    
    // Åñëè íåò âèäèìûõ ïðåäìåòîâ, ïîêàçûâàåò ñîîáùåíèå
    if (visibleSubjects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Íåò ïðåäìåòîâ</td></tr>';
        return;
    }
    
    // Çàïîëíÿåò òàáëèöó ïðåäìåòàìè è îöåíêàìè
    tbody.innerHTML = visibleSubjects.map(s => {
        // Ïîëó÷àåò ñïèñîê ïðåïîäàâàòåëåé äëÿ ïðåäìåòà
        const teacherIds = s.teacherIds && s.teacherIds.length > 0 ? s.teacherIds : [];
        const teacherNames = teacherIds
            .map(id => {
                const teacher = Teachers.find(t => t.id === id);
                return teacher ? teacher.name : 'Íåèçâåñòåí';
            })
            .join(', ');
        
        const gradeRecord = grades.find(g => g.studentId === currentUser.id && g.subjectId === s.id);
        const grade = gradeRecord ? gradeRecord.grade : '-';
        
        // Óñòàíàâëèâàåò öâåò äëÿ îöåíêè
        let gradeStyle = '';
        if (grade === 5) gradeStyle = 'color: green; font-weight: bold;';
        else if (grade === 4) gradeStyle = 'color: blue; font-weight: bold;';
        else if (grade === 3) gradeStyle = 'color: orange; font-weight: bold;';
        else if (grade === 2) gradeStyle = 'color: red; font-weight: bold;';
        
        return `
            <tr>
                <td>${escapeHtml(s.name)}</td>
                <td>${escapeHtml(teacherNames || '-')}</td>
                <td>${parseInt(s.hours) || 0}÷ / ${parseInt(s.credits) || 0}êð</td>
                <td style="${gradeStyle}">${grade}</td>
            </tr>
        `;
    }).join('');
}
