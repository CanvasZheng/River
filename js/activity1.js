// 游戏状态
let gameState = {
    leftAdults: 10,
    rightAdults: 0,
    childA: 'left',  // 少年A的位置：'left' 或 'right'
    childB: 'left',  // 少年B的位置：'left' 或 'right'
    boatPosition: 'left',
    selectedPeople: [],
    tripCount: 0,
    isAnimating: false,
    isInitialLoad: true,  // 标记是否为初次加载
    isAutoPlaying: false,  // 标记是否正在自动演示
    shouldStopAuto: false,  // 标记是否应该停止自动演示
    pendingRestart: false,
    actionVersion: 0,
    records: [],
    revealedLoopStep: 0,
    activeLoopStep: 0
};

// 初始化游戏
function initGame() {
    // 设置船的初始位置 - 在左岸
    const boatWrapper = document.getElementById('boatWrapper');
    if (boatWrapper) {
        boatWrapper.style.transform = 'translateX(-150px)';
    }
    
    renderPeople();
    updateStats();
    updateLoopSteps();
    setLoopGuideVisible(false);
    showMessage('点击人物选择上船，然后点击"过河"按钮', 'info');
    
    // 600ms后关闭初始加载标记（动画完成后）
    setTimeout(() => {
        gameState.isInitialLoad = false;
    }, 600);
}

// 渲染人物
function renderPeople() {
    const leftBank = document.getElementById('leftBank');
    const rightBank = document.getElementById('rightBank');
    
    leftBank.innerHTML = '';
    rightBank.innerHTML = '';
    
    // 左岸成年人
    for (let i = 1; i <= gameState.leftAdults; i++) {
        const person = createPerson('adult', i, 'left');
        // 检查是否被选中
        if (gameState.selectedPeople.some(p => p.type === 'adult' && p.id === i)) {
            person.classList.add('selected');
        }
        leftBank.appendChild(person);
    }
    
    // 左岸少年
    if (gameState.childA === 'left') {
        const person = createPerson('child', 'A', 'left');
        if (gameState.selectedPeople.some(p => p.type === 'child' && p.id === 'A')) {
            person.classList.add('selected');
        }
        leftBank.appendChild(person);
    }
    if (gameState.childB === 'left') {
        const person = createPerson('child', 'B', 'left');
        if (gameState.selectedPeople.some(p => p.type === 'child' && p.id === 'B')) {
            person.classList.add('selected');
        }
        leftBank.appendChild(person);
    }
    
    // 右岸成年人
    for (let i = 1; i <= gameState.rightAdults; i++) {
        const person = createPerson('adult', i, 'right');
        if (gameState.selectedPeople.some(p => p.type === 'adult' && p.id === i)) {
            person.classList.add('selected');
        }
        rightBank.appendChild(person);
    }
    
    // 右岸少年
    if (gameState.childA === 'right') {
        const person = createPerson('child', 'A', 'right');
        if (gameState.selectedPeople.some(p => p.type === 'child' && p.id === 'A')) {
            person.classList.add('selected');
        }
        rightBank.appendChild(person);
    }
    if (gameState.childB === 'right') {
        const person = createPerson('child', 'B', 'right');
        if (gameState.selectedPeople.some(p => p.type === 'child' && p.id === 'B')) {
            person.classList.add('selected');
        }
        rightBank.appendChild(person);
    }
    
    // 动态调整左右岸的大小
    adjustShoreSize();
}

// 动态调整左右岸区域大小
function adjustShoreSize() {
    const leftShore = document.querySelector('.left-shore');
    const rightShore = document.querySelector('.right-shore');
    
    if (!leftShore || !rightShore) return;
    
    // 计算左右岸的人数
    const leftCount = gameState.leftAdults + (gameState.childA === 'left' ? 1 : 0) + (gameState.childB === 'left' ? 1 : 0);
    const rightCount = gameState.rightAdults + (gameState.childA === 'right' ? 1 : 0) + (gameState.childB === 'right' ? 1 : 0);
    const totalCount = leftCount + rightCount;
    
    // 如果总人数为0，保持默认比例
    if (totalCount === 0) {
        leftShore.style.flex = '1';
        rightShore.style.flex = '1';
        return;
    }
    
    // 计算比例，但设置最小值为0.5，最大值为2
    // 这样即使一边没人，也不会完全消失
    let leftFlex = Math.max(0.5, Math.min(2, leftCount / 6));
    let rightFlex = Math.max(0.5, Math.min(2, rightCount / 6));
    
    // 如果一边人数为0，给它最小空间
    if (leftCount === 0) leftFlex = 0.3;
    if (rightCount === 0) rightFlex = 0.3;
    
    leftShore.style.flex = leftFlex;
    rightShore.style.flex = rightFlex;
}

