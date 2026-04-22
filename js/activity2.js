// 显示思考答案
function showThinking(num) {
    const answerDiv = document.getElementById(`thinking${num}`);
    if (answerDiv.classList.contains('show')) {
        answerDiv.classList.remove('show');
    } else {
        answerDiv.classList.add('show');
    }
}

// 打开图片放大模态框
function openImageModal(img) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.classList.add('show');
    modalImg.src = img.src;
}

// 关闭图片放大模态框
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.classList.remove('show');
}

// 高亮流程图节点 - 使用图片切换方案
function highlightFlowchartNode(nodeId) {
    const flowchartImage = document.getElementById('flowchartImage');
    if (!flowchartImage) return;
    
    // 图片映射表
    const imageMap = {
        'highlight-start': '../images/flowchart-start.png',
        'highlight-init': '../images/flowchart-init.png',
        'highlight-check': '../images/flowchart-check.png',
        'highlight-step1': '../images/flowchart-step1.png',
        'highlight-step2': '../images/flowchart-step2.png',
        'highlight-step3': '../images/flowchart-step3.png',
        'highlight-step4': '../images/flowchart-step4.png',
        'highlight-decrease': '../images/flowchart-decrease.png',
        'highlight-end': '../images/flowchart-end.png'
    };
    
    // 切换图片
    if (nodeId && imageMap[nodeId]) {
        // 添加淡入淡出效果
        flowchartImage.style.opacity = '0.5';
        setTimeout(() => {
            flowchartImage.src = imageMap[nodeId];
            flowchartImage.style.opacity = '1';
        }, 150);
    }
}

// 模拟状态
let simState = {
    remaining: 10,
    leftAdults: 10,
    rightAdults: 0,
    childA: 'left',  // 少年A的位置
    childB: 'left',  // 少年B的位置
    boatPosition: 'left',
    selectedPeople: [],
    isAnimating: false,
    isAutoPlaying: false,
    shouldStopAuto: false,
    pendingRestart: false,
    actionVersion: 0
};

function setBoatPosition(position) {
    const boat = document.getElementById('simBoat');
    if (!boat) {
        return;
    }

    boat.classList.toggle('at-right', position === 'right');
}

function initSimulation() {
    setBoatPosition('left');
    
    updateSimDisplay();
    updateBoatDisplay();
    document.getElementById('currentStep').textContent = '开始';
    document.getElementById('simMessage').textContent = '点击“自动演示”按钮开始演示';
    highlightFlowchartNode('highlight-start');
}

function updateSimDisplay() {
    const leftDiv = document.getElementById('simLeft');
    const rightDiv = document.getElementById('simRight');
    const selectedAdults = simState.selectedPeople.filter(person => person.type === 'adult').length;
    const selectedChildren = new Set(
        simState.selectedPeople
            .filter(person => person.type === 'child')
            .map(person => person.id)
    );
    const leftAdultsToRender = simState.leftAdults - (simState.boatPosition === 'left' ? selectedAdults : 0);
    const rightAdultsToRender = simState.rightAdults - (simState.boatPosition === 'right' ? selectedAdults : 0);
    
    leftDiv.innerHTML = '';
    rightDiv.innerHTML = '';
    
    for (let i = 0; i < leftAdultsToRender; i++) {
        const person = document.createElement('div');
        person.className = 'sim-person';
        const img = document.createElement('img');
        img.src = '../images/adult.png';
        img.alt = '成年人';
        person.appendChild(img);
        leftDiv.appendChild(person);
    }
    
    if (simState.childA === 'left' && !(simState.boatPosition === 'left' && selectedChildren.has('A'))) {
        const person = document.createElement('div');
        person.className = 'sim-person';
        const img = document.createElement('img');
        img.src = '../images/child1.png';
        img.alt = '少年A';
        person.appendChild(img);
        
        const label = document.createElement('div');
        label.className = 'sim-person-label';
        label.textContent = '少年A';
        person.appendChild(label);
        
        leftDiv.appendChild(person);
    }
    
    if (simState.childB === 'left' && !(simState.boatPosition === 'left' && selectedChildren.has('B'))) {
        const person = document.createElement('div');
        person.className = 'sim-person';
        const img = document.createElement('img');
        img.src = '../images/child2.png';
        img.alt = '少年B';
        person.appendChild(img);
        
        const label = document.createElement('div');
        label.className = 'sim-person-label';
        label.textContent = '少年B';
        person.appendChild(label);
        
        leftDiv.appendChild(person);
    }
    
    for (let i = 0; i < rightAdultsToRender; i++) {
        const person = document.createElement('div');
        person.className = 'sim-person';
        const img = document.createElement('img');
        img.src = '../images/adult.png';
        img.alt = '成年人';
        person.appendChild(img);
        rightDiv.appendChild(person);
    }
    
    if (simState.childA === 'right' && !(simState.boatPosition === 'right' && selectedChildren.has('A'))) {
        const person = document.createElement('div');
        person.className = 'sim-person';
        const img = document.createElement('img');
        img.src = '../images/child1.png';
        img.alt = '少年A';
        person.appendChild(img);
        
        const label = document.createElement('div');
        label.className = 'sim-person-label';
        label.textContent = '少年A';
        person.appendChild(label);
        
        rightDiv.appendChild(person);
    }
    
    if (simState.childB === 'right' && !(simState.boatPosition === 'right' && selectedChildren.has('B'))) {
        const person = document.createElement('div');
        person.className = 'sim-person';
        const img = document.createElement('img');
        img.src = '../images/child2.png';
        img.alt = '少年B';
        person.appendChild(img);
        
        const label = document.createElement('div');
        label.className = 'sim-person-label';
        label.textContent = '少年B';
        person.appendChild(label);
        
        rightDiv.appendChild(person);
    }
    
    document.getElementById('remainingPeople').textContent = simState.remaining;
}

