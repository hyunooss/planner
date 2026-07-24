"use strict";

/* 1. DOM 요소 선택 */
const form = document.getElementById("goal-form");
const input = document.getElementById("goal-input");
const category = document.getElementById("goal-category");
const dueInput = document.getElementById("goal-due");
const searchInput = document.getElementById("goal-search");
const listEl = document.getElementById("goal-list");
const emptyEl = document.getElementById("list-empty");
const errorEl = document.getElementById("form-error");
const tabsEl = document.getElementById("filter-tabs");
const fillEl = document.getElementById("progress-fill");
const progressBarEl = document.getElementById("progress-bar");
const textEl = document.getElementById("progress-text");
const todayEl = document.getElementById("today");
const tipEl = document.getElementById("tip");
const summaryHtmlEl = document.getElementById("summary-html");
const summaryCssEl = document.getElementById("summary-css");
const summaryJsEl = document.getElementById("summary-js");
const sortControlsEl = document.getElementById("sort-controls");
const themeToggleEl = document.getElementById("theme-toggle");
const themeTextEl = document.getElementById("theme-text");
const listStatusEl = document.getElementById("list-status");

/* 2. 상태와 localStorage */
const STORAGE_KEY = "skala-planner";
const THEME_KEY = "skala-planner-theme";
const CATEGORIES = ["HTML", "CSS", "JS"];

const initialGoals = [
    {
        id: 1721180000000,
        title: "시맨틱 태그로 뼈대 만들기",
        category: "HTML",
        due: "2026-07-20",
        done: true,
    },
    {
        id: 1721180050000,
        title: "Flexbox로 헤더 정렬하기",
        category: "CSS",
        due: "2026-07-23",
        done: true,
    },
    {
        id: 1721180100000,
        title: "이벤트 위임 이해하기",
        category: "JS",
        due: "2026-07-22",
        done: false,
    },
    {
        id: 1721180150000,
        title: "fetch로 팁 불러오기",
        category: "JS",
        due: "2026-07-31",
        done: false,
    },
];

let goals = load();
let filter = "all";
let sort = "due";
let enteringGoalId = null;

if (goals === null) {
    goals = initialGoals.map((goal) => ({ ...goal }));
    save();
}

function normalizeGoals(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((goal) => goal && typeof goal.title === "string")
        .map((goal) => ({
            id: Number(goal.id) || Date.now(),
            title: goal.title,
            category: CATEGORIES.includes(goal.category)
                ? goal.category
                : "HTML",
            due:
                typeof goal.due === "string"
                && /^\d{4}-\d{2}-\d{2}$/.test(goal.due)
                    ? goal.due
                    : "",
            done: Boolean(goal.done),
        }));
}

function load() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved === null) {
            return null;
        }

        return normalizeGoals(JSON.parse(saved));
    } catch (error) {
        console.warn("저장된 목표를 초기화했습니다.", error);
        return null;
    }
}

function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    } catch (error) {
        console.warn("목표를 저장하지 못했습니다.", error);
    }
}

/* 3. 날짜 처리 - F5 */
function getTodayValue() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function isOverdue(goal) {
    return Boolean(
        !goal.done
        && goal.due
        && goal.due < getTodayValue(),
    );
}