// 创建人物元素
function createPerson(type, id, position) {
    const person = document.createElement('div');
    person.className = `person ${type}`;
    
    // 只在初次加载时添加动画类
    if (gameState.isInitialLoad) {
        person.classList.add('initial-load');
    }
    
    person.dataset.type = type;
    person.dataset.id = id;
    person.dataset.position = position;
    
    const img = document.createElement('img');
    img.src = type === 'adult' ? '../images/adult.png' : 
              (id === 'A' ? '../images/child1.png' : '../images/child2.png');
    img.alt = type === 'adult' ? '成年人' : `少年${id}`;
    person.appendChild(img);
    
    // 添加标签
    if (type === 'child') {
        const label = document.createElement('div');
        label.className = 'person-label';
        label.textContent = `少年${id}`;
        person.appendChild(label);
    }
    
    // 所有人物都可以点击
    person.style.cursor = 'pointer';
    person.addEventListener('click', () => selectPerson(person));
    
    return person;
}

function restoreGameState(updateStatsDisplay = true, clearRecords = true, resetLoopSteps = true) {
    gameState.leftAdults = 10;
    gameState.rightAdults = 0;
    gameState.childA = 'left';
    gameState.childB = 'left';
    gameState.boatPosition = 'left';
    gameState.selectedPeople = [];
    gameState.tripCount = 0;
    gameState.isAnimating = false;
    gameState.isInitialLoad = false;
    gameState.isAutoPlaying = false;
    
    const boatWrapper = document.getElementById('boatWrapper');
    if (boatWrapper) {
        boatWrapper.style.transform = 'translateX(-150px)';
    }
    
    renderPeople();
    updateBoatDisplay();
    
    if (updateStatsDisplay) {
        updateStats();
    }
    
    if (clearRecords) {
        gameState.records = [];
        updateRecordDisplay();
    }
    
    if (resetLoopSteps) {
        gameState.revealedLoopStep = 0;
        gameState.activeLoopStep = 0;
        updateLoopSteps();
    }
}

function prepareRestartIfNeeded() {
    if (!gameState.pendingRestart) {
        return;
    }
    
    restoreGameState(true);
    gameState.pendingRestart = false;
    gameState.shouldStopAuto = false;
    setLoopGuideVisible(false);
}

function shouldAbortCurrentAction(actionVersion) {
    return actionVersion !== gameState.actionVersion || gameState.shouldStopAuto;
}

function setLoopGuideVisible(visible) {
    const loopGuide = document.getElementById('loopGuide');
    
    if (!loopGuide) {
        return;
    }
    
    loopGuide.style.display = visible ? 'block' : 'none';
}

function getLoopStepTitle(step, people = [], isActive = false) {
    const defaultTitles = {
        1: '第1步：2个少年过河',
        2: '第2步：1个少年回来',
        3: '第3步：1个成年人过河',
        4: '第4步：另1个少年回来'
    };
    
    if (!isActive || (step !== 2 && step !== 4) || people.length === 0) {
        return defaultTitles[step];
    }
    
    return `第${step}步：${getPersonText(people[0])}回来`;
}

function updateLoopSteps(currentStep = 0, currentPeople = []) {
    const stepTags = document.querySelectorAll('.loop-step-tag');
    const revealedStep = Math.max(gameState.revealedLoopStep, currentStep);
    
    if (currentStep > 0) {
        gameState.revealedLoopStep = revealedStep;
    }
    gameState.activeLoopStep = currentStep;
    
    stepTags.forEach(tag => {
        const step = Number(tag.dataset.step);
        const isVisible = step <= gameState.revealedLoopStep;
        const isActive = step === gameState.activeLoopStep && isVisible;
        
        tag.textContent = getLoopStepTitle(step, currentPeople, isActive);
        tag.classList.toggle('visible', isVisible);
        tag.classList.toggle('active', isActive);
    });
}

function getPersonText(person) {
    if (person.type === 'adult') {
        return '1个成年人';
    }
    
    return `少年${person.id}`;
}

function getPeopleText(people) {
    if (people.length === 2 && people.every(person => person.type === 'child')) {
        return '2个少年';
    }
    
    return people.map(getPersonText).join('和');
}

