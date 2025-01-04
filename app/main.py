from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from .models import Participant, Group, User
from . import db
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os

main = Blueprint('main', __name__)

@main.route('/')
@login_required
def index():
    groups = current_user.groups
    return render_template('index.html', groups=groups)

@main.route('/groups')
@login_required
def groups():
    groups = Group.query.all()
    return render_template('groups.html', groups=groups)

@main.route('/change_group_name', methods=['POST'])
@login_required
def change_group_name():
    group_id = request.form.get('group_id')
    new_group_name = request.form.get('new_group_name')
    group = Group.query.get(group_id)
    if group and group.creator == current_user:
        group.name = new_group_name
        db.session.commit()
        flash('Group name changed successfully.')
    else:
        flash('You do not have permission to change the name of this group.')
    return redirect(url_for('main.groups'))

@main.route('/delete_group', methods=['POST'])
@login_required
def delete_group():
    group_id = request.form.get('group_id')
    group = Group.query.get(group_id)
    if group and group.creator == current_user:
        # Delete participants associated with the group
        Participant.query.filter_by(group_id=group_id).delete()
        
        db.session.delete(group)
        db.session.commit()
        flash('Group deleted successfully.')
    else:
        flash('You do not have permission to delete this group. Ask the group creator to delete this group.')
    return redirect(url_for('main.groups'))

@main.route('/invite', methods=['POST'])
@login_required
def invite():
    email = request.form['email']
    group_id = request.form['group_id']
    group = Group.query.get(group_id)

    if group and group.creator == current_user:
        message = Mail(
            from_email='mail@breitfeld.net',
            to_emails=email,
            subject='Secret Santa Group Invitation',
            html_content=f"Hi, you have been invited to join the Secret Santa group '{group.name}'."
        )
        try:
            sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
            response = sg.send(message)
            print(response.status_code)
            print(response.body)
            print(response.headers)
        except Exception as e:
            print(str(e))

        flash('Invitation sent!')
    else:
        flash('You do not have permission to invite users to this group.')

    return redirect(url_for('main.index'))

@main.route('/create_group', methods=['POST'])
@login_required
def create_group():
    group_name = request.form.get('new_group_name')
    if group_name:
        existing_group = Group.query.filter_by(name=group_name).first()
        if existing_group:
            flash('A group with this name already exists. Please choose a different name.')
        else:
            group = Group(name=group_name, creator=current_user)
            db.session.add(group)
            db.session.commit()
            
            # Add the creator as a participant in the group
            participant = Participant(name=current_user.name, email=current_user.email, group_id=group.id)
            db.session.add(participant)
            db.session.commit()
            
            flash('New group created successfully.')
    else:
        flash('Group name cannot be empty.')
    return redirect(url_for('main.groups'))

@main.route('/delete_participant', methods=['POST'])
@login_required
def delete_participant():
    participant_id = request.form.get('participant_id')
    participant = Participant.query.get(participant_id)
    if participant and participant.group.creator == current_user:
        db.session.delete(participant)
        db.session.commit()
        flash('Participant deleted successfully.')
    else:
        flash('You do not have permission to delete this participant.')
    return redirect(url_for('main.groups'))
