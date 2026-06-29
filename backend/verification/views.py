from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
import subprocess
import os

from .models import VerificationReport, VerificationSetting
from .serializers import VerificationReportSerializer, VerificationSettingSerializer

# Helper to run the existing audit script and capture its output
def run_audit():
    # Assume the script is at the project root (same as manage.py)
    script_path = os.path.join(os.getcwd(), 'data_integrity_audit.py')
    # Run via the same python interpreter
    result = subprocess.run(['python', script_path], capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip())
    # The script writes a markdown report to a file; read it back
    report_path = os.path.join(os.getcwd(), 'backend', 'data_integrity_report.md')
    if not os.path.exists(report_path):
        # Fall back to stdout if file missing
        return result.stdout
    with open(report_path, 'r', encoding='utf-8') as f:
        return f.read()

class VerificationReportViewSet(viewsets.GenericViewSet):
    """API for running and retrieving verification reports.
    * `GET /api/verification/` – list reports (most recent first).
    * `GET /api/verification/{id}/` – retrieve a single report.
    * `POST /api/verification/` – trigger a new audit and store the result.
    """
    queryset = VerificationReport.objects.all().order_by('-created_at')
    serializer_class = VerificationReportSerializer

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response({
            'status': status.HTTP_200_OK,
            'message': 'Verification reports retrieved successfully.',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        try:
            report = self.get_object()
        except VerificationReport.DoesNotExist:
            return Response({
                'status': status.HTTP_404_NOT_FOUND,
                'message': f'VerificationReport with id {pk} not found.',
                'data': None
            }, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(report)
        return Response({
            'status': status.HTTP_200_OK,
            'message': 'Report retrieved.',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        # Run the audit script
        try:
            report_text = run_audit()
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'Audit execution failed.',
                'errors': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Save the report
        report = VerificationReport.objects.create(report_text=report_text)
        serializer = self.get_serializer(report)
        return Response({
            'status': status.HTTP_201_CREATED,
            'message': 'Verification report created.',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)

class VerificationSettingViewSet(viewsets.ModelViewSet):
    """CRUD for global verification settings with validation messages.
    * `GET /api/verification/settings/` – retrieve current settings (singleton).
    * `PUT /api/verification/settings/{id}/` – replace all fields.
    * `PATCH /api/verification/settings/{id}/` – partial update.
    * `DELETE` is not allowed – we keep a single settings row.
    """
    queryset = VerificationSetting.objects.all()
    serializer_class = VerificationSettingSerializer

    def list(self, request, *args, **kwargs):
        # Return the first (and only) settings object, creating one if needed
        if not self.queryset.exists():
            VerificationSetting.objects.create()
        setting = self.queryset.first()
        serializer = self.get_serializer(setting)
        return Response({
            'status': status.HTTP_200_OK,
            'message': 'Verification settings retrieved.',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        try:
            setting = self.get_object()
        except VerificationSetting.DoesNotExist:
            return Response({
                'status': status.HTTP_404_NOT_FOUND,
                'message': f'Settings with id {pk} not found.',
                'data': None
            }, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(setting)
        return Response({
            'status': status.HTTP_200_OK,
            'message': 'Verification settings retrieved.',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        # Disallow deletion – keep a singleton settings row
        return Response({
            'status': status.HTTP_405_METHOD_NOT_ALLOWED,
            'message': 'Deletion of verification settings is not allowed.',
            'data': None
        }, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    def update(self, request, *args, **kwargs):
        """
        Full update of verification settings via PUT.
        """
        try:
            setting = self.get_object()
        except VerificationSetting.DoesNotExist:
            return Response({
                'status': status.HTTP_404_NOT_FOUND,
                'message': f'VerificationSetting with id {kwargs.get("pk")} not found.',
                'data': None
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(setting, data=request.data)
        if not serializer.is_valid():
            return Response({
                'status': status.HTTP_400_BAD_REQUEST,
                'message': 'Validation error.',
                'errors': serializer.errors,
                'data': None
            }, status=status.HTTP_400_BAD_REQUEST)

        self.perform_update(serializer)
        return Response({
            'status': status.HTTP_200_OK,
            'message': 'Verification settings updated.',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        """
        Partial update of verification settings via PATCH.
        """
        try:
            setting = self.get_object()
        except VerificationSetting.DoesNotExist:
            return Response({
                'status': status.HTTP_404_NOT_FOUND,
                'message': f'VerificationSetting with id {kwargs.get("pk")} not found.',
                'data': None
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(setting, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({
                'status': status.HTTP_400_BAD_REQUEST,
                'message': 'Validation error.',
                'errors': serializer.errors,
                'data': None
            }, status=status.HTTP_400_BAD_REQUEST)

        self.perform_update(serializer)
        return Response({
            'status': status.HTTP_200_OK,
            'message': 'Verification settings partially updated.',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    def create(self, request, *args, **kwargs):
        return Response({
            'status': status.HTTP_405_METHOD_NOT_ALLOWED,
            'message': 'Creation of new settings is not allowed – use PUT/PATCH on the existing object.',
            'data': None
        }, status=status.HTTP_405_METHOD_NOT_ALLOWED)