function getLoopStepInfo(stepNumber) {
    const round = Math.ceil(stepNumber / 4);
    const stepInRound = ((stepNumber - 1) % 4) + 1;
    
    return {
        round,
        stepInRound
    };
}

function getRecordLabel(stepInRound, people, to) {
    if (stepInRound === 1) {
        return '先把2个少年送到对岸';
    }
    
    if (stepInRound === 3) {
        return '接着送1个成年人过河';
    }
    
    const personText = people.length > 0 ? getPersonText(people[0]) : '1个少年';
    
    if (to === '左岸') {
        return `让${personText}划船回来`;
    }
    
    return `${personText}继续过河`;
}

function addCrossingRecord(people, from, to) {
    const loopInfo = getLoopStepInfo(gameState.tripCount);
    const recordText = `${getPeopleText(people)}从${from}到${to}`;
    gameState.records.push({
        step: gameState.tripCount,
        round: loopInfo.round,
        stepInRound: loopInfo.stepInRound,
        label: getRecordLabel(loopInfo.stepInRound, people, to),
        text: recordText
    });
    updateRecordDisplay();
}

function updateRecordDisplay() {
    const recordList = document.getElementById('crossingRecords');
    
    if (!recordList) {
        return;
    }
    
    if (gameState.records.length === 0) {
        recordList.innerHTML = '<div class="record-empty">开始过河后，这里会自动记录每一步。</div>';
        return;
    }
    
    const groupedRecords = gameState.records.reduce((groups, record) => {
        if (!groups[record.round]) {
            groups[record.round] = [];
        }
        groups[record.round].push(record);
        return groups;
    }, {});
    
    recordList.innerHTML = Object.entries(groupedRecords).map(([round, records]) => `
        <div class="round-group">
            <div class="round-header">第${round}轮循环</div>
            <div class="round-subtitle">这一轮的目标：帮助1个成年人成功过河</div>
            ${records.map(record => `
                <div class="record-item">
                    <div class="record-step">第${record.stepInRound}步</div>
                    <div class="record-main">
                        <div class="record-label">${record.label}</div>
                        <div class="record-text">${record.text}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');
    
    recordList.scrollTop = recordList.scrollHeight;
}

// 选择人物
function selectPerson(personElement) {
    if (gameState.isAnimating) return;
    
    if (gameState.pendingRestart) {
        showMessage('⏹️ 已停止，请点击“过河”或“自动演示”重新开始。', 'info');
        return;
    }
    
    const type = personElement.dataset.type;
    const id = personElement.dataset.id;
    const key = `${type}-${id}`;
    
    // 获取人物的位置
    let personPosition;
    if (type === 'adult') {
        personPosition = personElement.dataset.position;
    } else {
        // 少年的位置从gameState中获取
        personPosition = id === 'A' ? gameState.childA : gameState.childB;
    }
    
    // 检查是否已选中
    const index = gameState.selectedPeople.findIndex(p => `${p.type}-${p.id}` === key);
    
    if (index >= 0) {
        // 取消选中
        gameState.selectedPeople.splice(index, 1);
        personElement.classList.remove('selected');
    } else {
        // 检查人物是否在船的同侧
        if (personPosition !== gameState.boatPosition) {
            showMessage('⚠️ 只能选择船同侧的人物！', 'error');
            return;
        }
        
        // 检查是否可以添加
        if (!canAddPerson(type)) {
            showMessage('⚠️ 船已满！船最多载2个少年或1个成年人', 'error');
            return;
        }
        
        // 选中
        gameState.selectedPeople.push({ type, id });
        personElement.classList.add('selected');
    }
    
    updateBoatDisplay();
}

// 检查是否可以添加人物
function canAddPerson(type) {
    const adults = gameState.selectedPeople.filter(p => p.type === 'adult').length;
    const children = gameState.selectedPeople.filter(p => p.type === 'child').length;
    
    if (type === 'adult') {
        // 成年人只能单独坐船
        return adults === 0 && children === 0;
    } else {
        // 少年最多2个，且不能和成年人一起
        return adults === 0 && children < 2;
    }
}

// 更新船上显示
function updateBoatDisplay() {
    const boatPeople = document.getElementById('boatPeople');
    const boatImg = document.querySelector('.boat-img');
    
    // 清空船上人物显示（因为现在人物在船图片里）
    boatPeople.innerHTML = '';
    
    // 根据船上人物类型切换船的图片
    if (gameState.selectedPeople.length === 0) {
        // 空船
        boatImg.src = '../images/boat.png';
    } else if (gameState.selectedPeople.length === 1) {
        const person = gameState.selectedPeople[0];
        if (person.type === 'adult') {
            // 成年人划船
            boatImg.src = '../images/boat-adult.png';
        } else {
            // 单个少年划船
            if (person.id === 'A') {
                boatImg.src = '../images/boat-childA.png';
            } else {
                boatImg.src = '../images/boat-childB.png';
            }
        }
    } else if (gameState.selectedPeople.length === 2) {
        // 两个少年同时划船
        boatImg.src = '../images/boat-children.png';
    }
}

// 过河
async function crossRiver() {
    prepareRestartIfNeeded();
    setLoopGuideVisible(false);
    
    if (gameState.isAnimating) return;
    
    if (gameState.selectedPeople.length === 0) {
        showMessage('⚠️ 请先选择要上船的人！', 'error');
        return;
    }
    
    const currentLoopInfo = getLoopStepInfo(gameState.tripCount + 1);
    updateLoopSteps(currentLoopInfo.stepInRound, gameState.selectedPeople);
    
    gameState.isAnimating = true;
    const actionVersion = gameState.actionVersion;
    
    const boatWrapper = document.getElementById('boatWrapper');
    const targetPosition = gameState.boatPosition === 'left' ? 'right' : 'left';
    const fromText = gameState.boatPosition === 'left' ? '左岸' : '右岸';
    const toText = targetPosition === 'left' ? '左岸' : '右岸';
    const movingPeople = gameState.selectedPeople.map(person => ({ ...person }));
    
    showMessage('🚣 正在过河...', 'info');
    
    // 船移动动画 - 左右滑动，不翻转
    if (targetPosition === 'right') {
        // 从左岸到右岸：向右滑动到右边
        boatWrapper.style.transform = 'translateX(150px)';
    } else {
        // 从右岸到左岸：向左滑动到左边
        boatWrapper.style.transform = 'translateX(-150px)';
    }
    
    await sleep(1500);
    
    if (shouldAbortCurrentAction(actionVersion)) {
        return;
    }
    
    // 更新状态 - 移动选中的人物
    gameState.selectedPeople.forEach(person => {
        if (person.type === 'adult') {
            if (gameState.boatPosition === 'left') {
                gameState.leftAdults--;
                gameState.rightAdults++;
            } else {
                gameState.rightAdults--;
                gameState.leftAdults++;
            }
        } else {
            // 少年A或B
            if (person.id === 'A') {
                gameState.childA = targetPosition;
            } else if (person.id === 'B') {
                gameState.childB = targetPosition;
            }
        }
    });
    
    gameState.boatPosition = targetPosition;
    gameState.selectedPeople = [];
    gameState.tripCount++;
    addCrossingRecord(movingPeople, fromText, toText);
    
    // 重新渲染
    renderPeople();
    updateBoatDisplay();
    updateStats();
    
    await sleep(500);
    
    if (shouldAbortCurrentAction(actionVersion)) {
        return;
    }
    
    checkGameState();
    
    gameState.isAnimating = false;
}

// 检查游戏状态
function checkGameState() {
    if (gameState.rightAdults === 10 && gameState.childA === 'right' && gameState.childB === 'right' && gameState.boatPosition === 'right') {
        showMessage(`🎉 恭喜！所有人都成功过河了！共用了 ${gameState.tripCount} 次过河。`, 'success');
        return;
    }
    
    showMessage('继续选择人物过河...', 'info');
}

// 更新统计信息
function updateStats() {
    document.getElementById('crossedCount').textContent = gameState.rightAdults;
    document.getElementById('tripCount').textContent = gameState.tripCount;
    document.getElementById('boatPos').textContent = gameState.boatPosition === 'left' ? '左岸' : '右岸';
}

// 显示消息
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('gameMessage');
    messageDiv.textContent = message;
    messageDiv.className = 'game-message ' + type;
}

