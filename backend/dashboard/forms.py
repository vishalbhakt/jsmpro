from django import forms
from django.contrib.auth import get_user_model
from users.models import StudentProfile, TeacherProfile
from cms.models import Inquiry, ContactMessage
from learning.models import Assignment, Note, VideoLecture
from academics.models import Result, ClassRoom, Subject

User = get_user_model()

class LoginForm(forms.Form):
    username = forms.CharField(widget=forms.TextInput(attrs={
        "class": "form-control rounded-pill px-4 py-3", "placeholder": "Username or Email"
    }))
    password = forms.CharField(widget=forms.PasswordInput(attrs={
        "class": "form-control rounded-pill px-4 py-3", "placeholder": "Password"
    }))

class ContactForm(forms.ModelForm):
    class Meta:
        model = ContactMessage
        fields = ["name", "email", "phone", "message"]
        widgets = {
            "name": forms.TextInput(attrs={"class": "form-control rounded-xl p-3", "placeholder": "Enter full name"}),
            "email": forms.EmailInput(attrs={"class": "form-control rounded-xl p-3", "placeholder": "Enter email address"}),
            "phone": forms.TextInput(attrs={"class": "form-control rounded-xl p-3", "placeholder": "Enter contact number"}),
            "message": forms.Textarea(attrs={"class": "form-control rounded-xl p-3", "rows": 4, "placeholder": "Write your query..."}),
        }

class AdmissionInquiryForm(forms.ModelForm):
    class Meta:
        model = Inquiry
        fields = ["student_name", "guardian_name", "email", "phone", "preferred_class", "message"]
        widgets = {
            "student_name": forms.TextInput(attrs={"class": "form-control rounded-xl p-3", "placeholder": "Student's Full Name"}),
            "guardian_name": forms.TextInput(attrs={"class": "form-control rounded-xl p-3", "placeholder": "Guardian's Full Name"}),
            "email": forms.EmailInput(attrs={"class": "form-control rounded-xl p-3", "placeholder": "Email Address"}),
            "phone": forms.TextInput(attrs={"class": "form-control rounded-xl p-3", "placeholder": "Contact Number"}),
            "preferred_class": forms.TextInput(attrs={"class": "form-control rounded-xl p-3", "placeholder": "Class seeking admission to (e.g. Grade 10)"}),
            "message": forms.Textarea(attrs={"class": "form-control rounded-xl p-3", "rows": 3, "placeholder": "Any special remarks or prior academy details..."}),
        }

class ProfileUpdateForm(forms.ModelForm):
    gender = forms.ChoiceField(choices=[("", "-- Select --"), ("Male", "Male"), ("Female", "Female"), ("Other", "Other")], widget=forms.Select(attrs={"class": "form-select rounded-xl p-3"}), required=False)
    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "phone", "bio", "date_of_birth", "gender", "address", "city", "state", "country", "pincode", "avatar"]
        widgets = {
            "first_name": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "last_name": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "email": forms.EmailInput(attrs={"class": "form-control rounded-xl p-3"}),
            "phone": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "bio": forms.Textarea(attrs={"class": "form-control rounded-xl p-3", "rows": 3}),
            "date_of_birth": forms.DateInput(attrs={"class": "form-control rounded-xl p-3", "type": "date"}),
            "address": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "city": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "state": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "country": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "pincode": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "avatar": forms.FileInput(attrs={"class": "form-control rounded-xl p-3"}),
        }

class StudentProfileForm(forms.ModelForm):
    class Meta:
        model = StudentProfile
        fields = ["roll_number", "blood_group", "guardian_name", "guardian_phone", "father_name", "mother_name", "emergency_contact", "house", "bus_route", "aadhaar_number"]
        widgets = {
            "roll_number": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "blood_group": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "guardian_name": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "guardian_phone": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "father_name": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "mother_name": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "emergency_contact": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "house": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "bus_route": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "aadhaar_number": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
        }

