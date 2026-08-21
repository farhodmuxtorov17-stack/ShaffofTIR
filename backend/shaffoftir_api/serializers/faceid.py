from rest_framework import serializers
from ..models.faceid import FaceRegistration, FaceCheckIn, FaceCheckInEntry
from ..models.employee import Employee


class FaceRegistrationSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = FaceRegistration
        fields = [
            'id', 'employee', 'employee_name', 'face_encoding',
            'photo_reference', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FaceCheckInEntrySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_rank = serializers.CharField(source='employee.rank', read_only=True)
    employee_department = serializers.CharField(source='employee.department', read_only=True)

    class Meta:
        model = FaceCheckInEntry
        fields = [
            'id', 'check_in', 'employee', 'employee_name', 'employee_rank',
            'employee_department', 'sequence_number', 'status',
            'confidence_score', 'photo_captured', 'identified_at',
        ]
        read_only_fields = ['id', 'identified_at']


class FaceCheckInSerializer(serializers.ModelSerializer):
    entries = FaceCheckInEntrySerializer(many=True, read_only=True)
    instructor_name = serializers.CharField(source='instructor.full_name', read_only=True)
    range_name = serializers.CharField(source='range.name', read_only=True)

    class Meta:
        model = FaceCheckIn
        fields = [
            'id', 'check_in_id', 'instructor', 'instructor_name',
            'range', 'range_name', 'status', 'total_identified',
            'total_unknown', 'notes', 'entries',
            'created_at', 'completed_at',
        ]
        read_only_fields = ['id', 'check_in_id', 'created_at', 'completed_at']
