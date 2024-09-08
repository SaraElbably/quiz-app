class QuizApp {
    constructor() {
        //get register elements
        this.form = document.getElementById('form');
        this.firstName = document.getElementById('firstName');
        this.lastName = document.getElementById('lastName');
        this.email = document.getElementById('email');
        this.password = document.getElementById('password');
        this.confirmPassword = document.getElementById('confirmPassword');

        //get quiz elements
        this.userName=document.querySelector('.username')
        this.questionNumberElement = document.querySelector('.question-number');
        this.questionTextElement = document.querySelector('.question-text');
        this.optionsContainerElement = document.querySelector('.options-container');
        this.nextButton = document.querySelector('.next-button');
        this.prevButton = document.querySelector('.prev-button');
        this.flagButton = document.querySelector('.flag-button');
        this.flaggedQuestionsList = document.querySelector('.flagged-questions-list');
        this.progressCircles = document.querySelectorAll('.progress-circle');
        this.countDown = document.querySelector('.timer');

        // quiz
        this.answeredQ = {};
        this.flaggedQ = {};
        this.currentQuestion = 0;
        this.maxQuestions = 10;
        this.questionOrder = [];
        this.startMin = 1;
        this.time = this.startMin * 60;
        this.questions = [];

        this.init();
    }

    //eventslistner
    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleRegisterSubmit(e));
        }

        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => this.handleNextButtonClick());
        }

        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => this.handlePrevButtonClick());
        }

        if (this.flagButton) {
            this.flagButton.addEventListener('click', () => this.handleFlagButtonClick());
        }

        this.getQuestions();
        window.onload = function() {
            window.history.pushState(null, null, window.location.href);
            window.onpopstate = function() {
                window.history.go(1); 
            };
        };
    }

    
    handleRegisterSubmit(e) {
        e.preventDefault();
        if (this.validateInputs()) {
            this.setUserName();
            this.redirectToQuiz();

        }
    }

