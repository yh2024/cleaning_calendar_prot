// 日本の現在時刻を取得する関数
const getJST = () => {
    // 現在時刻を取得
    const date = new Date();
    // 日本のタイムゾーンでの時刻を取得
    const jst = date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    
    // 日付テスト用
    // 2024年4月15日を返す（月は0から始まるため、3が4月）
    // const jst = new Date(2024, 10, 15);

    // 日本の現在時刻を返す
    return jst;
}


// 現在の時刻から、月の日にちの一覧が入った配列を作成する関数
// 日にちのフォーマットは「2024/1/1（月）」の形式とする
const getMonthDatesWithWeekdays = () => {
    // 現在の日本時間を取得
    const now = new Date(getJST());
    // 現在の年と月を取得
    const year = now.getFullYear();
    const month = now.getMonth();
    // 月の初日を取得
    const firstDay = new Date(year, month, 1);
    // 月の最終日を取得
    const lastDay = new Date(year, month + 1, 0);
    // 日付と曜日の一覧を生成
    let dateList = [];
    // 月の初日から最終日までループ
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        // 日付と曜日を含む形式で文字列を生成
        const dateString = d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' });
        // 生成した文字列を配列に追加
        dateList.push(dateString);
    }
    // 生成した配列を返す
    return dateList;
};

// 月のすべての土曜日を取得する関数
const getSaturdaysOfMonth = (year, month) => {
    let saturdays = [];
    let date = new Date(year, month, 1);
    while (date.getMonth() === month) {
        if (date.getDay() === 6) { // 土曜日は6
            saturdays.push(new Date(date));
        }
        date.setDate(date.getDate() + 1);
    }
    return saturdays;
};

// タスクを表示する関数（更新版）
const insertDatesAndTasksIntoTable = () => {
    const dates = getMonthDatesWithWeekdays();
    const now = new Date(getJST());
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const saturdays = getSaturdaysOfMonth(currentYear, currentMonth);

    const tableBody = document.getElementById('cleaningSchedule').getElementsByTagName('tbody')[0];
     
    dates.forEach(date => {
        let row = tableBody.insertRow();
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);

        const dateObj = new Date(date);
        const day = dateObj.getDate();
        const dayOfWeek = dateObj.toLocaleDateString('ja-JP', { weekday: 'long' });

        cell1.innerHTML = date;

        const dailyTask = cleaningTasks[day] || "";
        const weeklyTask = weeklyTasks[dayOfWeek] ? weeklyTasks[dayOfWeek].join(" / ") : "";

        let monthlyTask = "";
        saturdays.forEach((saturday, index) => {
            if (saturday.getDate() === day && monthlyTasks[currentMonth + 1] && monthlyTasks[currentMonth + 1][index]) {
                monthlyTask = monthlyTasks[currentMonth + 1][index];
            }
        });

        // タスクを整理し、ゴミ収集タスクを先頭にする
        let tasks = [dailyTask, weeklyTask, monthlyTask].filter(task => task);
        tasks = prioritizeGarbageTasks(tasks); // ゴミ収集タスクを先頭にする関数（後で定義）

        // タスクをHTMLに挿入（修正版）
        cell2.innerHTML = tasks.map(task => {
            // タスクを個別に分割
            return task.split(" / ").map(subTask => {
                // ゴミ収集タスクに対してスタイルを適用
                if (isGarbageTask(subTask)) {
                    return `<span class="garbage-task fw-bold" style="padding: 4px; background-color: ${getGarbageTaskColor(subTask)}; border-radius: 4px;">${subTask}</span>`;
                }
                return subTask;
            }).join(" / ");
        }).join(" / ");
        
        // 現在の日付の行をハイライト
        if (dateObj.toDateString() === now.toDateString()) {
            row.classList.add('table-primary', 'fw-bold');
        }
    });
};

// タスクがゴミ収集タスクかどうかを判断する関数（修正版）
function isGarbageTask(task) {
    // 複数のタスクを個別に分割
    const tasks = task.split(" / ");
    // 分割したタスクの中にゴミ収集タスクが含まれているかチェック
    return tasks.some(subTask => ["燃やせるゴミ", "燃やせないor缶・ビン・ペットボトルゴミ", "プラ容器ゴミ"].includes(subTask));
}


// ゴミ収集タスクの背景色を取得する関数
function getGarbageTaskColor(task) {
    const colors = {
        "燃やせるゴミ": "#ffacd9",
        "燃やせないor缶・ビン・ペットボトルゴミ": "#6effc7", // エメラルドグリーンの正確な色コードに置き換える
        "プラ容器ゴミ": "#ffff00"
    };
    return colors[task] || "transparent";
}

// ゴミ収集タスクを先頭に移動する関数
function prioritizeGarbageTasks(tasks) {
    const garbageTasks = tasks.filter(isGarbageTask);
    const otherTasks = tasks.filter(task => !isGarbageTask(task));
    return [...garbageTasks, ...otherTasks];
}


export { insertDatesAndTasksIntoTable };