function updateBoatDisplay() {
    const boat = document.getElementById('simBoat');
    
    if (!boat) {
        return;
    }
    
    if (simState.selectedPeople.length === 0) {
        boat.innerHTML = '<img src="../images/boat.png" alt="空船">';
    } else if (simState.selectedPeople.length === 1) {
        const person = simState.selectedPeople[0];
        if (person.type === 'adult') {
            boat.innerHTML = '<img src="../images/boat-adult.png" alt="成年人划船">';
        } else if (person.id === 'A') {
            boat.innerHTML = '<img src="../images/boat-childA.png" alt="少年A划船">';
        } else {
            boat.innerHTML = '<img src="../images/boat-childB.png" alt="少年B划船">';
        }
    } else {
        boat.innerHTML = '<img src="../images/boat-children.png" alt="两个少年划船">';
    }
}

function restoreSimulationState(updateDisplay = true) {
    simState.remaining = 10;
    simState.leftAdults = 10;
    simState.rightAdults = 0;
    simState.childA = 'left';
    simState.childB = 'left';
    simState.boatPosition = 'left';
    simState.selectedPeople = [];
    simState.isAnimating = false;
    simState.isAutoPlaying = false;
    
    setBoatPosition('left');
    
    if (updateDisplay) {
        updateSimDisplay();
        updateBoatDisplay();
        document.getElementById('currentStep').textContent = '开始';
    }
}

function prepareRestartIfNeeded() {
    if (!simState.pendingRestart) {
        return;
    }
    
    restoreSimulationState(true);
    simState.pendingRestart = false;
    simState.shouldStopAuto = false;
}

function shouldAbortCurrentAction(actionVersion) {
    return actionVersion !== simState.actionVersion || simState.shouldStopAuto;
}

function setSimulationStatus(stepText, message, nodeId) {
    if (nodeId) {
        highlightFlowchartNode(nodeId);
    }
    document.getElementById('currentStep').textContent = stepText;
    document.getElementById('simMessage').textContent = message;
}

function getSimulationStepTitle(step, people = [], isActive = false) {
    const defaultTitles = {
        1: '步骤1：2个少年过河',
        2: '步骤2：1个少年回来',
        3: '步骤3：1个成年人过河',
        4: '步骤4：另1个少年回来'
    };
    
    if (!isActive || (step !== 2 && step !== 4) || people.length === 0) {
        return defaultTitles[step];
    }
    
    const childId = people[0].id;
    return `步骤${step}：少年${childId}回来`;
}

async function autoSelect(people) {
    simState.selectedPeople = [];
    
    people.forEach(personKey => {
        const [type, id] = personKey.split('-');
        if (type === 'child') {
            if (id === 'A' && simState.childA === simState.boatPosition) {
                simState.selectedPeople.push({ type: 'child', id: 'A' });
            } else if (id === 'B' && simState.childB === simState.boatPosition) {
                simState.selectedPeople.push({ type: 'child', id: 'B' });
            }
        } else if (type === 'adult') {
            if (simState.boatPosition === 'left' && simState.leftAdults > 0) {
                simState.selectedPeople.push({ type: 'adult', id: simState.leftAdults });
            } else if (simState.boatPosition === 'right' && simState.rightAdults > 0) {
                simState.selectedPeople.push({ type: 'adult', id: 1 });
            }
        }
    });
    
    updateSimDisplay();
    updateBoatDisplay();
    await sleep(300);
}

async function crossRiver(nodeId, stepNumber, actionVersion) {
    const people = simState.selectedPeople.map(person => ({ ...person }));
    
    setSimulationStatus(
        getSimulationStepTitle(stepNumber, people, true),
        `🚣 ${getCrossingMessage(people, false)}`,
        nodeId
    );
    
    if (shouldAbortCurrentAction(actionVersion)) {
        return false;
    }
    
    await sleep(500);
    
    if (shouldAbortCurrentAction(actionVersion)) {
        return false;
    }
    
    const targetPosition = simState.boatPosition === 'left' ? 'right' : 'left';
    setBoatPosition(targetPosition);
    
    setSimulationStatus(
        getSimulationStepTitle(stepNumber, people, true),
        `🚣 ${getCrossingMessage(people, true)}`,
        nodeId
    );
    
    await sleep(1500);
    
    if (shouldAbortCurrentAction(actionVersion)) {
        return false;
    }
    
    simState.selectedPeople.forEach(person => {
        if (person.type === 'adult') {
            if (simState.boatPosition === 'left') {
                simState.leftAdults--;
                simState.rightAdults++;
            } else {
                simState.rightAdults--;
                simState.leftAdults++;
            }
        } else if (person.id === 'A') {
            simState.childA = targetPosition;
        } else {
            simState.childB = targetPosition;
        }
    });
    
    simState.boatPosition = targetPosition;
    simState.selectedPeople = [];
    updateSimDisplay();
    updateBoatDisplay();
    
    await sleep(500);
    
    if (shouldAbortCurrentAction(actionVersion)) {
        return false;
    }
    
    return true;
}

