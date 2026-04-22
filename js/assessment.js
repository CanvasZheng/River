// 测试答案（根据课本内容设计）
const answers = {
    q1: 'B',  // 把大问题分解成小问题
    q2: 'B',  // 1个成年人过河的方法
    q3: 'C',  // 菱形表示判断
    q4: 'A',  // 循环可以重复执行
    q5: 'B',  // 需要4个步骤
    q6: 'A',  // 可以解决20人问题
};

// 反馈内容
const feedbacks = {
    q1: {
        correct: '✅ 回答正确！',
        incorrect: '❌ 再想想',
        explanation: '把大问题分解成小问题，可以让复杂的任务变得更容易理解和解决。课本中提到，10个人过河的大问题，可以分解成"1个成年人过河"的小问题。'
    },
    q2: {
        correct: '✅ 回答正确！',
        incorrect: '❌ 再想想',
        explanation: '课本中明确指出：关键是找到让1个成年人过河的方法。找到这个方法后，其他成年人就可以用相同的方法过河了。这就是问题分解的核心思想。'
    },
    q3: {
        correct: '✅ 回答正确！',
        incorrect: '❌ 再想想',
        explanation: '在流程图中，菱形符号用来表示判断条件，比如"将过河人数>0？"。椭圆形表示开始/结束，矩形表示处理步骤，箭头表示流程方向。'
    },
    q4: {
        correct: '✅ 回答正确！',
        incorrect: '❌ 再想想',
        explanation: '循环结构确实可以让相同的步骤重复执行。课本中的流程图显示，让1个成年人过河的4个步骤会重复执行10次，直到所有人都过河。'
    },
    q5: {
        correct: '✅ 回答正确！',
        incorrect: '❌ 再想想',
        explanation: '根据课本，让1个成年人过河需要4个步骤：①2个少年到对岸 ②少年A回来 ③成年人到对岸 ④少年B回来。这样2个少年又回到了左岸，可以继续帮助下一个成年人。'
    },
    q6: {
        correct: '✅ 回答正确！',
        incorrect: '❌ 再想想',
        explanation: '课本中提到：如果修改流程图中的初始值，把"将过河人数=10"改为"将过河人数=20"，就可以解决20个成年人过河的问题。这就是算法的通用性。'
    }
};

// 评价状态
let evaluationState = {
    goal1: 0,
    goal2: 0,
    testScore: 0,
    testSubmitted: false
};

function getCertificateElements() {
    return {
        prompt: document.querySelector('.certificate-prompt'),
        form: document.getElementById('certificateForm'),
        display: document.getElementById('certificateDisplay'),
        certificate: document.getElementById('certificate'),
        nameInput: document.getElementById('studentName')
    };
}

function setCertificateVisibility(canGenerate) {
    const { prompt, form, display, nameInput } = getCertificateElements();
    
    if (canGenerate) {
        prompt.style.display = 'none';
        if (!display.dataset.generated) {
            form.style.display = 'block';
            display.style.display = 'none';
        }
        return;
    }
    
    prompt.style.display = 'block';
    form.style.display = 'none';
    display.style.display = 'none';
    display.dataset.generated = '';
    nameInput.value = '';
    document.getElementById('certName').textContent = '';
    document.getElementById('certDate').textContent = '';
}

