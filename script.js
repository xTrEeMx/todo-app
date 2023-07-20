const form = document.querySelector('form');
const description_input = document.querySelector('.add-description');
const date_input = document.querySelector('.add-date');
const priority_input = document.querySelector('.add-priority');
const todo_list = document.querySelector('.todo-list');
const today = new Date();

form.addEventListener('submit', function (event) {
    event.preventDefault();

    const todo_description = description_input.value;
    const todo_date = new Date(date_input.value);
    const todo_priority = priority_input.value;

    const todo_data = {
        description: todo_description,
        date: todo_date.toISOString(),
        priority: todo_priority
    }

    console.log(todo_data);

    if (todo_description.trim() === '') {
        description_input.insertAdjacentHTML('afterend', '<span class="error">Please enter a todo description</span>');
        description_input.classList.add('error');
        return;
    } else if (isNaN(todo_date.getTime()) || todo_date <= today) {
        date_input.insertAdjacentHTML('afterend', '<span class="error">Please enter a valid date</span>');
        date_input.classList.add('error');
        return;
    } else if (todo_priority.trim() === '') {
        priority_input.insertAdjacentHTML('afterend', '<span class="error">Please enter a todo priority</span>');
        priority_input.classList.add('error');
        return;
    }

    const todo_item = createTodoItem(todo_data.description, new Date(todo_data.date), todo_data.priority);

    const todo_id = Date.now();
    localStorage.setItem(`todo_${todo_id}`, JSON.stringify(todo_data));

    todo_item.setAttribute('data-todo-id', todo_id);
    todo_list.appendChild(todo_item);

    resetInputs();

    console.log('form is submitted');
});

description_input.addEventListener('click', function () {
    clearError(description_input);
});

date_input.addEventListener('click', function () {
    clearError(date_input);
});

priority_input.addEventListener('click', function () {
    clearError(priority_input);
});

function clearError(inputField) {
    if (inputField?.classList.contains('error')) {
        inputField.classList.remove('error');
    }
    const errorSpan = inputField.nextElementSibling;
    if (errorSpan?.classList.contains('error')) {
        errorSpan.remove();
    }
}

function resetInputs() {
    description_input.value = '';
    date_input.value = '';
    priority_input.value = '';
}

function createTodoItem(description, date, priority) {
    const todo_item = document.createElement('div');
    todo_item.classList.add('todo-item');
    todo_item.innerHTML = `
        <div class="todo-description">${description}</div>
        <div class="todo-date">${formatDate(date)}</div>
        <div class="todo-priority">${priority}</div>
        <div class="todo-actions">
            <button class="todo-edit-btn" type="button">Edit</button>
            <button class="todo-delete-btn" type="button">Delete</button>
        </div>
    `;
    todo_item.querySelector('.todo-edit-btn').addEventListener('click', editTodoItem);
    todo_item.querySelector('.todo-delete-btn').addEventListener('click', deleteTodoItem)
    return todo_item;
}

function loadTodoItems() {
    const todos = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key.startsWith('todo_')) {
            const todo_data = JSON.parse(localStorage.getItem(key));
            todos.push({
                id: key.substring(5),
                date: new Date(todo_data.date),
                data: todo_data
            });
        }
    }

    todos.sort((a, b) => a.date - b.date);

    for (let i = 0; i < todos.length; i++) {
        const todo_data = todos[i].data;
        const todo_item = createTodoItem(todo_data.description, new Date(todo_data.date), todo_data.priority);
        todo_item.setAttribute('data-todo-id', todos[i].id);
        todo_list.appendChild(todo_item);
    }
}

