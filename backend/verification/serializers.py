from rest_framework import serializers
from .models import VerificationReport, VerificationSetting

class VerificationReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationReport
        fields = ['id', 'created_at', 'report_text']
        read_only_fields = fields

class VerificationSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationSetting
        fields = ['id', 'enable_duplicate_check', 'enable_orphan_check', 'enable_invalid_fk_check']
        read_only_fields = ['id']

    def validate(self, attrs):
        # Example validation: at least one check must be enabled
        if not any([
            attrs.get('enable_duplicate_check', True),
            attrs.get('enable_orphan_check', True),
            attrs.get('enable_invalid_fk_check', True)
        ]):
            raise serializers.ValidationError({
                'non_field_errors': 'At least one verification check must be enabled.'
            })
        return attrs
