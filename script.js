let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedLevel = '';
let timeLeft = 10; // Tiempo en segundos para cada pregunta
let timerInterval;

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
const timerDisplay = document.getElementById('timer-display'); // Elemento para mostrar el temporizador

// Cambiar el texto de los botones de nivel
const levelButtons = levelSelectionDiv.querySelectorAll('button');
levelButtons.forEach(button => {
    const level = button.dataset.level;
    switch (level) {
        case 'E':
            button.textContent = 'Nivel Intermedio';
            break;
        case 'R':
            button.textContent = 'Nivel Básico';
            break;
        case 'P':
            button.textContent = 'Nivel Avanzado';
            break;
    }
});

// Event listeners para la selección de nivel
levelSelectionDiv.addEventListener('click', async (event) => {
    if (event.target.tagName === 'BUTTON') {
        selectedLevel = event.target.dataset.level;
        currentLevelDisplay.textContent = `Nivel: ${event.target.textContent}`; // Usar el texto del botón
        await loadQuestions(selectedLevel);
        if (questions.length > 0) {
            startQuiz();
        } else {
            alert(`No hay preguntas disponibles para el Nivel ${event.target.textContent}.`); // Usar el texto del botón
            quizSection.style.display = 'none';
            levelSelectionDiv.style.display = 'block';
        }
    }
});

// Event listener para el botón de siguiente pregunta
nextQuestionBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < Math.min(10, questions.length)) { // Limitar a 10 preguntas o al número total de preguntas
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
    nextQuestionBtn.disabled = true;
    startTimer(); // Inicia el temporizador
}

function displayQuestion() {
    if (!questions[currentQuestionIndex]) {
        console.error('No hay pregunta en el índice:', currentQuestionIndex);
        return; // Detiene la ejecución si no hay pregunta
    }

    const question = questions[currentQuestionIndex];
    questionText.textContent = question.Enunciado;
    optionsContainer.innerHTML = '';

    const currentOptions = [
        question["Opción A"],
        question["Opción B"],
        question["Opción C"],
        question["Opción D"]
    ].filter(option => option); // Filtra cualquier opción que sea undefined si no todas las preguntas tienen 4 opciones

    currentOptions.forEach(optionText => {
        const button = document.createElement('button');
        button.textContent = optionText;
        button.classList.add('option-btn');
        // Pasamos la opción de texto y la letra de la respuesta correcta (A, B, C, D)
        button.addEventListener('click', () => selectAnswer(button, optionText, question["Respuesta Correcta"], currentOptions));
        optionsContainer.appendChild(button);
    });
    startTimer(); // Reinicia el temporizador para cada pregunta
}

function selectAnswer(selectedButton, selectedOptionText, correctAnswerLetter, allOptions) {
    clearInterval(timerInterval); // Detiene el temporizador al seleccionar una respuesta

    // Deshabilitar todos los botones de opción después de una selección
    Array.from(optionsContainer.children).forEach(button => {
        button.disabled = true;
    });

    selectedButton.classList.add('selected');

    // Mapea la letra de la respuesta correcta a su texto
    let actualCorrectAnswerText = '';
    switch (correctAnswerLetter) {
        case 'A': actualCorrectAnswerText = allOptions[0]; break;
        case 'B': actualCorrectAnswerText = allOptions[1]; break;
        case 'C': actualCorrectAnswerText = allOptions[2]; break;
        case 'D': actualCorrectAnswerText = allOptions[3]; break;
        // Agrega más casos si tienes Opción E, F, etc.
    }


    if (selectedOptionText === actualCorrectAnswerText) {
        selectedButton.classList.add('correct');
        score++;
    } else {
        selectedButton.classList.add('incorrect');
        // Opcional: Mostrar la respuesta correcta
        Array.from(optionsContainer.children).forEach(button => {
            if (button.textContent === actualCorrectAnswerText) {
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
    totalQuestionsCount.textContent = Math.min(10, questions.length); // Muestra el máximo de 10 o el número real de preguntas
    clearInterval(timerInterval); // Detiene el temporizador al finalizar el quiz
}

function resetQuiz() {
    levelSelectionDiv.style.display = 'block';
    quizSection.style.display = 'none';
    resultsSection.style.display = 'none';
    questions = []; // Limpiar las preguntas cargadas
    currentQuestionIndex = 0;
    score = 0;
    selectedLevel = '';
    timeLeft = 10; // Restablece el tiempo
    timerDisplay.textContent = ''; // Limpia el display del temporizador
}

function startTimer() {
    clearInterval(timerInterval); // Limpia cualquier temporizador anterior
    timeLeft = 10;
    timerDisplay.textContent = `Tiempo restante: ${timeLeft}s`;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Tiempo restante: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            // Simula una respuesta incorrecta (o ninguna respuesta)
            Array.from(optionsContainer.children).forEach(button => {
                button.disabled = true;
            });
            nextQuestionBtn.disabled = false; // Habilita el botón "Siguiente Pregunta"
            // También puedes avanzar automáticamente a la siguiente pregunta si el tiempo se agota:
            // nextQuestionBtn.click(); // Descomenta esta línea para avanzar automáticamente
        }
    }, 1000);
}
