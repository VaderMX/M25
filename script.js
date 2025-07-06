let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedLevel = '';

const levelSelectionDiv = document.querySelector('.level-selection');
const quizSection = document.getElementById('quiz-section');
const resultsSection = document.getElementById('results-section');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextQuestionBtn = document.getElementById('next-question-btn');
const restartQuizBtn = document.getElementById('restart-quiz-btn');
const correctAnswersCount = document.getElementById('correct-answers-count');
const totalQuestionsCount = document.getElementById('total-questions-count');
const currentLevelDisplay = document.getElementById('current-level-display');

// Event listeners para la selección de nivel
levelSelectionDiv.addEventListener('click', async (event) => {
    if (event.target.tagName === 'BUTTON') {
        selectedLevel = event.target.dataset.level;
        currentLevelDisplay.textContent = `Nivel: ${selectedLevel}`;
        await loadQuestions(selectedLevel);
        if (questions.length > 0) {
            startQuiz();
        } else {
            alert(`No hay preguntas disponibles para el Nivel ${selectedLevel}.`);
            // Asegúrate de volver al menú de selección de nivel si no hay preguntas.
            quizSection.style.display = 'none';
            levelSelectionDiv.style.display = 'block';
        }
    }
});

// Event listener para el botón de siguiente pregunta
nextQuestionBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
        nextQuestionBtn.disabled = true; // Deshabilita hasta que se seleccione una opción
    } else {
        showResults();
    }
});

// Event listener para el botón de reiniciar
restartQuizBtn.addEventListener('click', () => {
    resetQuiz();
});

async function loadQuestions(level) {
    try {
        const response = await fetch(`./data/preguntas_nivel_${level.toLowerCase()}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        questions = await response.json();
        console.log(`Preguntas cargadas para el nivel ${level}:`, questions);
    } catch (error) {
        console.error(`Error al cargar las preguntas del nivel ${level}:`, error);
        questions = []; // Asegúrate de que questions esté vacío si hay un error
    }
}

function startQuiz() {
    levelSelectionDiv.style.display = 'none';
    resultsSection.style.display = 'none';
    quizSection.style.display = 'block';
    currentQuestionIndex = 0;
    score = 0;
    displayQuestion();
    nextQuestionBtn.disabled = true; // Asegurarse de que esté deshabilitado al inicio
}

function displayQuestion() {
    const question = questions[currentQuestionIndex];
    questionText.textContent = question.question;
    optionsContainer.innerHTML = ''; // Limpiar opciones anteriores

    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option-btn');
        button.addEventListener('click', () => selectAnswer(button, option, question.correctAnswer));
        optionsContainer.appendChild(button);
    });
}

function selectAnswer(selectedButton, selectedOption, correctAnswer) {
    // Deshabilitar todos los botones de opción después de una selección
    Array.from(optionsContainer.children).forEach(button => {
        button.disabled = true;
    });

    selectedButton.classList.add('selected');

    if (selectedOption === correctAnswer) {
        selectedButton.classList.add('correct');
        score++;
    } else {
        selectedButton.classList.add('incorrect');
        // Opcional: Mostrar la respuesta correcta
        Array.from(optionsContainer.children).forEach(button => {
            if (button.textContent === correctAnswer) {
                button.classList.add('correct');
            }
        });
    }
    nextQuestionBtn.disabled = false; // Habilitar el botón "Siguiente Pregunta"
}

function showResults() {
    quizSection.style.display = 'none';
    resultsSection.style.display = 'block';
    correctAnswersCount.textContent = score;
    totalQuestionsCount.textContent = questions.length;
}

function resetQuiz() {
    levelSelectionDiv.style.display = 'block';
    quizSection.style.display = 'none';
    resultsSection.style.display = 'none';
    questions = []; // Limpiar las preguntas cargadas
    currentQuestionIndex = 0;
    score = 0;
    selectedLevel = '';
}