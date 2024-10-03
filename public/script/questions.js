let questions = []; // Store questions
let currentQuestionIndex = 0;
let correctAnswers = 0;
let totalQuestions = 30; // Set to 30
let showFeedback = true;
let timer;
// Fetch a set of 30 questions when the page loads
window.onload = () => {
    fetchQuestions();
    document.getElementById('show-feedback').addEventListener('change', function() {
        showFeedback = this.checked;

    });
};

function fetchQuestions() {
    fetch("{{ route('user.mcq.getQuestions', ['count' => 30]) }}") // Update with your route
        .then(response => response.json())
        .then(data => {
            console.log(data); // Log the fetched data to the console
            questions = data;
            loadQuestion(currentQuestionIndex);
            startTimer(1800); // Start timer for 30 minutes
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
        });
}


function loadQuestion(index) {
    if (index >= totalQuestions) {
        showResults();
        return;
    }

    const questionContainer = document.getElementById('question-container');
    questionContainer.classList.add('fade-out'); // Start fade out effect

    setTimeout(() => {
        const currentQuestion = questions[index]; // Get the current question object
        console.log('Current Question:', currentQuestion); // Log the current question

        // Change here to use correct_answer instead of correctAnswer
        const { question, options, correct_answer } = currentQuestion; // Destructure question data

        document.getElementById('question').textContent = question;

        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = ''; // Clear previous options

        const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
        const shuffledOptions = shuffleOptions(parsedOptions);

        shuffledOptions.forEach((option, i) => {
            const optionDiv = document.createElement('div');
            optionDiv.textContent = option;
            optionDiv.classList.add('option');
            optionDiv.dataset.index = i; // Store the index for comparison
            optionDiv.onclick = () => checkAnswer(optionDiv, correct_answer, i); // Pass the index of the clicked option
            optionsContainer.appendChild(optionDiv);
        });

        document.getElementById('current-question').textContent = index + 1;

        // Remove fade-out effect
        questionContainer.classList.remove('fade-out');
        questionContainer.style.opacity = 1; // Ensure it’s fully visible
    }, 500); // Match this duration with the CSS transition duration
}



function checkAnswer(optionDiv, correctAnswer, selectedAnswer) {
    // Highlight the selected answer
    if (selectedAnswer === correctAnswer) {
        correctAnswers++;
        optionDiv.classList.add('correct');
    } else {
        optionDiv.classList.add('wrong');
        // Highlight the correct answer
        const correctOptionDiv = document.querySelector(`.option[data-index="${correctAnswer}"]`);
        if (correctOptionDiv) {
            correctOptionDiv.classList.add('correct');
        }
    }
    document.getElementById('nextBtn').disabled = false; // Enable next button only after an answer is selected
}

function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion(currentQuestionIndex);
    document.getElementById('nextBtn').disabled = true; // Disable next button until question is answered
}

function shuffleOptions(options) {
    return options.sort(() => Math.random() - 0.5);
}

function startTimer(duration) {
    let timeLeft = duration; // Set to total duration in seconds
    document.getElementById('timer').style.display = 'block';
    
    timer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.getElementById('time').textContent = formattedTime;

        if (timeLeft <= 0) {
            clearInterval(timer);
            showResults(); // Show results if time runs out
        }
    }, 1000);
}

function showResults() {
    clearInterval(timer); // Stop the timer
    document.getElementById('mcq-container').style.display = 'none';
    document.getElementById('result').style.display = 'block';
    const percentage = (correctAnswers / totalQuestions) * 100;
    document.getElementById('result-percentage').textContent = `You got ${correctAnswers} out of ${totalQuestions} correct (${percentage.toFixed(2)}%)`;
    document.getElementById('practice-again').style.display = 'inline-block'; // Show practice again button
}

function startNewPractice() {
    currentQuestionIndex = 0;
    correctAnswers = 0;
    document.getElementById('mcq-container').style.display = 'block';
    document.getElementById('result').style.display = 'none';
    document.getElementById('nextBtn').disabled = true; // Reset button state
    fetchQuestions(); // Fetch a new set of questions
}
