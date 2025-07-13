document.addEventListener('DOMContentLoaded', () => {
    // --- DOM要素の取得 ---
    const modeSelection = document.getElementById('mode-selection');
    const etoJBtn = document.getElementById('eto-j-btn');
    const jtoEBtn = document.getElementById('jto-e-btn');

    const quizArea = document.getElementById('quiz-area');
    const progressText = document.getElementById('progress');
    const questionText = document.getElementById('question');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const resultText = document.getElementById('result');
    const nextBtn = document.getElementById('next-btn');
    
    const resultArea = document.getElementById('result-area');
    const scoreText = document.getElementById('score');
    const totalText = document.getElementById('total');
    const restartBtn = document.getElementById('restart-btn');

    // --- グローバル変数 ---
    let allWords = [];
    let quizQueue = [];
    let currentMode = '';
    let currentIndex = 0;
    let score = 0;
    const QUIZ_LENGTH = 10;       // 1回のクイズの問題数
    const MAX_ATTEMPTS = 3;       // 1単語あたりの最大出題回数

    // --- イベントリスナー ---
    etoJBtn.addEventListener('click', () => startGame('eto-j'));
    jtoEBtn.addEventListener('click', () => startGame('jto-e'));
    submitBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !submitBtn.classList.contains('hidden')) {
            checkAnswer();
        }
    });
    nextBtn.addEventListener('click', nextQuestion);
    restartBtn.addEventListener('click', () => {
        resultArea.classList.add('hidden');
        modeSelection.classList.remove('hidden');
    });

    // --- 初期化処理 ---
    fetch('words.json')
        .then(response => response.json())
        .then(data => {
            allWords = data;
        })
        .catch(error => {
            console.error('単語データの読み込みに失敗しました:', error);
            alert('単語データの読み込みに失敗しました。');
        });

    /**
     * ゲームを開始する関数
     * @param {string} mode 'eto-j' または 'jto-e'
     */
    function startGame(mode) {
        if (allWords.length === 0) {
            alert('単語データがまだ準備できていません。');
            return;
        }
        currentMode = mode;
        currentIndex = 0;
        score = 0;
        
        // 全単語をシャッフルし、先頭から10問を取得
        const shuffled = [...allWords].sort(() => Math.random() - 0.5);
        quizQueue = shuffled.slice(0, QUIZ_LENGTH).map(word => ({
            ...word,
            attempts: 1 // 各単語の挑戦回数を記録
        }));

        modeSelection.classList.add('hidden');
        quizArea.classList.remove('hidden');
        
        displayQuestion();
    }

    /**
     * 次の問題を表示する関数
     */
    function displayQuestion() {
        // クイズキューの全問題が終了したら結果表示
        if (currentIndex >= quizQueue.length) {
            showResult();
            return;
        }

        progressText.textContent = `問題 ${currentIndex + 1} / ${quizQueue.length}`;
        const currentWord = quizQueue[currentIndex];

        if (currentMode === 'eto-j') {
            questionText.textContent = currentWord.english;
        } else {
            questionText.textContent = currentWord.japanese.split(/,|、/)[0];
        }

        answerInput.value = '';
        answerInput.disabled = false;
        resultText.textContent = '';
        submitBtn.classList.remove('hidden');
        nextBtn.classList.add('hidden');
        answerInput.focus();
    }

    /**
     * ユーザーの解答をチェックする関数
     */
    function checkAnswer() {
        const userAnswer = answerInput.value.trim().toLowerCase();
        if (!userAnswer) return;

        const currentWord = quizQueue[currentIndex];
        let isCorrect = false;

        // 正誤判定
        if (currentMode === 'eto-j') {
            const correctAnswers = currentWord.japanese.toLowerCase().split(/,|、/);
            isCorrect = correctAnswers.some(ans => ans.trim() === userAnswer);
        } else {
            isCorrect = userAnswer === currentWord.english.toLowerCase();
        }

        // ボタンの状態を更新
        answerInput.disabled = true;
        submitBtn.classList.add('hidden');
        nextBtn.classList.remove('hidden');
        nextBtn.focus();

        if (isCorrect) {
            resultText.textContent = '正解！ ✅';
            resultText.className = 'correct';
            // 最初の挑戦で正解した場合のみスコアを加算
            if (currentWord.attempts === 1) {
                score++;
            }
        } else {
            const correctAnswer = (currentMode === 'eto-j') ? currentWord.japanese : currentWord.english;
            resultText.textContent = `不正解... ❌ 正解は: ${correctAnswer}`;
            resultText.className = 'incorrect';

            // 挑戦回数が上限未満なら、クイズの最後にもう一度追加
            if (currentWord.attempts < MAX_ATTEMPTS) {
                const nextAttemptWord = { ...currentWord, attempts: currentWord.attempts + 1 };
                quizQueue.push(nextAttemptWord);
            }
        }
    }

    /**
     * 次の問題へ進む
     */
    function nextQuestion() {
        currentIndex++;
        displayQuestion();
    }

    /**
     * 最終結果を表示する
     */
    function showResult() {
        quizArea.classList.add('hidden');
        resultArea.classList.remove('hidden');
        scoreText.textContent = score;
        totalText.textContent = QUIZ_LENGTH; // スコアは最初の10問に対して表示
    }
});