function formatDueDate(value) {
    if (!value) {
        return "마감일 없음";
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return `마감 ${date.toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
    })}`;
}

/* 4. 필터와 실시간 검색 - F6 */
function visible() {
    let list = [...goals];

    if (filter === "active") {
        list = list.filter((goal) => !goal.done);
    } else if (filter === "done") {
        list = list.filter((goal) => goal.done);
    }

    const keyword = searchInput.value.trim().toLowerCase();

    if (keyword) {
        list = list.filter((goal) =>
            goal.title.toLowerCase().includes(keyword),
        );
    }

    return list.sort((first, second) => {
        if (sort === "latest") {
            return second.id - first.id;
        }

        if (!first.due && !second.due) {
            return second.id - first.id;
        }

        if (!first.due) {
            return 1;
        }

        if (!second.due) {
            return -1;
        }

        return first.due.localeCompare(second.due);
    });
}

/* 5. 분류별 남은 목표 집계 - F7 */
function updateSummary() {
    const rest = goals
        .filter((goal) => !goal.done)
        .reduce(
            (counts, goal) => {
                counts[goal.category] =
                    (counts[goal.category] || 0) + 1;
                return counts;
            },
            { HTML: 0, CSS: 0, JS: 0 },
        );

    summaryHtmlEl.textContent = rest.HTML;
    summaryCssEl.textContent = rest.CSS;
    summaryJsEl.textContent = rest.JS;
}

/* 6. 진행률과 필터 탭 표시 */
function updateProgress() {
    const total = goals.length;
    const done = goals.filter((goal) => goal.done).length;
    const percent =
        total === 0 ? 0 : Math.round((done / total) * 100);

    fillEl.style.width = `${percent}%`;
    progressBarEl.setAttribute("aria-valuenow", String(percent));
    textEl.textContent =
        `전체 ${total}개 중 ${done}개 완료 (${percent}%)`;
}

function updateFilterTabs() {
    tabsEl.querySelectorAll(".tab").forEach((button) => {
        const isActive = button.dataset.filter === filter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

function updateSortButtons() {
    sortControlsEl.querySelectorAll(".sort-btn").forEach((button) => {
        const isActive = button.dataset.sort === sort;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

/* 7. 다크 모드 - 색상은 CSS 변수로 처리 */
function loadTheme() {
    try {
        return localStorage.getItem(THEME_KEY) === "dark"
            ? "dark"
            : "light";
    } catch (error) {
        console.warn("테마 설정을 불러오지 못했습니다.", error);
        return "light";
    }
}

function applyTheme(theme) {
    const isDark = theme === "dark";

    document.documentElement.dataset.theme =
        isDark ? "dark" : "light";
    themeToggleEl.setAttribute("aria-pressed", String(isDark));
    themeToggleEl.setAttribute(
        "aria-label",
        isDark ? "라이트 모드로 전환" : "다크 모드로 전환",
    );
    themeTextEl.textContent = isDark ? "라이트 모드" : "다크 모드";
}

function saveTheme(theme) {
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
        console.warn("테마 설정을 저장하지 못했습니다.", error);
    }
}

/* 8. 목표 DOM 생성 - 사용자 입력은 textContent로 출력 */
function createGoalItem(goal) {
    const item = document.createElement("li");
    const checkbox = document.createElement("input");
    const content = document.createElement("div");
    const title = document.createElement("span");
    const due = document.createElement("span");
    const badge = document.createElement("span");
    const deleteButton = document.createElement("button");

    item.className = "item";
    item.dataset.id = goal.id;
    item.classList.toggle("is-done", goal.done);
    item.classList.toggle("is-overdue", isOverdue(goal));
    item.classList.toggle("is-entering", goal.id === enteringGoalId);

    checkbox.className = "item-check";
    checkbox.type = "checkbox";
    checkbox.checked = goal.done;
    checkbox.setAttribute(
        "aria-label",
        `${goal.title} 완료 상태 변경`,
    );

    content.className = "item-content";

    title.className = "item-text";
    title.textContent = goal.title;
    title.tabIndex = 0;
    title.setAttribute("role", "button");
    title.setAttribute(
        "aria-label",
        `${goal.title} 제목 수정`,
    );
    title.setAttribute(
        "title",
        "더블클릭하거나 Enter 키를 눌러 수정",
    );

    due.className = "item-due";
    due.textContent = formatDueDate(goal.due);

    if (isOverdue(goal)) {
        due.textContent += " · 기한 지남";
    }

    badge.className = `badge badge-${goal.category.toLowerCase()}`;
    badge.textContent = goal.category;

    deleteButton.className = "item-del";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `${goal.title} 삭제`);

    content.appendChild(title);
    content.appendChild(due);
    item.appendChild(checkbox);
    item.appendChild(content);
    item.appendChild(badge);
    item.appendChild(deleteButton);

    return item;
}

/* 9. 제목 수정 */
function findGoalFromItem(item) {
    const id = Number(item.dataset.id);
    return goals.find((goal) => goal.id === id);
}

function startEditing(item) {
    const currentEditor = listEl.querySelector(".item-edit");

    if (currentEditor) {
        currentEditor.focus();
        return;
    }

    const goal = findGoalFromItem(item);
    const title = item.querySelector(".item-text");

    if (!goal || !title || item.querySelector(".item-edit")) {
        return;
    }

    const editor = document.createElement("input");
    let finished = false;

    editor.className = "item-edit";
    editor.type = "text";
    editor.value = goal.title;
    editor.maxLength = 80;
    editor.setAttribute("aria-label", "목표 제목 수정");
    title.replaceWith(editor);
    editor.focus();
    editor.select();

    function finishEditing(shouldSave) {
        if (finished) {
            return;
        }

        finished = true;
        const nextTitle = editor.value.trim();

        if (shouldSave && nextTitle) {
            goal.title = nextTitle;
            save();
            listStatusEl.textContent =
                `"${nextTitle}" 제목을 수정했습니다.`;
        } else if (shouldSave) {
            listStatusEl.textContent =
                "빈 제목은 저장할 수 없어 수정을 취소했습니다.";
        } else {
            listStatusEl.textContent = "제목 수정을 취소했습니다.";
        }

        render();
    }

    editor.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            finishEditing(true);
        } else if (event.key === "Escape") {
            event.preventDefault();
            finishEditing(false);
        }
    });

    editor.addEventListener("blur", () => {
        finishEditing(true);
    });

    editor.addEventListener("dblclick", (event) => {
        event.stopPropagation();
    });
}

/* 10. 상태 기반 렌더링 */
function render() {
    const items = visible();
    const hasCondition =
        filter !== "all" || searchInput.value.trim() !== "";

    listEl.replaceChildren();

    items.forEach((goal) => {
        const item = createGoalItem(goal);
        listEl.appendChild(item);

        if (goal.id === enteringGoalId) {
            requestAnimationFrame(() => {
                item.classList.remove("is-entering");
            });
        }
    });

    if (goals.length === 0) {
        emptyEl.textContent =
            "아직 등록된 목표가 없습니다. 예: CSS Grid 복습하기";
    } else {
        emptyEl.textContent = hasCondition
            ? "조건에 맞는 목표가 없습니다."
            : "아직 등록된 목표가 없습니다.";
    }

    emptyEl.hidden = items.length !== 0;

    updateFilterTabs();
    updateSortButtons();
    updateProgress();
    updateSummary();
    enteringGoalId = null;
}

/* 11. 목표 추가 - F1, F5 */
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = input.value.trim();

    if (!title) {
        errorEl.hidden = false;
        input.focus();
        return;
    }

    errorEl.hidden = true;
    const id = Date.now();

    goals.push({
        id,
        title,
        category: category.value,
        due: dueInput.value,
        done: false,
    });

    enteringGoalId = id;
    form.reset();
    save();
    render();
    input.focus();
});