class TeacherProfileForm(forms.ModelForm):
    class Meta:
        model = TeacherProfile
        fields = ["designation", "qualification", "department", "subjects_taught", "blood_group", "emergency_contact"]
        widgets = {
            "designation": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "qualification": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "department": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "subjects_taught": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "blood_group": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "emergency_contact": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
        }

class UserChangePasswordForm(forms.Form):
    old_password = forms.CharField(widget=forms.PasswordInput(attrs={"class": "form-control rounded-xl p-3", "placeholder": "Current Password"}))
    new_password = forms.CharField(widget=forms.PasswordInput(attrs={"class": "form-control rounded-xl p-3", "placeholder": "New Password"}))
    confirm_password = forms.CharField(widget=forms.PasswordInput(attrs={"class": "form-control rounded-xl p-3", "placeholder": "Confirm New Password"}))

# LMS Forms
class AssignmentForm(forms.ModelForm):
    class Meta:
        model = Assignment
        fields = ["classroom", "subject", "title", "description", "due_at", "attachment", "points", "status"]
        widgets = {
            "classroom": forms.Select(attrs={"class": "form-select rounded-xl p-3"}),
            "subject": forms.Select(attrs={"class": "form-select rounded-xl p-3"}),
            "title": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "description": forms.Textarea(attrs={"class": "form-control rounded-xl p-3", "rows": 3}),
            "due_at": forms.DateTimeInput(attrs={"class": "form-control rounded-xl p-3", "type": "datetime-local"}),
            "attachment": forms.FileInput(attrs={"class": "form-control rounded-xl p-3"}),
            "points": forms.NumberInput(attrs={"class": "form-control rounded-xl p-3"}),
            "status": forms.Select(attrs={"class": "form-select rounded-xl p-3"}),
        }

class NoteForm(forms.ModelForm):
    class Meta:
        model = Note
        fields = ["classroom", "subject", "title", "description", "file", "is_published"]
        widgets = {
            "classroom": forms.Select(attrs={"class": "form-select rounded-xl p-3"}),
            "subject": forms.Select(attrs={"class": "form-select rounded-xl p-3"}),
            "title": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "description": forms.Textarea(attrs={"class": "form-control rounded-xl p-3", "rows": 3}),
            "file": forms.FileInput(attrs={"class": "form-control rounded-xl p-3"}),
            "is_published": forms.CheckboxInput(attrs={"class": "form-check-input"}),
        }

class VideoLectureForm(forms.ModelForm):
    class Meta:
        model = VideoLecture
        fields = ["classroom", "subject", "title", "description", "video_url", "video_file", "thumbnail", "duration_minutes", "is_published"]
        widgets = {
            "classroom": forms.Select(attrs={"class": "form-select rounded-xl p-3"}),
            "subject": forms.Select(attrs={"class": "form-select rounded-xl p-3"}),
            "title": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "description": forms.Textarea(attrs={"class": "form-control rounded-xl p-3", "rows": 3}),
            "video_url": forms.URLInput(attrs={"class": "form-control rounded-xl p-3"}),
            "video_file": forms.FileInput(attrs={"class": "form-control rounded-xl p-3"}),
            "thumbnail": forms.FileInput(attrs={"class": "form-control rounded-xl p-3"}),
            "duration_minutes": forms.NumberInput(attrs={"class": "form-control rounded-xl p-3"}),
            "is_published": forms.CheckboxInput(attrs={"class": "form-check-input"}),
        }

class UserCRUDForm(forms.ModelForm):
    password = forms.CharField(required=False, widget=forms.PasswordInput(attrs={"class": "form-control rounded-xl p-3", "placeholder": "Leave empty to keep unchanged"}))
    class Meta:
        model = User
        fields = ["username", "email", "first_name", "last_name", "role", "is_active"]
        widgets = {
            "username": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "email": forms.EmailInput(attrs={"class": "form-control rounded-xl p-3"}),
            "first_name": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "last_name": forms.TextInput(attrs={"class": "form-control rounded-xl p-3"}),
            "role": forms.Select(attrs={"class": "form-select rounded-xl p-3"}),
            "is_active": forms.CheckboxInput(attrs={"class": "form-check-input"}),
        }
