function addEditDeleteButtons(task_elem) {
                var editBtn = $('<span>')
                    .addClass('edit-btn')
                    .text('✎')
                    .on('click', function() {
                        var updatedTask = prompt('Редактировать задание:', task_elem.find('span.task-text').text());
                        if (updatedTask !== null) {
                            task_elem.find('span.task-text').text(updatedTask);
                        }
                    });

                var deleteBtn = $('<span>')
                    .addClass('edit-btn')
                    .text('❌')
                    .on('click', function() {
                        if (task_elem.hasClass('important')) {
                            // Если задача важная, показываем модальное окно подтверждения удаления
                            $('#deleteModal').show();

                            // Обработка кнопок в модальном окне
                            $('#confirmDelete').on('click', function() {
                                task_elem.remove();
                                $('#deleteModal').hide();
                            });

                            $('#cancelDelete').on('click', function() {
                                $('#deleteModal').hide();
                            });
                        } else {
                            task_elem.remove();
                        }
                    });

                task_elem.append(editBtn).append(deleteBtn);
            }

            function fetchUserData(userId, callback) {
                var userUrl = 'https://jsonplaceholder.typicode.com/users/' + userId;

                $.ajax({
                    url: userUrl,
                    method: 'get',
                    dataType: 'json',
                    success: function(user) {
                        callback(user.name);
                    },
                    error: function() {
                        callback('Unknown User');
                    }
                });
            }

            function showError(message) {
                $('#userIdError').text(message);
            }

            $('#taskForm').on('submit', function(e) {
                e.preventDefault();

                var title = $('#title').val();
                var body = $('#body').val();
                var userId = $('#userId').val();
                var isImportant = $('#important').prop('checked');

                if (userId > 0 || userId < 11) {
                    showError('');
                } else {

                    showError('Введите корректный ID пользователя (1-10).');
                    return;
                }

                var task_elem = $('<div>')
                    .addClass('task')
                    .append('<input type="checkbox">')
                    .append('<span class="task-text">' + title + '</span>')
                    .append('<div class="creator"></div>');

                if (isImportant) {
                    task_elem.addClass('important');
                }

                addEditDeleteButtons(task_elem);

                if (isImportant) {
                    // Если задача важная, добавляем ее в начало списка
                    $('#tasks').prepend(task_elem);
                } else {
                    // Если задача не важная, добавляем ее в конец списка
                    $('#tasks').append(task_elem);
                }

                $.ajax({
                    url: 'https://jsonplaceholder.typicode.com/todos',
                    method: 'post',
                    dataType: 'json',
                    data: {
                        title: title,
                        body: body,
                        userId: userId,
                        completed: false
                    },
                    success: function(response) {
                        fetchUserData(userId, function(creatorName) {
                            task_elem.find('.creator').text('Created by: ' + creatorName);
                        });

                        console.log(response);
                        console.log(JSON.stringify(response));
                    },
                });
            });

            $('body').on('click', 'input[type="checkbox"]', function() {
                var task = $(this).parents('.task');

                if(task.hasClass('strikeout')) {
                    task.removeClass('strikeout');
                    if (task.hasClass('important')) {
                        // Если задача важная, перемещаем обратно в начало списка
                        task.prependTo($('#tasks'));
                    } else {
                        // Если задача не важная, перемещаем обратно в конец списка
                        task.appendTo($('#tasks'));
                    }
                } else {
                    task.addClass('strikeout');
                    task.appendTo($('#done'));
                }
            });

            $('#tasks, #done').on('mouseenter', '.task', function() {
                $(this).find('.edit-btn').show();
            });

            $('#tasks, #done').on('mouseleave', '.task', function() {
                $(this).find('.edit-btn').hide();
            });

            function toggleTheme() {
                $('body').toggleClass('light-mode dark-mode');
                var currentTheme = $('body').hasClass('light-mode') ? 'light' : 'dark';
                localStorage.setItem('theme', currentTheme);
                if (currentTheme === 'light') {
                    $('#modal-btn.cancel, #taskForm button, #checkbox, #title, #body, #userId, #important').css('background-color', '#fff');
                    $('#modal-btn.cancel, #taskForm button, #checkbox, #title, #body, #userId, #important').css('color', '#000');
                } else {
                    $('#modal-btn.cancel, #taskForm button, #checkbox, #title, #body, #userId, #important').css('background-color', '#333');
                    $('#modal-btn.cancel, #taskForm button, #checkbox, #title, #body, #userId, #important').css('color', '#fff');
                }
            }

            // Проверяем сохраненную тему в localStorage при загрузке страницы
            var savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                $('body').addClass(savedTheme + '-mode');
                if (savedTheme === 'dark') {
                    $('#modal-btn.cancel, #taskForm button, #title, #body, #userId, #important').css('background-color', '#333');
                    $('#modal-btn.cancel, #taskForm button, #title, #body, #userId, #important').css('color', '#fff');
                }
            }