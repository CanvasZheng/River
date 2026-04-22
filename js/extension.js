// 游戏状态
let gameState = {
    hunterPosition: 'left',
    wolfPosition: 'left',
    sheepPosition: 'left',
    cabbagePosition: 'left',
    selectedItem: null,
    stepCount: 0,
    gameOver: false,
    isAnimating: false
};

// 显示提示
function showHint() {
    const hintBox = document.getElementById('hintBox');
    if (hintBox.classList.contains('show')) {
        hintBox.classList.remove('show');
    } else {
        hintBox.classList.add('show');
    }
}

function getItemName(item) {
    const names = {
        'wolf': '狼',
        'sheep': '羊',
        'cabbage': '白菜',
        'none': '只有猎人'
    };
    return names[item] || '';
}

function getBoatImage(item) {
    if (item === 'wolf') {
        return '../images/boat-hunter-wolf.png';
    }
    if (item === 'sheep') {
        return '../images/boat-hunter-sheep.png';
    }
    if (item === 'cabbage') {
        return '../images/boat-hunter-cabbage.png';
    }
    return '../images/boat-hunte.png';
}

function getItemImage(item) {
    const imageMap = {
        wolf: '../images/wolf.png',
        sheep: '../images/sheep.png',
        cabbage: '../images/cabbage.png'
    };
    return imageMap[item];
}

function getBoatTranslate(position) {
    return position === 'left' ? 'translateX(-65px)' : 'translateX(65px)';
}

function createBankItem(item) {
    const element = document.createElement('div');
    element.className = `item ${item}`;
    element.dataset.item = item;
    element.innerHTML = `<img src="${getItemImage(item)}" alt="${getItemName(item)}">`;
    element.addEventListener('click', () => handleItemClick(item));
    return element;
}

function handleItemClick(item) {
    if (gameState.gameOver) {
        updateStatus('游戏已结束，请重新开始！');
        return;
    }
    
    if (gameState.isAnimating) {
        return;
    }
    
    if (gameState[item + 'Position'] !== gameState.hunterPosition) {
        updateStatus('⚠️ 只能点击猎人这一岸的物品！');
        return;
    }
    
    startCrossing(item);
}

function handleBoatClick() {
    if (gameState.gameOver) {
        updateStatus('游戏已结束，请重新开始！');
        return;
    }
    
    if (gameState.isAnimating) {
        return;
    }
    
    startCrossing('none');
}

async function startCrossing(item) {
    gameState.selectedItem = item;
    gameState.isAnimating = true;
    updateDisplay();
    
    updateStatus(item === 'none' ? '🚣 猎人独自上船准备过河...' : `🚣 猎人带着${getItemName(item)}上船准备过河...`);
    await sleep(250);
    
    animateBoat();
    updateStatus(item === 'none' ? '🚣 猎人独自划船过河...' : `🚣 猎人带着${getItemName(item)}划船过河...`);
    await sleep(1500);
    
    const targetPosition = gameState.hunterPosition === 'left' ? 'right' : 'left';
    gameState.hunterPosition = targetPosition;
    if (item !== 'none') {
        gameState[item + 'Position'] = targetPosition;
    }
    gameState.stepCount++;
    gameState.selectedItem = null;
    gameState.isAnimating = false;
    updateDisplay();
    await sleep(300);
    checkGameState();
}

function animateBoat() {
    const boat = document.getElementById('gameBoat');
    const targetPosition = gameState.hunterPosition === 'left' ? 'right' : 'left';
    
    boat.style.transform = getBoatTranslate(targetPosition);
}

function updateDisplay() {
    const leftBank = document.getElementById('leftBank');
    const rightBank = document.getElementById('rightBank');
    const boat = document.getElementById('gameBoat');
    const boatContent = document.getElementById('boatContent');
    
    leftBank.innerHTML = '';
    rightBank.innerHTML = '';
    boatContent.innerHTML = `<img src="${getBoatImage(gameState.selectedItem)}" alt="小船">`;
    
    ['wolf', 'sheep', 'cabbage'].forEach(item => {
        const position = gameState[item + 'Position'];
        const isBoarding = gameState.isAnimating && gameState.selectedItem === item && position === gameState.hunterPosition;
        if (isBoarding) {
            return;
        }
        const targetBank = position === 'left' ? leftBank : rightBank;
        targetBank.appendChild(createBankItem(item));
    });
    
    boat.style.transform = getBoatTranslate(gameState.hunterPosition);
    boat.classList.toggle('is-moving', gameState.isAnimating);
    
    document.getElementById('stepCount').textContent = gameState.stepCount;
}

// 检查游戏状态
function checkGameState() {
    // 检查是否获胜
    if (gameState.wolfPosition === 'right' && 
        gameState.sheepPosition === 'right' && 
        gameState.cabbagePosition === 'right' &&
        gameState.hunterPosition === 'right') {
        updateStatus(`🎉 恭喜！你成功帮助猎人把所有东西都运到了对岸！共用了 ${gameState.stepCount} 步。`);
        gameState.gameOver = true;
        return;
    }
    
    // 检查危险情况
    // 狼和羊在一起，猎人不在
    if (gameState.wolfPosition === gameState.sheepPosition && 
        gameState.hunterPosition !== gameState.wolfPosition) {
        updateStatus('❌ 糟糕！狼把羊吃掉了！请重新开始。');
        gameState.gameOver = true;
        return;
    }
    
    // 羊和白菜在一起，猎人不在
    if (gameState.sheepPosition === gameState.cabbagePosition && 
        gameState.hunterPosition !== gameState.sheepPosition) {
        updateStatus('❌ 糟糕！羊把白菜吃掉了！请重新开始。');
        gameState.gameOver = true;
        return;
    }
    
    updateStatus('继续点击这一岸的物品过河，或点击小船让猎人单独过河。');
}

// 更新状态信息
function updateStatus(message) {
    document.getElementById('statusMessage').textContent = message;
}

// 重置游戏
function resetGame() {
    gameState = {
        hunterPosition: 'left',
        wolfPosition: 'left',
        sheepPosition: 'left',
        cabbagePosition: 'left',
        selectedItem: null,
        stepCount: 0,
        gameOver: false,
        isAnimating: false
    };
    
    updateDisplay();
    updateStatus('点击岸上的物品过河，或点击小船让猎人单独过河');
}

// 显示解决方案
function revealSolution() {
    const solutionSteps = document.getElementById('solutionSteps');
    if (solutionSteps.classList.contains('show')) {
        solutionSteps.classList.remove('show');
    } else {
        solutionSteps.classList.add('show');
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('gameBoat').addEventListener('click', handleBoatClick);
    updateDisplay();
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