// 重置游戏
function resetGame() {
    const shouldShowLoopGuide = gameState.rightAdults >= 1;
    
    gameState.actionVersion++;
    gameState.shouldStopAuto = true;
    gameState.pendingRestart = true;
    
    restoreGameState(false, false, false);
    setLoopGuideVisible(shouldShowLoopGuide);
    showMessage('⏹️ 已全部停止，再点击“过河”或“自动演示”会重新开始。', 'info');
}

// 自动演示
async function autoDemo() {
    prepareRestartIfNeeded();
    setLoopGuideVisible(false);
    
    if (gameState.isAnimating || gameState.isAutoPlaying) {
        showMessage('⚠️ 请等待当前操作完成', 'error');
        return;
    }
    
    // 标记开始自动演示
    gameState.actionVersion++;
    gameState.isAutoPlaying = true;
    gameState.shouldStopAuto = false;
    const actionVersion = gameState.actionVersion;
    
    // 重置游戏状态（不调用resetGame函数，直接重置）
    restoreGameState(true);
    gameState.isAutoPlaying = true;
    
    await sleep(1000);
    
    // 检查是否应该停止
    if (shouldAbortCurrentAction(actionVersion)) {
        gameState.isAutoPlaying = false;
        return;
    }
    
    showMessage('🎬 开始自动演示...', 'info');
    await sleep(1500);
    
    // 演示1个成年人过河的完整过程
    for (let i = 0; i < 10; i++) {
        // 每个步骤前检查是否应该停止
        if (shouldAbortCurrentAction(actionVersion)) {
            gameState.isAutoPlaying = false;
            return;
        }
        
        if (gameState.rightAdults === 10) break;
        
        // 步骤1：2个少年到右岸
        await autoSelect(['child-A', 'child-B']);
        if (shouldAbortCurrentAction(actionVersion)) {
            gameState.isAutoPlaying = false;
            return;
        }
        await crossRiver();
        if (shouldAbortCurrentAction(actionVersion)) {
            gameState.isAutoPlaying = false;
            return;
        }
        await sleep(1000);
        
        // 步骤2：少年A返回
        if (shouldAbortCurrentAction(actionVersion)) {
            gameState.isAutoPlaying = false;
            return;
        }
        await autoSelect(['child-A']);
        if (shouldAbortCurrentAction(actionVersion)) {
            gameState.isAutoPlaying = false;
            return;
        }
        await crossRiver();
        if (shouldAbortCurrentAction(actionVersion)) {
            gameState.isAutoPlaying = false;
            return;
        }
        await sleep(1000);
        
        // 步骤3：1个成年人到右岸
        if (shouldAbortCurrentAction(actionVersion)) {
            gameState.isAutoPlaying = false;
            return;
        }
        await autoSelect(['adult-1']);
        if (shouldAbortCurrentAction(actionVersion)) {
            gameState.isAutoPlaying = false;
            return;
        }
        await crossRiver();
        if (shouldAbortCurrentAction(actionVersion)) {
            gameState.isAutoPlaying = false;
            return;
        }
        await sleep(1000);
        
        // 步骤4：少年B返回
        if (shouldAbortCurrentAction(actionVersion)) {
            gameState.isAutoPlaying = false;
            return;
        }
        await autoSelect(['child-B']);
        if (shouldAbortCurrentAction(actionVersion)) {
            gameState.isAutoPlaying = false;
            return;
        }
        await crossRiver();
        if (shouldAbortCurrentAction(actionVersion)) {
            gameState.isAutoPlaying = false;
            return;
        }
        await sleep(1000);
    }
    
    // 演示完成，解除标记
    gameState.isAutoPlaying = false;
}