function getSafeCertificateFileName(studentName) {
    const safeName = studentName.replace(/[\\/:*?"<>|]/g, '').trim() || '同学';
    return `${safeName}-多人过河巧安排-证书.png`;
}

function waitForImageLoad(imageElement) {
    if (!imageElement) {
        return Promise.resolve();
    }
    
    if (imageElement.complete && imageElement.naturalWidth > 0) {
        return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
        const handleLoad = () => {
            cleanup();
            resolve();
        };
        const handleError = () => {
            cleanup();
            reject(new Error('证书图片资源加载失败'));
        };
        const cleanup = () => {
            imageElement.removeEventListener('load', handleLoad);
            imageElement.removeEventListener('error', handleError);
        };
        imageElement.addEventListener('load', handleLoad, { once: true });
        imageElement.addEventListener('error', handleError, { once: true });
    });
}

async function waitForCertificateAssets() {
    const certificate = document.getElementById('certificate');
    const bgImage = certificate.querySelector('.cert-bg-image');
    const stampImage = certificate.querySelector('.cert-stamp');
    await Promise.all([waitForImageLoad(bgImage), waitForImageLoad(stampImage)]);
}

async function renderCertificateCanvas(isFileProtocol) {
    const { certificate } = getCertificateElements();
    
    if (isFileProtocol) {
        certificate.classList.add('export-simple');
    }
    
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    
    try {
        return await html2canvas(certificate, {
            scale: 2,
            useCORS: !isFileProtocol,
            allowTaint: isFileProtocol,
            logging: false,
            backgroundColor: null
        });
    } finally {
        if (isFileProtocol) {
            certificate.classList.remove('export-simple');
        }
    }
}

// 提交测试
function submitTest() {
    let score = 0;
    let allAnswered = true;
    
    // 检查每道题
    for (let i = 1; i <= 6; i++) {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if (!selected) {
            allAnswered = false;
            break;
        }
        
        const isCorrect = selected.value === answers[`q${i}`];
        if (isCorrect) {
            score += 2;
        }
        
        // 显示反馈
        const feedback = document.getElementById(`feedback${i}`);
        feedback.className = 'feedback show ' + (isCorrect ? 'correct' : 'incorrect');
        feedback.innerHTML = `
            <h5>${isCorrect ? feedbacks[`q${i}`].correct : feedbacks[`q${i}`].incorrect}</h5>
            <p>${feedbacks[`q${i}`].explanation}</p>
        `;
        
        // 禁用选项
        document.querySelectorAll(`input[name="q${i}"]`).forEach(input => {
            input.disabled = true;
        });
    }
    
    if (!allAnswered) {
        alert('请完成所有题目后再提交！');
        return;
    }
    
    // 保存分数
    evaluationState.testScore = score;
    evaluationState.testSubmitted = true;
    
    // 显示结果
    const resultDiv = document.getElementById('testResult');
    resultDiv.className = 'test-result show';
    
    let resultHTML = `
        <h4>测试完成！</h4>
        <div class="score">${score} 分</div>
    `;
    
    if (score === 12) {
        resultHTML += '<p>🎉 太棒了！你全部答对了！</p>';
    } else if (score >= 10) {
        resultHTML += '<p>👍 很好！你掌握得不错！</p>';
    } else if (score >= 8) {
        resultHTML += '<p>💪 还不错！继续加油！</p>';
    } else {
        resultHTML += '<p>📚 再复习一下，你会做得更好！</p>';
    }
    
    resultDiv.innerHTML = resultHTML;
    
    // 隐藏提交按钮，显示重做按钮
    document.querySelector('.submit-btn').style.display = 'none';
    document.querySelector('.retry-btn').style.display = 'inline-block';
    
    // 更新证书区域
    updateCertificateArea();
}

// 重新做题
function retryTest() {
    // 重置所有选项
    for (let i = 1; i <= 6; i++) {
        document.querySelectorAll(`input[name="q${i}"]`).forEach(input => {
            input.checked = false;
            input.disabled = false;
        });
        
        // 隐藏反馈
        const feedback = document.getElementById(`feedback${i}`);
        feedback.className = 'feedback';
    }
    
    // 隐藏结果
    document.getElementById('testResult').className = 'test-result';
    
    // 重置状态
    evaluationState.testScore = 0;
    evaluationState.testSubmitted = false;
    
    // 显示提交按钮，隐藏重做按钮
    document.querySelector('.submit-btn').style.display = 'inline-block';
    document.querySelector('.retry-btn').style.display = 'none';
    
    // 更新证书区域
    updateCertificateArea();
}

// 星级评价
document.addEventListener('DOMContentLoaded', function() {
    const starRatings = document.querySelectorAll('.star-rating');
    
    starRatings.forEach(rating => {
        const stars = rating.querySelectorAll('.star');
        const goalNum = rating.dataset.goal;
        
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const value = parseInt(this.dataset.value);
                evaluationState[`goal${goalNum}`] = value;
                
                // 更新星星显示
                stars.forEach(s => {
                    const sValue = parseInt(s.dataset.value);
                    if (sValue <= value) {
                        s.classList.add('active');
                        s.textContent = '★';
                    } else {
                        s.classList.remove('active');
                        s.textContent = '☆';
                    }
                });
                
                // 检查是否都评价了
                checkEvaluation();
            });
        });
    });
});

// 检查评价完成情况
function checkEvaluation() {
    if (evaluationState.goal1 > 0 && evaluationState.goal2 > 0) {
        const avgRating = (evaluationState.goal1 + evaluationState.goal2) / 2;
        const resultDiv = document.getElementById('evalResult');
        resultDiv.className = 'eval-result show';
        
        if (avgRating === 5) {
            resultDiv.innerHTML = '<p>🌟 太棒了！你对自己的学习非常满意！</p>';
        } else if (avgRating >= 4) {
            resultDiv.innerHTML = '<p>⭐ 很好！你学到了很多知识！</p>';
        } else {
            resultDiv.innerHTML = '<p>💪 继续努力，你会做得更好！</p>';
        }
        
        // 更新证书区域
        updateCertificateArea();
    }
}

// 更新证书区域
function updateCertificateArea() {
    document.getElementById('scoreDisplay').textContent = evaluationState.testScore;
    
    const isFiveStars = evaluationState.goal1 === 5 && evaluationState.goal2 === 5;
    if (isFiveStars) {
        document.getElementById('starDisplay').textContent = '⭐⭐⭐⭐⭐';
    } else if (evaluationState.goal1 > 0 && evaluationState.goal2 > 0) {
        const avgStars = Math.round((evaluationState.goal1 + evaluationState.goal2) / 2);
        document.getElementById('starDisplay').textContent = '⭐'.repeat(avgStars);
    } else {
        document.getElementById('starDisplay').textContent = '未评价';
    }
    
    setCertificateVisibility(evaluationState.testScore === 12 && isFiveStars);
}

// 生成证书
function generateCertificate() {
    const name = document.getElementById('studentName').value.trim();
    
    if (!name) {
        alert('请输入你的姓名！');
        return;
    }
    
    // 设置证书内容
    document.getElementById('certName').textContent = name;
    
    // 设置日期
    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    document.getElementById('certDate').textContent = dateStr;
    
    const { form, display } = getCertificateElements();
    form.style.display = 'none';
    display.style.display = 'block';
    display.dataset.generated = 'true';
}

// 下载证书
async function downloadCertificate() {
    const studentName = document.getElementById('certName').textContent;
    
    if (!studentName) {
        alert('请先生成证书！');
        return;
    }
    
    const isFileProtocol = window.location.protocol === 'file:';
    const fileName = getSafeCertificateFileName(studentName);
    
    try {
        await waitForCertificateAssets();
        const canvas = await renderCertificateCanvas(isFileProtocol);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        if (isFileProtocol) {
            setTimeout(() => {
                alert('下载的图片不含背景和印章，如需完整版请使用截图功能（Ctrl+Shift+X）');
            }, 100);
        }
    } catch (error) {
        console.error('生成证书失败:', error);
        alert('生成证书失败，请重试');
    }
}
