"""
FaceID service — face registration, identification, and batch check-in.
"""
import uuid
from django.utils import timezone
from ..models.faceid import FaceRegistration, FaceCheckIn, FaceCheckInEntry
from ..models.employee import Employee


class FaceIDService:

    @staticmethod
    def register_face(employee_id, face_encoding, photo_reference=''):
        """Enroll or update a face encoding for an employee."""
        employee = Employee.objects.get(id=employee_id)
        # Deactivate previous registrations
        FaceRegistration.objects.filter(employee=employee, is_active=True).update(is_active=False)
        registration = FaceRegistration.objects.create(
            employee=employee,
            face_encoding=face_encoding,
            photo_reference=photo_reference,
            is_active=True,
        )
        return registration

    @staticmethod
    def identify_face(face_encoding, confidence_threshold=0.7):
        """
        Compare a face encoding against all enrolled faces.
        Returns (employee, confidence) or (None, 0.0) if no match.
        """
        best_match = None
        best_score = 0.0

        for reg in FaceRegistration.objects.filter(is_active=True).select_related('employee'):
            # In production, use proper face recognition library (face_recognition, InsightFace, etc.)
            # Here we simulate cosine similarity comparison
            score = FaceIDService._compare_encodings(face_encoding, reg.face_encoding)
            if score > best_score:
                best_score = score
                best_match = reg

        if best_match and best_score >= confidence_threshold:
            return best_match.employee, best_score
        return None, 0.0

    @staticmethod
    def create_check_in(instructor_id, range_id, employee_ids=None, manual_names=None):
        """
        Create a FaceID check-in event for a group.
        employee_ids: list of identified employee IDs (in order)
        manual_names: list of names for unidentified persons
        """
        check_in = FaceCheckIn.objects.create(
            check_in_id=f"fci-{uuid.uuid4().hex[:12]}",
            instructor_id=instructor_id,
            range_id=range_id,
            status=FaceCheckIn.CheckInStatus.IN_PROGRESS,
        )

        seq = 0
        identified = 0
        unknown = 0

        if employee_ids:
            for eid in employee_ids:
                seq += 1
                emp = Employee.objects.get(id=eid)
                FaceCheckInEntry.objects.create(
                    check_in=check_in,
                    employee=emp,
                    sequence_number=seq,
                    status=FaceCheckInEntry.EntryStatus.IDENTIFIED,
                    confidence_score=0.95,  # In production, use real confidence
                )
                identified += 1

        if manual_names:
            for name in manual_names:
                seq += 1
                FaceCheckInEntry.objects.create(
                    check_in=check_in,
                    sequence_number=seq,
                    status=FaceCheckInEntry.EntryStatus.UNKNOWN,
                )
                unknown += 1

        check_in.total_identified = identified
        check_in.total_unknown = unknown
        check_in.status = FaceCheckIn.CheckInStatus.COMPLETED
        check_in.completed_at = timezone.now()
        check_in.save()
        return check_in

    @staticmethod
    def _compare_encodings(encoding1, encoding2):
        """Simulate face encoding comparison. Returns similarity 0-1."""
        # In production: numpy cosine similarity or euclidean distance
        # Here we return a placeholder
        return 0.95

    @staticmethod
    def get_check_in_entries(check_in_id):
        """Get ordered entries for a check-in."""
        return FaceCheckInEntry.objects.filter(
            check_in_id=check_in_id,
            status__in=['IDENTIFIED', 'MANUAL'],
        ).select_related('employee').order_by('sequence_number')
