"use strict";

/* ---------------------------------
   1. 화면에서 사용할 요소 선택
---------------------------------- */
const fillEl = document.getElementById("progress-fill");
const textEl = document.getElementById("progress-text");

/* ---------------------------------
   2. 플래너의 상태
---------------------------------- */
const STORAGE_KEY = "skala-planner";

const initialGoals = [
    {
        id: 1721180000000,        
        title: "HTML 시맨틱 태그 복습",
        category: "HTML",
        done: true,
    },
    {
        id: 1721180050000,
        title: "CSS Flexbox 정리",
        category: "CSS",
        done: false,
    },
    {
        id: 1721180100000,
        title: "Javascript 배열 메서드 연습",
        category: "JS",
        done: false,
    },
];

let goals = load();
let filter = "all";

// 저장된 목표가 없으면 초기 목표 3개를 복사해서 사용한다.
if (goals.length === 0) {
    goals = [...initialGoals];
    save();
}

/* ---------------------------------
   3. JSON 문자열 저장과 불러오기
---------------------------------- */
function load() {
    const saved = localStorage.getItem(STORAGE_KEY);

    // JSON 문자열을 Javascript 배열로 변환한다.
    return saved ? JSON.parse(saved) : [];
}

function save() {
    // Javascript 배열을 JSON 문자열로 변환해서 저장한다.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

/* ---------------------------------
   4. filter로 현재 조건에 맞는 목표 선택
---------------------------------- */
function visible() {
    if (filter === "active") {
        return goals.filter((goal) => !goal.done);
    }

    if (filter === "done") {
        return goals.filter((goal) => goal.done);
    }

    return goals;
}

/* ---------------------------------
   5. find로 id가 같은 목표 하나 찾기
---------------------------------- */
function findGoal(id) {
    return goals.find((goal) => goal.id === id);
}

/* ---------------------------------
   6. reduce로 완료 목표 개수 계산
---------------------------------- */
function countDoneGoals() {
    return goals.reduce(
        (count, goal) => count + (goal.done ? 1 : 0),
        0,
    );
}

/* ---------------------------------
   7. 전체 목표와 완료 목표로 진행률 계산
---------------------------------- */
function updateProgress() {
    const total = goals.length;
    const done = countDoneGoals();

    // 목표가 0개일 때 0으로 나누지 않도록 삼항 연산자로 처리
    const percent =
        total === 0 ? 0 : Math.round((done / total) * 100);

    fillEl.style.width = percent + "%";
    textEl.textContent =
        `전체 ${total}개 중 ${done}개 완료 (${percent}%)`;
}

/* ---------------------------------
   8. 구조분해와 스프레드 연습
---------------------------------- */
const firstGoal = goals[0];
const {
    title,
    category: firstCategory,
    memo = "없음",
} = firstGoal;

// 원본 객체를 변경하지 않고 완료 상태인 복사본을 만든다.
const completedCopy = {
    ...firstGoal,
    done: true,
};

// sort는 원본을 바꾸므로 스프레드로 복사한 뒤 정렬한다.
const sortedGoals = [...goals].sort(
    (a, b) => Number(a.done) - Number(b.done),
);

// filter: 미완료 목표 개수 확인
const activeGoals = goals.filter((goal) => !goal.done);
console.log(`미완료 목표: ${activeGoals.length}개`);

// find: 첫 번째 목표의 id로 목표 하나 찾기
const foundGoal = findGoal(firstGoal.id);
console.log("id로 찾은 목표:", foundGoal);

// 구조분해와 스프레드 결과 확인
console.log("구조분해:", title, firstCategory, memo);
console.log("스프레드 복사본:", completedCopy);
console.log(
    "미완료 우선 정렬:",
    sortedGoals.map((goal) => goal.title),
);

// save/load: 저장한 배열과 다시 불러온 배열이 같은지 확인
save();
const loadedGoals = load();
const isSame =
    JSON.stringify(loadedGoals) === JSON.stringify(goals);
console.log("저장/불러오기 왕복 성공:", isSame);

updateProgress();
console.log(textEl.textContent);
