// ============================================
// PRODUCTIVITY DASHBOARD - JAVASCRIPT
// ============================================

// ============================================
// 1. TAB SWITCHING
// ============================================
const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons and tabs
        navBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(tab => tab.classList.remove('active'));

        // Add active class to clicked button and corresponding tab
        btn.classList.add('active');
        const tabName = btn.getAttribute('data-tab');
        document.getElementById(tabName + '-tab').classList.add('active');
    });
});

// ============================================
// 2. POMODORO TIMER
// ============================================
let pomodoroState = {
    timeLeft: 25 * 60, // in seconds
    isRunning: false,
    isWorkSession: true,
    workDuration: 25,
    breakDuration: 5,
    sessionsCompleted: 0,
    timerInterval: null
};

const timerMinutes = document.getElementById('timer-minutes');
const timerSeconds = document.getElementById('timer-seconds');
const statusText = document.getElementById('status-text');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const workDurationInput = document.getElementById('work-duration');
const breakDurationInput = document.getElementById('break-duration');
const sessionsCount = document.getElementById('sessions-count');

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(pomodoroState.timeLeft / 60);
    const seconds = pomodoroState.timeLeft % 60;

    timerMinutes.textContent = minutes < 10 ? '0' + minutes : minutes;
    timerSeconds.textContent = seconds < 10 ? '0' + seconds : seconds;
}

// Update status text
function updateStatus() {
    statusText.textContent = pomodoroState.isWorkSession ? 'Work Session' : 'Break Time';
}

// Start timer
startBtn.addEventListener('click', () => {
    if (!pomodoroState.isRunning) {
        pomodoroState.isRunning = true;
        startBtn.textContent = 'Running...';
        startBtn.disabled = true;

        pomodoroState.timerInterval = setInterval(() => {
            pomodoroState.timeLeft--;

            if (pomodoroState.timeLeft < 0) {
                // Time's up! Switch session
                clearInterval(pomodoroState.timerInterval);
                pomodoroState.isRunning = false;
                startBtn.textContent = 'Start';
                startBtn.disabled = false;

                if (pomodoroState.isWorkSession) {
                    pomodoroState.sessionsCompleted++;
                    sessionsCount.textContent = pomodoroState.sessionsCompleted;
                    alert('Work session complete! Time for a break.');
                }

                // Switch sessions
                pomodoroState.isWorkSession = !pomodoroState.isWorkSession;
                resetTimer();
                updateStatus();
            }

            updateTimerDisplay();
        }, 1000);
    }
});

// Pause timer
pauseBtn.addEventListener('click', () => {
    if (pomodoroState.isRunning) {
        clearInterval(pomodoroState.timerInterval);
        pomodoroState.isRunning = false;
        startBtn.textContent = 'Start';
        startBtn.disabled = false;
    }
});

// Reset timer
function resetTimer() {
    pomodoroState.timeLeft = pomodoroState.isWorkSession
        ? pomodoroState.workDuration * 60
        : pomodoroState.breakDuration * 60;
    updateTimerDisplay();
}

resetBtn.addEventListener('click', () => {
    if (pomodoroState.isRunning) {
        clearInterval(pomodoroState.timerInterval);
        pomodoroState.isRunning = false;
    }
    pomodoroState.isWorkSession = true;
    pomodoroState.timeLeft = pomodoroState.workDuration * 60;
    startBtn.textContent = 'Start';
    startBtn.disabled = false;
    updateTimerDisplay();
    updateStatus();
});

// Update work duration
workDurationInput.addEventListener('change', () => {
    pomodoroState.workDuration = parseInt(workDurationInput.value);
    if (!pomodoroState.isRunning && pomodoroState.isWorkSession) {
        resetTimer();
    }
});

// Update break duration
breakDurationInput.addEventListener('change', () => {
    pomodoroState.breakDuration = parseInt(breakDurationInput.value);
    if (!pomodoroState.isRunning && !pomodoroState.isWorkSession) {
        resetTimer();
    }
});

// Initialize pomodoro display
updateTimerDisplay();
updateStatus();

// ============================================
// 3. TODO LIST
// ============================================
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoList = document.getElementById('todo-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalTasks = document.getElementById('total-tasks');
const completedTasks = document.getElementById('completed-tasks');

// Render todos
function renderTodos() {
    todoList.innerHTML = '';

    let filteredTodos = todos;
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }

    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">No tasks yet. Add one to get started!</div>';
    } else {
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

            li.innerHTML = `
                <div class="todo-content">
                    <input 
                        type="checkbox" 
                        class="todo-checkbox" 
                        ${todo.completed ? 'checked' : ''}
                        data-id="${todo.id}"
                    >
                    <span class="todo-text">${todo.text}</span>
                </div>
                <div class="todo-actions">
                    <button class="todo-delete-btn" data-id="${todo.id}">Delete</button>
                </div>
            `;

            todoList.appendChild(li);

            // Add event listeners
            li.querySelector('.todo-checkbox').addEventListener('change', (e) => {
                toggleTodo(parseInt(e.target.getAttribute('data-id')));
            });

            li.querySelector('.todo-delete-btn').addEventListener('click', (e) => {
                deleteTodo(parseInt(e.target.getAttribute('data-id')));
            });
        });
    }

    updateTodoStats();
}

// Add todo
function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') return;

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    todos.push(newTodo);
    todoInput.value = '';
    saveTodos();
    renderTodos();
}

// Toggle todo completion
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

// Delete todo
function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

// Update todo stats
function updateTodoStats() {
    const completed = todos.filter(t => t.completed).length;
    totalTasks.textContent = todos.length;
    completedTasks.textContent = completed;
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Add todo button click
addTodoBtn.addEventListener('click', addTodo);

// Add todo on Enter key
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Filter todos
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderTodos();
    });
});

// Initial render
renderTodos();

// ============================================
// 4. NOTES
// ============================================
const notesTextarea = document.getElementById('notes-textarea');
const saveNotesBtn = document.getElementById('save-notes-btn');
const clearNotesBtn = document.getElementById('clear-notes-btn');

// Load notes from localStorage
function loadNotes() {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
        notesTextarea.value = savedNotes;
    }
}

// Save notes
function saveNotes() {
    localStorage.setItem('notes', notesTextarea.value);
    alert('Notes saved!');
}

// Auto-save notes every 10 seconds
setInterval(() => {
    localStorage.setItem('notes', notesTextarea.value);
}, 10000);

// Save button click
saveNotesBtn.addEventListener('click', saveNotes);

// Clear notes
clearNotesBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all notes?')) {
        notesTextarea.value = '';
        localStorage.setItem('notes', '');
        alert('Notes cleared!');
    }
});

// Load notes on page load
loadNotes();

// ============================================
// 5. INITIALIZATION
// ============================================
console.log('Productivity Dashboard loaded successfully!');
