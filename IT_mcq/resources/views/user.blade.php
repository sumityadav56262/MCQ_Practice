<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCQ Practice</title>
    <link rel="stylesheet" href={{ asset('style/style.css') }}>

</head>
<body>
    <div class="container">
        <div class="wrapper">
            <label id="toggleBtn" class="switch">
                <input  type="checkbox" id="toggleSwitch">
                <span class="slider round"></span>
            </label>
            <div class="nav">
                <h1>MCQ Practice</h1>
                <div class="timer" id="timer">
                    Time Left: <span id="time">30:00</span>
                </div>
            </div>
            <div id="mcq-container">
                <div id="question-container">
                    <p id="question"></p>
                    <div id="options"></div>
                    <div id="question-number" style="margin: 10px 0">
                        Question: <span id="current-question">1</span> of <span id="total-questions">30</span>
                    </div>
                </div>
            </div>
            <div>
                <label>
                    <input type="checkbox" id="show-feedback" >
                    Wanna know the correct and wrong option
                </label>
            </div>
            <div id="result" style="display: none;">
                <h2>Results</h2>
                <p id="result-percentage"></p>
                <details id="more-detail">
                    <summary>Show details</summary>
                    <p><div id="detailed-results"></div></p>
                  </details>
                <button id="practice-again" class="btn" onclick="startNewPractice()" style="display: none;">Practice Again</button>
            </div>
            <button id="nextBtn" class="btn" disabled onclick="nextQuestion()">Next</button>
        </div>
    </div>

    <script>
        let questions = []; // Store questions
        let currentQuestionIndex = 0;
        let correctAnswers = 0;
        let isCkecked = false;
        let totalQuestions = 30; // Set to 30
        let showFeedback = false;
        let timer;

        // New array to store the user's selected answers
        let userAnswers = [];

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
                    //console.log(data); // Log the fetched data to the console
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

                // Destructure the question object to get question, options, and correct_answer
                const { question, options, correct_answer } = currentQuestion;

                document.getElementById('question').textContent = question;

                const optionsContainer = document.getElementById('options');
                optionsContainer.innerHTML = ''; // Clear previous options

                const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
                var correctAnswer = parsedOptions[correct_answer];
                
                const shuffledOptions = shuffleOptions(parsedOptions);

                shuffledOptions.forEach((option, i) => {
                    const optionDiv = document.createElement('div');
                    optionDiv.textContent = option;
                    optionDiv.value = option;
                    optionDiv.classList.add('option');
                    optionDiv.dataset.index = i; // Store the index for comparison
                    optionDiv.onclick = () => checkAnswer(optionDiv, correctAnswer, question); // Pass the index of the clicked option
                    optionsContainer.appendChild(optionDiv);
                });

                document.getElementById('current-question').textContent = index + 1;
                isCkecked = false;
                // Remove fade-out effect
                questionContainer.classList.remove('fade-out');
                questionContainer.style.opacity = 1; // Ensure it’s fully visible
            }, 300); // Match this duration with the CSS transition duration
        }

        function checkAnswer(optionDiv, correctAnswer, currentQuestion) {
            if(isCkecked)
            {
                return;
            }
            isCkecked = true;
            // Save the selected answer to userAnswers array
            const userSelectedAnswer = optionDiv.textContent;
            userAnswers[currentQuestionIndex] = {
                question: currentQuestion,
                selected: userSelectedAnswer,
                correct: correctAnswer
            };

            // Highlight the selected answer
            if (userSelectedAnswer === correctAnswer) {
                correctAnswers++;
                if(showFeedback)
                    optionDiv.classList.add('correct');
            } else {
                const optionElements = document.querySelectorAll('.option');
                optionElements.forEach((option) => {
                    if (option.textContent.trim() === correctAnswer) {
                        if (showFeedback) {
                            optionDiv.classList.add('wrong');
                            option.classList.add('correct');
                        }
                    }
                });
            }
            if(!showFeedback)
            {
                setTimeout(()=>{
                    currentQuestionIndex++;
                    loadQuestion(currentQuestionIndex);
                    document.getElementById('nextBtn').disabled = true;
                },300);
            }
            else
                document.getElementById('nextBtn').disabled = false; // Enable next button only after an answer is selected
                document.getElementById('mcq-container').disabled = true; // Enable next button only after an answer is selected
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
            document.getElementById('nextBtn').style.display = 'none';
            document.getElementById('show-feedback').style.display = 'none';
            document.getElementById('result').style.display = 'block';
            const percentage = (correctAnswers / totalQuestions) * 100;
            document.getElementById('result-percentage').textContent = `You got ${correctAnswers} out of ${totalQuestions} correct (${percentage.toFixed(2)}%)`;
            document.getElementById('practice-again').style.display = 'inline-block'; // Show practice again button

            // Show detailed results with selected and correct answers
            const detailedResultsContainer = document.getElementById('detailed-results');
            detailedResultsContainer.innerHTML = ''; // Clear previous results

            userAnswers.forEach((answer, index) => {
                const resultDiv = document.createElement('div');
                resultDiv.innerHTML = `
                    <p><strong>Question ${index + 1}: ${answer.question}</strong></p>
                    ${answer.selected !== answer.correct ? `<p style='color:rgb(250,100,100);'>Your answer: ${answer.selected}</p>
                    <p style='color:rgb(100,250,100);'>Correct answer: <b>${answer.correct}</b></p>` : `<p>Correct answer: ${answer.correct}</p>`}
                    
                `;
                if(answer.selected == answer.correct )
                    resultDiv.get = "rgb(0,255,0)";
                detailedResultsContainer.appendChild(resultDiv);
            });

        }

        function startNewPractice() {
            currentQuestionIndex = 0;
            correctAnswers = 0;
            document.getElementById('mcq-container').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            document.getElementById('nextBtn').disabled = true; // Reset button state
            fetchQuestions(); // Fetch a new set of questions
        }
    </script>
    <script src={{ asset('script/theme.js') }}></script>
</body>
</html>