/* 12. 완료·삭제 이벤트 위임 - F2 */
listEl.addEventListener("click", (event) => {
    const item = event.target.closest(".item");

    if (!item || !listEl.contains(item)) {
        return;
    }

    const goal = findGoalFromItem(item);

    if (!goal) {
        return;
    }

    if (event.target.matches(".item-check")) {
        goal.done = event.target.checked;
        listStatusEl.textContent = goal.done
            ? `"${goal.title}" 목표를 완료했습니다.`
            : `"${goal.title}" 목표를 진행중으로 바꿨습니다.`;
    } else if (event.target.matches(".item-del")) {
        let removed = false;

        item.classList.add("is-removing");
        event.target.disabled = true;

        function removeGoal() {
            if (removed) {
                return;
            }

            removed = true;
            goals = goals.filter(
                (currentGoal) => currentGoal.id !== goal.id,
            );
            listStatusEl.textContent =
                `"${goal.title}" 목표를 삭제했습니다.`;
            save();
            render();
        }

        item.addEventListener("transitionend", (transitionEvent) => {
            if (
                transitionEvent.target === item
                && transitionEvent.propertyName === "opacity"
            ) {
                removeGoal();
            }
        });

        setTimeout(removeGoal, 350);
        return;
    } else {
        return;
    }

    save();
    render();
});

/* 13. 제목 수정 이벤트 */
listEl.addEventListener("dblclick", (event) => {
    const title = event.target.closest(".item-text");
    const item = event.target.closest(".item");

    if (!title || !item || !listEl.contains(item)) {
        return;
    }

    startEditing(item);
});

listEl.addEventListener("keydown", (event) => {
    if (
        !event.target.matches(".item-text")
        || (event.key !== "Enter" && event.key !== "F2")
    ) {
        return;
    }

    event.preventDefault();
    const item = event.target.closest(".item");

    if (item) {
        startEditing(item);
    }
});

/* 14. 필터·검색·정렬·테마 이벤트 */
tabsEl.addEventListener("click", (event) => {
    const button = event.target.closest(".tab");

    if (!button || !tabsEl.contains(button)) {
        return;
    }

    filter = button.dataset.filter;
    render();
});

searchInput.addEventListener("input", render);

sortControlsEl.addEventListener("click", (event) => {
    const button = event.target.closest(".sort-btn");

    if (!button || !sortControlsEl.contains(button)) {
        return;
    }

    sort = button.dataset.sort;
    render();
});

themeToggleEl.addEventListener("click", () => {
    const nextTheme =
        document.documentElement.dataset.theme === "dark"
            ? "light"
            : "dark";

    applyTheme(nextTheme);
    saveTheme(nextTheme);
});

input.addEventListener("input", () => {
    if (input.value.trim()) {
        errorEl.hidden = true;
    }
});

input.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
        return;
    }

    input.value = "";
    errorEl.hidden = true;
});

/* 15. 오늘의 팁 불러오기 */
async function loadTip() {
    tipEl.textContent = "불러오는 중…";

    try {
        const response = await fetch("data/tips.json");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const tips = await response.json();

        if (!Array.isArray(tips) || tips.length === 0) {
            throw new Error("사용할 수 있는 팁이 없습니다.");
        }

        const today = new Date().getDate() % tips.length;
        tipEl.textContent = tips[today];
    } catch (error) {
        tipEl.textContent = "팁을 불러오지 못했습니다.";
        console.warn("오늘의 팁 불러오기 실패:", error);
    }
}

/* 16. 첫 화면 표시 */
applyTheme(loadTheme());

todayEl.textContent = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
});

render();
loadTip();