function getCrossingMessage(people, isMoving) {
    if (people.length === 2) {
        return isMoving ? '2个少年划船到对岸...' : '2个少年上船准备过河...';
    }
    
    const person = people[0];
    if (!person) {
        return isMoving ? '正在过河...' : '正在准备...';
    }
    
    if (person.type === 'adult') {
        return isMoving ? '成年人划船到右岸...' : '成年人上船准备过河...';
    }
    
    const directionText = simState.boatPosition === 'right' ? '回来...' : '到右岸...';
    const prepareText = simState.boatPosition === 'right' ? '上船准备返回...' : '上船准备过河...';
    return isMoving ? `少年${person.id}划船${directionText}` : `少年${person.id}${prepareText}`;
}

async function startSimulation() {
    prepareRestartIfNeeded();
    
    if (simState.isAnimating || simState.isAutoPlaying) {
        document.getElementById('simMessage').textContent = '⚠️ 请等待当前操作完成';
        return;
    }
    
    simState.actionVersion++;
    simState.isAutoPlaying = true;
    simState.shouldStopAuto = false;
    const actionVersion = simState.actionVersion;
    
    restoreSimulationState(true);
    simState.isAutoPlaying = true;
    
    setSimulationStatus('开始', '🎬 开始自动演示...', 'highlight-start');
    await sleep(1000);
    
    if (shouldAbortCurrentAction(actionVersion)) {
        simState.isAutoPlaying = false;
        return;
    }
    
    setSimulationStatus('初始化', '📝 设置待过河人数 = 10', 'highlight-init');
    await sleep(1500);
    
    if (shouldAbortCurrentAction(actionVersion)) {
        simState.isAutoPlaying = false;
        return;
    }
    
    while (simState.remaining > 0) {
        if (shouldAbortCurrentAction(actionVersion)) {
            simState.isAutoPlaying = false;
            return;
        }
        
        setSimulationStatus(
            '判断条件',
            `❓ 检查：待过河人数(${simState.remaining}) > 0？是的，继续循环`,
            'highlight-check'
        );
        await sleep(1500);
        
        if (shouldAbortCurrentAction(actionVersion)) {
            simState.isAutoPlaying = false;
            return;
        }
        
        await autoSelect(['child-A', 'child-B']);
        if (!(await crossRiver('highlight-step1', 1, actionVersion))) {
            simState.isAutoPlaying = false;
            return;
        }
        await sleep(1000);
        
        if (shouldAbortCurrentAction(actionVersion)) {
            simState.isAutoPlaying = false;
            return;
        }
        
        await autoSelect(['child-A']);
        if (!(await crossRiver('highlight-step2', 2, actionVersion))) {
            simState.isAutoPlaying = false;
            return;
        }
        await sleep(1000);
        
        if (shouldAbortCurrentAction(actionVersion)) {
            simState.isAutoPlaying = false;
            return;
        }
        
        await autoSelect(['adult-1']);
        if (!(await crossRiver('highlight-step3', 3, actionVersion))) {
            simState.isAutoPlaying = false;
            return;
        }
        await sleep(1000);
        
        if (shouldAbortCurrentAction(actionVersion)) {
            simState.isAutoPlaying = false;
            return;
        }
        
        await autoSelect(['child-B']);
        if (!(await crossRiver('highlight-step4', 4, actionVersion))) {
            simState.isAutoPlaying = false;
            return;
        }
        await sleep(1000);
        
        if (shouldAbortCurrentAction(actionVersion)) {
            simState.isAutoPlaying = false;
            return;
        }
        
        simState.remaining--;
        updateSimDisplay();
        setSimulationStatus(
            '更新计数',
            `✅ 待过河人数减1，还剩 ${simState.remaining} 人`,
            'highlight-decrease'
        );
        await sleep(1500);
    }
    
    setSimulationStatus('结束', '🎉 恭喜！所有人都成功过河了！', 'highlight-end');
    updateBoatDisplay();
    simState.isAutoPlaying = false;
}

function resetSimulation() {
    simState.actionVersion++;
    simState.shouldStopAuto = true;
    simState.pendingRestart = true;
    
    restoreSimulationState(true);
    simState.pendingRestart = true;
    document.getElementById('simMessage').textContent = '⏹️ 已全部停止，再点击“自动演示”会重新开始。';
    highlightFlowchartNode('highlight-start');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.addEventListener('DOMContentLoaded', initSimulation);
