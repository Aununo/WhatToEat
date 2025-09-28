document.addEventListener("DOMContentLoaded", () => {
    let isPlaying = false;
    let randomTimeout;
    let currentMode = "android";
    let resetCount = 0;
    let currentOrder = 2; // 0: 早餐, 1: 午餐, 2: 晚餐
    let screenWidth, screenHeight;
    let currentFoodPool = [];

    const foodPools = {};
    const mealNames = ["breakfast", "lunch", "dinner"];

    // 元素选择
    const body = document.body;
    const title = document.querySelector(".title");
    const what = document.querySelector(".what");
    const punctuation = document.querySelector(".punctuation");
    const startButton = document.getElementById("start");
    const os = document.querySelector(".os");
    const tempContainer = document.getElementById("temp_container");
    const toggleButtons = document.querySelectorAll("#toggle button");
    const colorBlock = document.getElementById("colorBlock");
    const timeSpan = document.querySelector(".time");
    const tip = document.querySelector(".tip");

    // --- 初始化 ---
    function initialize() {
        const currentHour = new Date().getHours();
        if (currentHour < 9 || currentHour >= 23) {
            currentOrder = 0;
        } else if (currentHour < 13) {
            currentOrder = 1;
        } else {
            currentOrder = 2;
        }

        updateMealForCurrentOrder(currentOrder);
        selectMealPoolBasedOnMode();
        updateScreenSize();
        setupEventListeners();
        
        // 初始化色块位置
        updateColorBlockPosition(document.querySelector("#toggle button.selected"));
    }

    function updateScreenSize() {
        screenWidth = window.innerWidth;
        screenHeight = window.innerHeight;
    }

    // --- 事件监听 ---
    function setupEventListeners() {
        title.addEventListener("animationend", () => title.classList.remove("shake"));
        tempContainer.addEventListener("animationend", (e) => e.target.remove());
        startButton.addEventListener("click", handleStartStop);
        title.addEventListener("click", handleTitleClick);
        toggleButtons.forEach(button => button.addEventListener("click", handleToggleClick));
        window.addEventListener("resize", updateScreenSize);
    }

    // --- 核心功能函数 ---
    function handleStartStop() {
        body.classList.toggle("playing", !isPlaying);
        isPlaying = !isPlaying;

        if (isPlaying) {
            handleTeases(++resetCount);
            resetTitle();
            startButton.textContent = "停";
            os.textContent = "";
            triggerRandomFoodDisplay();
        } else {
            clearTimeout(randomTimeout);
            punctuation.textContent = "！";
            startButton.textContent = "换一个";
            document.title = "吃啥 | " + title.textContent.replace(/\s/g, '');
        }
    }

    function handleTitleClick() {
        currentOrder = (currentOrder + 1) % 3;
        updateMealForCurrentOrder(currentOrder);
        selectMealPoolBasedOnMode();
    }

    function handleToggleClick(e) {
        const selectedButton = e.target;
        toggleButtons.forEach(btn => btn.classList.remove("selected"));
        selectedButton.classList.add("selected");
        
        updateColorBlockPosition(selectedButton);

        currentMode = selectedButton.dataset.type;
        selectMealPoolBasedOnMode();
        resetCount = 0;
    }

    function updateColorBlockPosition(selectedButton) {
        if (!selectedButton) return;
        const blockWidth = selectedButton.offsetWidth;
        const blockLeft = selectedButton.offsetLeft;
        const blockTop = selectedButton.offsetTop;

        colorBlock.style.width = `${blockWidth}px`;
        colorBlock.style.left = `${blockLeft}px`;
        colorBlock.style.top = `${blockTop}px`;
        colorBlock.style.backgroundColor = selectedButton.dataset.color;
    }

    function getMealName(order) {
        return mealNames[order];
    }

    async function selectMealPoolBasedOnMode() {
        const mealName = getMealName(currentOrder);
        if (foodPools[currentMode]) {
            currentFoodPool = foodPools[currentMode][mealName] || [];
            return;
        }

        try {
            const response = await fetch(`./food/${currentMode}.json`);
            const data = await response.json();
            // 数据去重
            for (const key in data) {
                data[key] = [...new Set(data[key])];
            }
            foodPools[currentMode] = data;
            currentFoodPool = foodPools[currentMode][mealName] || [];
        } catch (error) {
            console.error(`Error loading ${currentMode}.json:`, error);
            currentFoodPool = []; // 出错时清空
        }
    }

    function triggerRandomFoodDisplay() {
        if (!currentFoodPool || currentFoodPool.length === 0) {
            what.textContent = "没得选";
            punctuation.textContent = "QAQ";
            if (isPlaying) handleStartStop(); // 自动停止
            return;
        }

        function displayRandomFood() {
            const foodItem = currentFoodPool[Math.floor(Math.random() * currentFoodPool.length)];
            what.textContent = foodItem;
            
            const tempElement = document.createElement("span");
            tempElement.className = "temp";
            tempElement.textContent = foodItem;
            tempElement.style.top = `${Math.random() * screenHeight}px`;
            tempElement.style.left = `${Math.random() * (screenWidth - 50)}px`;
            tempElement.style.fontSize = `${Math.floor(Math.random() * (37 - 14 + 1)) + 14}px`;
            tempElement.style.color = `rgba(0,0,0,${(Math.random() * 0.4 + 0.3).toFixed(1)})`;
            tempContainer.append(tempElement);
            
            randomTimeout = setTimeout(displayRandomFood, 60);
        }
        displayRandomFood();
    }

    // --- UI/UX 辅助函数 ---
    function updateMealForCurrentOrder(order) {
        const mealTimes = ["早饭", "午饭", "晚饭"];
        if (!isPlaying) {
            timeSpan.textContent = mealTimes[order];
            resetTitle();
            resetCount = 0;
            if (tip) {
                tip.style.display = 'block';
                setTimeout(() => tip && (tip.style.display = 'none'), 4000);
            }
        }
    }

    function resetTitle() {
        document.querySelectorAll(".today, .time, .eat").forEach(el => el.style.display = 'inline');
        what.textContent = "什么";
        punctuation.textContent = "？";
        title.classList.add("shake");
    }

    function handleTeases(count) {
        if (count === 2) tease("我就知道你会换一个");
        if (count === 5) tease("再换，再换我就把你吃掉！");
    }

    function tease(message) {
        const comment = document.createElement("div");
        comment.className = "comment";
        comment.textContent = message;
        comment.addEventListener("animationend", () => comment.remove());
        body.append(comment);
    }

    // --- 启动 ---
    initialize();
});