//validations

    validateInputs() {
        const firstNameValue = this.firstName.value.trim();
        const lastNameValue = this.lastName.value.trim();
        const emailValue = this.email.value.trim();
        const passwordValue = this.password.value.trim();
        const confirmPasswordValue = this.confirmPassword.value.trim();

        let isValid = true;

        if (firstNameValue === '') {
            this.setError(this.firstName, 'First name is required');
            isValid = false;
        } else {
            this.setSuccess(this.firstName);
        }

        if (lastNameValue === '') {
            this.setError(this.lastName, 'Last name is required');
            isValid = false;
        } else {
            this.setSuccess(this.lastName);
        }

        if (emailValue === '') {
            this.setError(this.email, 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(emailValue)) {
            this.setError(this.email, 'Please enter a valid email');
            isValid = false;
        } else {
            this.setSuccess(this.email);
        }

        if (passwordValue === '') {
            this.setError(this.password, 'Password is required');
            isValid = false;
        } else if (passwordValue.length < 8) {
            this.setError(this.password, 'Password must be at least 8 characters long');
            isValid = false;
        } else {
            this.setSuccess(this.password);
        }

        if (confirmPasswordValue === '') {
            this.setError(this.confirmPassword, 'Confirm password is required');
            isValid = false;
        } else if (confirmPasswordValue !== passwordValue) {
            this.setError(this.confirmPassword, 'Passwords do not match');
            isValid = false;
        } else {
            this.setSuccess(this.confirmPassword);
        }

        return isValid;
    }

    setError(element, message) {
        const inputControl = element.parentElement;
        const errorDisplay = inputControl.querySelector('.error');
        errorDisplay.innerText = message;
        inputControl.classList.add('error');
        inputControl.classList.remove('success');
    }

    setSuccess(element) {
        const inputControl = element.parentElement;
        const errorDisplay = inputControl.querySelector('.error');
        errorDisplay.innerText = '';
        inputControl.classList.add('success');
        inputControl.classList.remove('error');
    }

    isValidEmail(email) {
        const mail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return mail.test(String(email).toLowerCase());
    }

 //the quiz   

    redirectToQuiz() {
        const fullNameValue = this.firstName.value.trim() + ' ' + this.lastName.value.trim();
        const quizPageUrl = `http://127.0.0.1:5501/index.html?userName=${encodeURIComponent(fullNameValue)}`;
        window.location.href = quizPageUrl;
    }

    async getQuestions() {
        const response = await fetch('./questions.json');
        const data = await response.json();
        this.questions = data.quiz.questions;

        this.questionOrder = this.shuffleQuestions(this.questions).slice(0, this.maxQuestions);

        this.displayQuestion(this.currentQuestion);
        setInterval(() => this.timer(), 1000);
    }

    shuffleQuestions(questionsArray) {
        return questionsArray.sort(() => Math.random() - 0.5);
    }

    updateCircles(index) {
        this.progressCircles.forEach((circle, i) => {
            if (i === index) {
                circle.classList.add('active');
            } else {
                circle.classList.remove('active');
            }
        });
    }

    displayQuestion(index) {
        const question = this.questionOrder[index];
        this.questionNumberElement.textContent = `Question ${index + 1}:`;
        this.questionTextElement.textContent = question.title;

        this.optionsContainerElement.innerHTML = '';
        for (let i = 1; i <= 4; i++) {
            const optionButton = document.createElement('button');
            optionButton.classList.add('option');
            optionButton.textContent = question[`answer_${i}`];
            optionButton.addEventListener('click', () => this.selectAnswer(question.id, i));

            if (this.answeredQ[question.id] === i) {
                optionButton.classList.add('selected');
            }

            this.optionsContainerElement.appendChild(optionButton);
        }

        if (index === this.maxQuestions - 1) {
            this.nextButton.textContent = 'Submit';
        } else {
            this.nextButton.textContent = 'Next';
        }
        this.updateCircles(index);
    }

    selectAnswer(questionId, selectedOption) {
        this.answeredQ[questionId] = selectedOption;
        const optionButtons = this.optionsContainerElement.querySelectorAll('.option');
        optionButtons.forEach(button => button.classList.remove('selected'));
        optionButtons[selectedOption - 1].classList.add('selected');
    }
    //handle Buttons

    handleNextButtonClick() {
        if (this.currentQuestion < this.maxQuestions - 1) {
            this.currentQuestion++;
            this.displayQuestion(this.currentQuestion);
        } else {
            this.submitQuiz();
        }
    }

    handlePrevButtonClick() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.displayQuestion(this.currentQuestion);
        }
    }

    handleFlagButtonClick() {
        const currentQ = this.questionOrder[this.currentQuestion];

        if (!this.flaggedQ[currentQ.id]) {
            this.flaggedQ[currentQ.id] = this.currentQuestion;

            this.updateFlaggedQuestionsSidebar();
        }
    }

    updateFlaggedQuestionsSidebar() {
        this.flaggedQuestionsList.innerHTML = ''; 
        Object.keys(this.flaggedQ).forEach(questionId => {
            const listItem = document.createElement('li');
            const questionIndex = this.flaggedQ[questionId] + 1; 
            listItem.textContent = `Question ${questionIndex}`;
            listItem.classList.add('flagged-question-item');
            listItem.dataset.questionIndex = this.flaggedQ[questionId]; 

            listItem.addEventListener('click', () => {
                this.currentQuestion = this.flaggedQ[questionId]; 
                this.displayQuestion(this.currentQuestion); 
            });

            this.flaggedQuestionsList.appendChild(listItem);
        });
    }

    submitQuiz() {
        // console.log('Answered Questions:', this.answeredQ);
        // console.log('Flagged Questions:', this.flaggedQ);
        this.showResults();
    }


    //result page

    showResults() {
        let score = 0;
        const totalAnsweredQ = this.questionOrder.length;

        this.questionOrder.forEach((question) => {
            const selectedOptionIndex = this.answeredQ[question.id];
            const selectedOptionInput = question[`answer_${selectedOptionIndex}`];

            if (selectedOptionInput === question.correct_answer) {
                score++;
            }
        });

        document.body.innerHTML = ""; 
        const resultsContainer = document.createElement('div');
        document.body.classList.add('body-results');
        resultsContainer.classList.add('results-container');

        const scoreText = document.createElement('h1');
        const scorePara = document.createElement('p');

        scoreText.textContent = `Your Score is ${score}/${totalAnsweredQ}`;
        resultsContainer.appendChild(scoreText);

        const scorePhoto = document.createElement('img');
        scorePhoto.classList.add('result-image');  
        scorePara.classList.add('result-text');   

        if (score === totalAnsweredQ) {
            scorePhoto.src = "https://img.freepik.com/premium-vector/office-workers-celebrating-victory-competition_82574-9299.jpg";
            scorePara.textContent = "You are a Quiz Master!";
        } else if (score >= totalAnsweredQ / 2) {
            scorePhoto.src = "https://img.freepik.com/free-vector/college-admission-concept-illustration_114360-10499.jpg?semt=ais_hybrid";
            scorePara.textContent = "Good Job!";
        } else {
            scorePhoto.src = "https://cdn.vectorstock.com/i/preview-1x/71/25/failed-the-test-isolated-cartoon-vector-45407125.jpg";
            scorePara.textContent = "Better luck next time!";
        }

        resultsContainer.appendChild(scorePhoto);
        resultsContainer.appendChild(scorePara);
        document.body.appendChild(resultsContainer);
    }

    //The timer

    timer() {
        const minutes = Math.floor(this.time / 60);
        let seconds = this.time % 60;
        seconds = seconds < 10 ? '0' + seconds : seconds; 
        this.countDown.innerHTML = `${minutes}:${seconds}`;

        if (this.time <= 30) {
            this.countDown.classList.add('timer-end');
        } else {
            this.countDown.classList.remove('timer-end');
        }
        this.time--;


        if (this.time < 0) {
            this.submitQuiz();
        }
        
    }

    //the usename in the sidebar
    setUserName() {
        const fullName = this.firstName.value.trim() + ' ' + this.lastName.value.trim();
        localStorage.setItem('userName', fullName);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});
