@app.route('/journal_templates')
def journal_templates():
    \"\"\"Journal templates for mood entries\"\"\"
    user = get_current_user()
    if not user:
        flash('Please log in to access journal templates', 'warning')
        return redirect(url_for('login'))
    
    templates_data = {
        'gratitude': {
            'title': 'Gratitude Journal',
            'description': 'Focus on positive aspects of your day',
            'color': 'success',
            'icon': 'fas fa-heart',
            'prompts': [
                'What are 3 things you are grateful for today?',
                'Who made a positive impact on your day?',
                'What small joy did you experience?',
                'What challenged you and how did you overcome it?',
                'What made you smile today?'
            ]
        },
        'reflection': {
            'title': 'Daily Reflection',
            'description': 'Reflect on your thoughts and emotions',
            'color': 'primary',
            'icon': 'fas fa-mirror',
            'prompts': [
                'How did you feel throughout the day?',
                'What emotions did you experience most?',
                'What challenged you today?',
                'What did you learn about yourself?',
                'What would you do differently tomorrow?'
            ]
        },
        'goals': {
            'title': 'Goal Setting',
            'description': 'Plan and track your personal goals',
            'color': 'warning',
            'icon': 'fas fa-target',
            'prompts': [
                'What do you want to achieve tomorrow?',
                'What steps will you take to reach your goals?',
                'How will you measure your success?',
                'What obstacles might you face?',
                'Who can support you in achieving this goal?'
            ]
        },
        'anxiety': {
            'title': 'Anxiety Check-in',
            'description': 'Process anxious thoughts and feelings',
            'color': 'info',
            'icon': 'fas fa-cloud-rain',
            'prompts': [
                'What is making you feel anxious right now?',
                'What physical sensations do you notice?',
                'What thoughts are going through your mind?',
                'What would you tell a friend in this situation?',
                'What is one small step you can take to feel better?'
            ]
        },
        'celebration': {
            'title': 'Celebration Journal',
            'description': 'Acknowledge your wins and achievements',
            'color': 'danger',
            'icon': 'fas fa-trophy',
            'prompts': [
                'What did you accomplish today, no matter how small?',
                'What are you proud of yourself for?',
                'What progress have you made recently?',
                'How have you grown as a person?',
                'What positive feedback have you received?'
            ]
        }
    }

    return render_template('journal_templates.html',
                         user=user, 
                         templates=templates_data)
