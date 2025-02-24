import { supabase } from './supabase.js';

async function loadTasks() {
    try {
        const taskList = document.getElementById('taskList');
        const completedTaskList = document.getElementById('completedTaskList');
        taskList.innerHTML = '';
        completedTaskList.innerHTML = '';

        const { data: tasks, error } = await supabase.from('tasks').select('*');
        if (error) throw error;

        tasks.forEach(renderTask);
    } catch (err) {
        console.error('Ошибка загрузки задач:', err);
    }
}

function renderTask(task) {
    const li = document.createElement('li');
    li.innerHTML = `
        <span>${task.text}</span>
        <div class="task-buttons">
            <button class="delete-btn" data-id="${task.id}">❌</button>
            <button class="toggle-btn" data-id="${task.id}">${task.completed ? '🔄' : '✅'}</button>
        </div>
    `;

    document.querySelectorAll(`[data-id="${task.id}"]`).forEach(el => el.parentElement.remove());

    (task.completed ? completedTaskList : taskList).appendChild(li);
}

async function addTask() {
    try {
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();
        if (!taskText) return;

        const { error } = await supabase.from('tasks').insert([{ text: taskText, completed: false }]);
        if (error) throw error;

        taskInput.value = '';
        loadTasks();
    } catch (err) {
        console.error('Ошибка при добавлении задачи:', err);
    }
}

async function deleteTask(taskId) {
    try {
        const { error } = await supabase.from('tasks').delete().match({ id: taskId });
        if (error) throw error;
        loadTasks();
    } catch (err) {
        console.error('Ошибка при удалении задачи:', err);
    }
}

async function toggleTaskStatus(taskId) {
    try {
        const { data: task, error: fetchError } = await supabase.from('tasks').select('completed').eq('id', taskId).single();
        if (fetchError) throw fetchError;

        const { error: updateError } = await supabase.from('tasks').update({ completed: !task.completed }).match({ id: taskId });
        if (updateError) throw updateError;

        loadTasks();
    } catch (err) {
        console.error('Ошибка при изменении статуса задачи:', err);
    }
}

document.getElementById('addTask').addEventListener('click', addTask);

document.body.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        await deleteTask(e.target.dataset.id);
    }
    if (e.target.classList.contains('toggle-btn')) {
        await toggleTaskStatus(e.target.dataset.id);
    }
});

document.addEventListener('DOMContentLoaded', loadTasks);
