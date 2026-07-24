"use strict";

/* ==================================================
   1. DOM 요소 선택
================================================== */
const form = document.getElementById("goal-form");
const input = document.getElementById("goal-input");
const category = document.getElementById("goal-category");
const listEl = document.getElementById("goal-list");
const emptyEl = document.getElementById("list-empty");
const errorEl = document.getElementById("form-error");
const tabsEl = document.getElementById("filter-tabs");
const fillEl = document.getElementById("progress-fill");
const textEl = document.getElementById("progress-text");
const todayEl = document.getElementById("today");
const tipEl = document.getElementById("tip");

/* ==================================================
   2. 플래너 상태와 localStorage
================================================== */
const STORAGE_KEY = "skala-planner";

const initialGoals = [
    {
        id: 1721180000000,
        title: "시맨틱 태그로 뼈대 만들기",
        category: "HTML",
        done: true,
    },
    {
        id: 1721180050000,
        title: "Flexbox로 헤더 정렬하기",
        category: "CSS",
        done: true,
    },
    {
        id: 1721180100000,
        title: "이벤트 위임 이해하기",
        category: "JS",
        done: false,
    },
    {
        id: 1721180150000,
        title: "fetch로 팁 불러오기",
        category: "JS",
        done: false,
    },
];

let goals = load();
let filter = "all";

if (goals.length === 0) {
    goals = [...initialGoals];
    save();
}

function load() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return [];
    }

    try {
        const parsedGoals = JSON.parse(saved);
        return Array.isArray(parsedGoals) ? parsedGoals : [];
    } catch (error) {
        console.error("저장된 목표를 불러오지 못했습니다.", error);
        return [];
    }
}

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

/* ==================================================
   3. 현재 필터에 맞는 목표 가져오기
================================================== */
function visible() {
    if (filter === "active") {
        return goals.filter((goal) => !goal.done);
    }

    if (filter === "done") {
        return goals.filter((goal) => goal.done);
    }

    return goals;
}

/* ==================================================
   4. 화면에 넣을 문자열 안전하게 변환
================================================== */
function escapeHtml(value) {
    const characters = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    };

    return String(value).replace(
        /[&<>"']/g,
        (character) => characters[character],
    );
}

/* ==================================================
   5. 진행률 표시
================================================== */
function updateProgress() {
    const total = goals.length;
    const done = goals.filter((goal) => goal.done).length;
    const percent =
        total === 0 ? 0 : Math.round((done / total) * 100);

    fillEl.style.width = `${percent}%`;
    textEl.textContent =
        `전체 ${total}개 중 ${done}개 완료 (${percent}%)`;
}

/* ==================================================
   6. 필터 탭 상태 표시
================================================== */
function updateFilterTabs() {
    const tabButtons = tabsEl.querySelectorAll(".tab");

    tabButtons.forEach((button) => {
        const isActive = button.dataset.filter === filter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

/* ==================================================
   7. 목표 목록 렌더링
================================================== */
function render() {
    const items = visible();

    listEl.innerHTML = "";

    items.forEach((goal) => {
        const li = document.createElement("li");

        li.className = goal.done ? "item is-done" : "item";
        li.dataset.id = goal.id;
        li.innerHTML = `
            <input
                class="item-check"
                type="checkbox"
                aria-label="목표 완료 상태 변경"
                ${goal.done ? "checked" : ""}
            >
            <span class="item-text">${escapeHtml(goal.title)}</span>
            <span class="badge">${escapeHtml(goal.category)}</span>
            <button
                class="item-del"
                type="button"
                aria-label="목표 삭제"
            >×</button>
        `;

        listEl.appendChild(li);
    });

    emptyEl.hidden = items.length !== 0;
    updateFilterTabs();
    updateProgress();
}

/* ==================================================
   8. 목표 추가
================================================== */
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = input.value.trim();

    if (!title) {
        errorEl.hidden = false;
        input.focus();
        return;
    }

    errorEl.hidden = true;
    goals.push({
        id: Date.now(),
        title,
        category: category.value,
        done: false,
    });

    input.value = "";
    save();
    render();
    input.focus();
});

/* ==================================================
   9. 목록 클릭 이벤트 위임 (각 항목이 아니라 부모 목록에 리스너를 하나만 둠)
================================================== */
listEl.addEventListener("click", (event) => {
    const item = event.target.closest(".item");

    if (!item) {
        return;
    }

    const id = Number(item.dataset.id);
    const goal = goals.find((currentGoal) => currentGoal.id === id);

    if (!goal) {
        return;
    }

    if (event.target.matches(".item-check")) {
        goal.done = event.target.checked;
    } else if (event.target.matches(".item-del")) {
        goals = goals.filter((currentGoal) => currentGoal.id !== id);
    } else {
        return;
    }

    save();
    render();
});

/* ==================================================
   10. 필터 탭 이벤트 위임
================================================== */
tabsEl.addEventListener("click", (event) => {
    const button = event.target.closest(".tab");

    if (!button || !tabsEl.contains(button)) {
        return;
    }

    filter = button.dataset.filter;
    render();
});

/* ==================================================
   11. 키보드 접근성
================================================== */
input.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
        return;
    }

    input.value = "";
    errorEl.hidden = true;
});

/* ==================================================
   12. 날짜와 첫 화면 표시
================================================== */
todayEl.textContent = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
});

tipEl.textContent =
    "Flexbox는 1차원, Grid는 2차원 레이아웃에 적합합니다.";

render();