// 自动选择人物
async function autoSelect(people) {
    gameState.selectedPeople = [];
    
    people.forEach(personKey => {
        const [type, id] = personKey.split('-');
        if (type === 'child') {
            // 检查少年A或B是否在船的同侧
            if (id === 'A' && gameState.childA === gameState.boatPosition) {
                gameState.selectedPeople.push({ type: 'child', id: 'A' });
            } else if (id === 'B' && gameState.childB === gameState.boatPosition) {
                gameState.selectedPeople.push({ type: 'child', id: 'B' });
            }
        } else if (type === 'adult') {
            if (gameState.boatPosition === 'left' && gameState.leftAdults > 0) {
                gameState.selectedPeople.push({ type: 'adult', id: gameState.leftAdults });
            } else if (gameState.boatPosition === 'right' && gameState.rightAdults > 0) {
                gameState.selectedPeople.push({ type: 'adult', id: 1 });
            }
        }
    });
    
    // 重新渲染以显示选中状态（人物从岸上消失）
    renderPeople();
    updateBoatDisplay();
    await sleep(300);
}

// 显示答案
function showAnswer(num) {
    const answerDiv = document.getElementById(`answer${num}`);
    if (answerDiv.classList.contains('show')) {
        answerDiv.classList.remove('show');
    } else {
        answerDiv.classList.add('show');
    }
}

// 延迟函数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', initGame);