function editTodoItem(event) {
    const todo_item = event.target.closest('.todo-item');
    const todo_id = todo_item.getAttribute('data-todo-id');
    const todo_data = JSON.parse(localStorage.getItem(`todo_${todo_id}`));
    const description_span = todo_item.querySelector('.todo-description');
    const date_span = todo_item.querySelector('.todo-date');
    const priority_span = todo_item.querySelector('.todo-priority');
    const edit_button = todo_item.querySelector('.todo-edit-btn') ?? todo_item.querySelector('.todo-save-btn');
    const delete_button = todo_item.querySelector('.todo-delete-btn');

    if (edit_button.textContent === 'Edit') {
        edit_button.textContent = 'Save';
        edit_button.classList.remove('todo-edit-btn');
        edit_button.classList.add('todo-save-btn');
        delete_button.textContent = 'Cancel';

        const description_input = document.createElement('input');
        description_input.type = 'text';
        description_input.classList.add('todo-description-update');
        description_input.value = todo_data.description;

        const date_input = document.createElement('input');
        date_input.type = 'date';
        date_input.classList.add('todo-date-update');
        date_input.value = new Date(todo_data.date).toISOString().split('T')[0];

        const priority_input = document.createElement('input');
        priority_input.type = 'text';
        priority_input.classList.add('todo-priority-update');
        priority_input.value = todo_data.priority;

        description_span.replaceWith(description_input);
        date_span.replaceWith(date_input);
        priority_span.replaceWith(priority_input);
        description_input.focus();
    } else {
        const updated_description = todo_item.querySelector('.todo-description-update').value;
        const updated_date = new Date(todo_item.querySelector('.todo-date-update').value);
        const updated_priority = todo_item.querySelector('.todo-priority-update').value;

        if (updated_description.trim() === '') {
            alert('Please enter a todo description');
            description_input.focus();
            return;
        } else if (!updated_date || isNaN(updated_date.getTime())) {
            alert('Please enter a valid date');
            date_input.focus();
            return;
        } else if (updated_priority.trim() === '') {
            alert('Please enter a todo priority');
            priority_input.focus();
            return;
        }

        edit_button.textContent = 'Edit';
        edit_button.classList.remove('todo-save-btn');
        edit_button.classList.add('todo-edit-btn');
        delete_button.textContent = 'Delete';

        const updated_todo_data = {
            description: updated_description,
            date: updated_date.toISOString(),
            priority: updated_priority
        };
        localStorage.setItem(`todo_${todo_id}`, JSON.stringify(updated_todo_data));

        const description_span = document.createElement('span');
        description_span.classList.add('todo-description');
        description_span.textContent = updated_description;

        const date_span = document.createElement('span');
        date_span.classList.add('todo-date');
        date_span.textContent = updated_date.toLocaleDateString();

        const priority_span = document.createElement('span');
        priority_span.classList.add('todo-priority');
        priority_span.textContent = updated_priority;

        todo_item.querySelector('.todo-description-update').replaceWith(description_span);
        todo_item.querySelector('.todo-date-update').replaceWith(date_span);
        todo_item.querySelector('.todo-priority-update').replaceWith(priority_span);
    }
}

function deleteTodoItem(event) {
    const todo_item = event.target.closest('.todo-item');
    const todo_id = todo_item.getAttribute('data-todo-id');
    const delete_button = event.target;

    if (delete_button.textContent === 'Delete') {
        localStorage.removeItem(`todo_${todo_id}`);
        todo_item.remove();
    } else if (delete_button.textContent === 'Cancel') {
        const edit_button = todo_item.querySelector('.todo-edit-btn');
        delete_button.textContent = 'Delete';
        edit_button.textContent = 'Edit';
        const todo_data = JSON.parse(localStorage.getItem(`todo_${todo_id}`));
        const description_field = todo_item.querySelector('.todo-description');
        const date_field = todo_item.querySelector('.todo-date');
        const priority_field = todo_item.querySelector('.todo-priority');
        description_field.textContent = todo_data.description;
        date_field.textContent = new Date(todo_data.date).toLocaleDateString();
        priority_field.textContent = todo_data.priority;
        description_field.contentEditable = false;
        date_field.contentEditable = false;
        priority_field.contentEditable = false;
        description_field.classList.remove('editing');
        date_field.classList.remove('editing');
        priority_field.classList.remove('editing');
    }
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

window.addEventListener('load', function () {
    loadTodoItems();
});