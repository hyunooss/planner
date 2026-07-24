"use strict";

/* ---------------------------------
   1. 화면에서 사용할 요소 선택
---------------------------------- */
const fillEl = document.getElementById("progress-fill");
const textEl = document.getElementById("progress-text");

/* ---------------------------------
   2. 플래너의 상태

   const: 저장소 이름은 바뀌지 않음
   let: 목표 목록과 필터는 앞으로 바뀔 값
---------------------------------- */
const STORAGE_KEY = "skala-planner";

let goals = [
    { done: true },
    { done: false },
];

let filter = "all";

/* ---------------------------------
   3. 전체 목표와 완료 목표로 진행률 계산
---------------------------------- */
function updateProgress() {
    const total = goals.length;
    const done = goals.filter((goal) => goal.done).length;

    // 목표가 0개일 때 0으로 나누지 않도록 삼항 연산자로 처리
    const percent =
        total === 0 ? 0 : Math.round((done / total) * 100);

    fillEl.style.width = percent + "%";
    textEl.textContent =
        `전체 ${total}개 중 ${done}개 완료 (${percent}%)`;
}

/* ---------------------------------
   4. 첫 화면에 진행률 표시
---------------------------------- */
updateProgress();

// 개발자 도구 Console에서 "전체 2개 중 1개 완료 (50%)"가 출력되는지 확인
console.log(textEl.textContent);
