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
    nextQuestionBtn.disabled = true;
}

function displayQuestion() {
    const question = questions[currentQuestionIndex];
    // --- CAMBIOS AQUÍ ---
    questionText.textContent = question.Enunciado; // Usamos "Enunciado" para el texto de la pregunta
    optionsContainer.innerHTML = '';

    // Creamos un array de opciones a partir de tus "Opción A", "Opción B", etc.
    const currentOptions = [
        question["Opción A"],
        question["Opción B"],
        question["Opción C"],
        question["Opción D"]
        // Agrega más si tienes Opción E, F, etc.
    ].filter(option => option); // Filtra cualquier opción que sea undefined si no todas las preguntas tienen 4 opciones

    currentOptions.forEach(optionText => { // Iteramos sobre el nuevo array de opciones
        const button = document.createElement('button');
        button.textContent = optionText;
        button.classList.add('option-btn');
        // Pasamos la opción de texto y la letra de la respuesta correcta (A, B, C, D)
        button.addEventListener('click', () => selectAnswer(button, optionText, question["Respuesta Correcta"], currentOptions));
        optionsContainer.appendChild(button);
    });
    // --- FIN CAMBIOS ---
}

// --- CAMBIOS AQUÍ: selectAnswer necesita más argumentos para manejar la letra de respuesta ---
function selectAnswer(selectedButton, selectedOptionText, correctAnswerLetter, allOptions) {
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
// --- FIN CAMBIOS ---

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
