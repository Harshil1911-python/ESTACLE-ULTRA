"""Admin settings routes."""

from flask import (
    render_template, request, redirect, url_for, session, flash,
    current_app, make_response
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import json
import csv
import io

from core.db import get_db, migrate_db
from core.helpers import (
    login_required, role_required, get_setting, set_setting,
    format_money, log_activity, get_redirect_for_role
)
from routes.admin import admin


@admin.route('/admin/settings', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def admin_settings():
    if request.method == 'POST':
        currency = request.form.get('currency', 'INR')
        if currency not in ('USD', 'INR', 'AED'):
            flash('Invalid currency.', 'danger')
            return redirect(url_for('admin.admin_settings'))
        set_setting('currency', currency)
        set_setting('company_name', request.form.get('company_name', 'Estacle').strip() or 'Estacle')
        set_setting('support_email', request.form.get('support_email', '').strip())
        set_setting('support_phone', request.form.get('support_phone', '').strip())
        set_setting('timezone', request.form.get('timezone', 'Asia/Kolkata').strip() or 'Asia/Kolkata')
        set_setting('address', request.form.get('address', '').strip())
        flash('Settings saved.', 'success')
        return redirect(url_for('admin.admin_settings'))
    settings = {
        'currency': get_setting('currency', 'INR'),
        'company_name': get_setting('company_name', 'Estacle'),
        'support_email': get_setting('support_email', 'support@estacle.com'),
        'support_phone': get_setting('support_phone', ''),
        'timezone': get_setting('timezone', 'Asia/Kolkata'),
        'address': get_setting('address', ''),
    }
    return render_template('admin_settings.html', **settings)


# ---------- Property detail / edit ----------


