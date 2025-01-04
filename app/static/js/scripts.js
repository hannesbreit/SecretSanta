function showInviteForm(groupId) {
    const inviteFormContainer = document.querySelector(`#invite-form-container-${groupId}`);
    inviteFormContainer.style.display = 'table-row';
}

function editGroupName(groupId) {
    const container = document.querySelector(`#group-name-container-${groupId}`);
    const form = document.querySelector(`#edit-form-${groupId}`);
    const groupName = container.querySelector('.group-name');

    form.style.display = 'inline';
    form.style.position = 'relative';
    groupName.style.display = 'none';
}

function cancelEdit(groupId) {
    const container = document.querySelector(`#group-name-container-${groupId}`);
    const form = document.querySelector(`#edit-form-${groupId}`);
    const groupName = container.querySelector('.group-name');

    form.style.display = 'none';
    groupName.style.display = 'inline';
}

function confirmDelete(groupId) {
    if (confirm('Are you sure you want to delete this group?')) {
        document.querySelector(`#delete-form-${groupId}`).submit();
    }
}

function checkGroupName() {
    const groupNameInput = document.getElementById('new_group_name');
    const groupNameFeedback = document.getElementById('group-name-feedback');
    const groupName = groupNameInput.value;

    if (groupName.length > 0) {
        fetch('/check_group_name', { 
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('input[name="csrf_token"]').value
            },
            body: JSON.stringify({ group_name: groupName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                groupNameFeedback.textContent = 'Group name already exists. Please choose a different name.';
                groupNameFeedback.style.color = 'red';
            } else {
                groupNameFeedback.textContent = 'Group name is available.';
                groupNameFeedback.style.color = 'green';
            }
        });
    } else {
        groupNameFeedback.textContent = '';
    }
}

function addCreateGroupCard() {
    const container = document.getElementById('create-group-container');
    const card = document.createElement('div');
    card.className = 'card mt-4';
    card.innerHTML = `
        <div class="card-body">
            <form action="/create_group" method="post">
                <div class="form-group">
                    <label for="new_group_name">Group Name</label>
                    <input type="text" class="form-control" id="new_group_name" name="new_group_name" required oninput="checkGroupName()">
                    <div id="group-name-feedback" class="mt-2"></div>
                </div>
                <button type="submit" class="btn btn-primary">Create</button>
            </form>
        </div>
    `;
    container.insertBefore(card, container.firstChild);
}

function showSection(sectionId) {
    document.getElementById('existing-group').style.display = 'none';
    document.getElementById('new-group').style.display = 'none';
    document.getElementById(sectionId).style.display = 'block';
}

function checkPasswords() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const feedback = document.getElementById('password-feedback');
    const passwordPattern = /^(?=.*\d)(?=.*[!"§.,-_?´`'(){}|<>=+@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

    if (!passwordPattern.test(password)) {
        document.getElementById('password').style.borderColor = 'red';
        feedback.textContent = 'Password must be at least 8 characters long, contain at least one number, and one special character.';
        feedback.style.color = 'red';
    } else if (password === confirmPassword && password.length > 0) {
        document.getElementById('password').style.borderColor = 'green';
        document.getElementById('confirm_password').style.borderColor = 'green';
        feedback.textContent = 'Passwords match.';
        feedback.style.color = 'green';
    } else if (passwordPattern.test(password)) {
        document.getElementById('password').style.borderColor = 'green';
        feedback.textContent = '';
    } else {
        document.getElementById('password').style.borderColor = 'red';
        document.getElementById('confirm_password').style.borderColor = 'red';
        feedback.textContent = 'Passwords do not match.';
        feedback.style.color = 'red';
    }
}

document.getElementById('password').addEventListener('input', checkPasswords);
document.getElementById('confirm_password').addEventListener('input', checkPasswords);

function checkEmail() {
    const email = document.getElementById('email').value;
    const feedback = document.getElementById('email-feedback');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailPattern.test(email)) {
        document.getElementById('email').style.borderColor = 'green';
        feedback.textContent = 'Valid email address.';
        feedback.style.color = 'green';
    } else {
        document.getElementById('email').style.borderColor = 'red';
        feedback.textContent = 'Invalid email address.';
        feedback.style.color = 'red';
    }
}

document.getElementById('email').addEventListener('input', checkEmail);

function checkForm() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const registerButton = document.getElementById('register-button');

    if (name && email && password && confirmPassword && password === confirmPassword && document.getElementById('email').style.borderColor === 'green') {
        registerButton.disabled = false;
    } else {
        registerButton.disabled = true;
    }
}
