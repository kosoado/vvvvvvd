document.addEventListener('DOMContentLoaded', () => {
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

    let words = [];
    let currentMode = '';
    let currentIndex = 0;
    let score = 0;
    let shuffledWords = [];

    // JSONファイルから単語データを読み込む
    fetch('words.json')
        .then(response => response.json())
        .then(data => {
            words = data;
        })
        .catch(error => {
            console.error('単語データの読み込みに失敗しました:', error);
            alert('単語データの読み込みに失敗しました。');
        });

    // モード選択
    etoJBtn.addEventListener('click', () => startGame('eto-j'));
    jtoEBtn.addEventListener('click', () => startGame('jto-e'));

    // 解答ボタンの処理
    submitBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });

    // 次へボタンの処理
    nextBtn.addEventListener('click', nextQuestion);
    
    // やり直しボタンの処理
    restartBtn.addEventListener('click', () => {
        resultArea.classList.add('hidden');
        modeSelection.classList.remove('hidden');
    });

    function startGame(mode) {
        if (words.length === 0) {
            alert('単語データがまだ準備できていません。');
            return;
        }
        currentMode = mode;
        currentIndex = 0;
        score = 0;
        shuffledWords = [...words].sort(() => Math.random() - 0.5); // 単語をシャッフル

        modeSelection.classList.add('hidden');
        quizArea.classList.remove('hidden');
        
        displayQuestion();
    }

    function displayQuestion() {
        if (currentIndex >= shuffledWords.length) {
            showResult();
            return;
        }

        progressText.textContent = `${currentIndex + 1} / ${shuffledWords.length}`;
        const currentWord = shuffledWords[currentIndex];

        if (currentMode === 'eto-j') {
            questionText.textContent = currentWord.english;
        } else {
            // 日本語訳に複数ある場合は最初のものを表示
            questionText.textContent = currentWord.japanese.split(/,|、/)[0];
        }

        answerInput.value = '';
        answerInput.disabled = false;
        resultText.textContent = '';
        submitBtn.classList.remove('hidden');
        nextBtn.classList.add('hidden');
        answerInput.focus();
    }

    function checkAnswer() {
        const userAnswer = answerInput.value.trim().toLowerCase();
        if (!userAnswer) return;

        const currentWord = shuffledWords[currentIndex];
        let isCorrect = false;

        if (currentMode === 'eto-j') {
            const correctAnswers = currentWord.japanese.toLowerCase().split(/,|、/);
            isCorrect = correctAnswers.some(ans => ans.trim() === userAnswer);
        } else {
            isCorrect = userAnswer === currentWord.english.toLowerCase();
        }

        answerInput.disabled = true;
        submitBtn.classList.add('hidden');
        nextBtn.classList.remove('hidden');
        nextBtn.focus();

        if (isCorrect) {
            resultText.textContent = '正解！ ✅';
            resultText.className = 'correct';
            score++;
        } else {
            const correctAnswer = (currentMode === 'eto-j') ? currentWord.japanese : currentWord.english;
            resultText.textContent = `不正解... ❌ 正解は: ${correctAnswer}`;
            resultText.className = 'incorrect';
        }
    }

    function nextQuestion() {
        currentIndex++;
        displayQuestion();
    }

    function showResult() {
        quizArea.classList.add('hidden');
        resultArea.classList.remove('hidden');
        scoreText.textContent = score;
        totalText.textContent = shuffledWords.length;
    }
});