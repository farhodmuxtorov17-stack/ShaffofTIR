import uuid
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, JSONParser

from shaffoftir_api.models import (
    Session, Soldier, Shot, ShootingLane, Camera, RangeSchedule
)
from shaffoftir_api.serializers import (
    SessionSerializer, SessionListSerializer,
    ShootingLaneSerializer, CameraSerializer, RangeScheduleSerializer,
    SoldierSerializer, ShotSerializer
)


class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.select_related('employee', 'weapon', 'lane').all()
    serializer_class = SessionSerializer
    filterset_fields = ['status', 'employee', 'weapon', 'lane', 'instructor']
    search_fields = ['employee_name', 'weapon_name', 'instructor_name']
    ordering_fields = ['created_at', 'score', 'accuracy']

    def get_serializer_class(self):
        if self.action in ('list',):
            return SessionListSerializer
        return SessionSerializer

    @action(detail=True, methods=['get', 'post'])
    def soldiers(self, request, pk=None):
        session = self.get_object()
        if request.method == 'POST':
            seq = session.soldiers.count() + 1
            soldier = Soldier.objects.create(session=session, sequence_number=seq)
            return Response(SoldierSerializer(soldier).data, status=status.HTTP_201_CREATED)
        soldiers = session.soldiers.all()
        return Response(SoldierSerializer(soldiers, many=True).data)

    @action(detail=True, methods=['post'])
    def process_turn(self, request, pk=None):
        """Обработка выстрелов с камеры (метод обработки выстрелов)"""
        session = self.get_object()
        soldier_seq = request.data.get('soldier_seq')
        shot_type = request.data.get('shot_type', 'TEST')
        expected_shots = request.data.get('expected_shots', 10)

        try:
            soldier = session.soldiers.get(sequence_number=soldier_seq)
        except Soldier.DoesNotExist:
            return Response({'detail': f'Стрелок #{soldier_seq} не найден'}, status=status.HTTP_404_NOT_FOUND)

        # Заглушка: реальная логика авто-обработки мишени должна быть здесь
        # (захват кадра с камеры, детекция попаданий, расчёт координат)
        result = {
            'session_id': str(session.id),
            'soldier_sequence': soldier_seq,
            'shot_type': shot_type,
            'total_new_shots_found': 0,
            'hit_count': 0,
            'miss_count': 0,
            'new_shots': [],
            'result_image_url': None,
            'warning': 'авто-обработка мишени не настроена',
        }
        return Response(result)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser])
    def upload_turn(self, request, pk=None):
        """Обработка выстрелов по загруженной фотографии мишени"""
        session = self.get_object()
        soldier_seq = request.data.get('soldier_seq')
        shot_type = request.data.get('shot_type', 'TEST')
        expected_shots = int(request.data.get('expected_shots', 10))
        file = request.FILES.get('file')

        if not file:
            return Response({'detail': 'Файл не загружен'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            soldier = session.soldiers.get(sequence_number=soldier_seq)
        except Soldier.DoesNotExist:
            return Response({'detail': f'Стрелок #{soldier_seq} не найден'}, status=status.HTTP_404_NOT_FOUND)

        # Сохраняем файл
        import os
        from django.conf import settings
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'sessions', str(session.id))
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, f'soldier_{soldier_seq}_{shot_type}.jpg')
        with open(file_path, 'wb') as f:
            for chunk in file.chunks():
                f.write(chunk)

        file_url = f'{settings.MEDIA_URL}sessions/{session.id}/soldier_{soldier_seq}_{shot_type}.jpg'

        if shot_type == 'TEST':
            soldier.test_image_url = file_url
        else:
            soldier.main_image_url = file_url
        soldier.save()

        result = {
            'session_id': str(session.id),
            'soldier_sequence': soldier_seq,
            'shot_type': shot_type,
            'total_new_shots_found': 0,
            'hit_count': 0,
            'miss_count': 0,
            'new_shots': [],
            'result_image_url': file_url,
            'warning': 'авто-обработка загруженного изображения не настроена',
        }
        return Response(result)


class ShootingLaneViewSet(viewsets.ModelViewSet):
    queryset = ShootingLane.objects.all()
    serializer_class = ShootingLaneSerializer
    filterset_fields = ['status', 'target_type']
    ordering_fields = ['lane_number']


class CameraViewSet(viewsets.ModelViewSet):
    queryset = Camera.objects.all()
    serializer_class = CameraSerializer
    filterset_fields = ['status', 'lane_number']
    search_fields = ['name', 'camera_ip']


class CameraHealthView(APIView):
    def post(self, request):
        """Проверка состояния камер (метод обработки выстрелов)"""
        cameras = request.data.get('cameras', [])
        results = []
        active = 0
        for i, cam in enumerate(cameras):
            ip = cam.get('camera_ip', '')
            status_val = 'online' if ip else 'offline'
            if status_val == 'online':
                active += 1
            results.append({
                'camera_index': i,
                'camera_ip': ip,
                'username': cam.get('username'),
                'label': cam.get('label'),
                'status': status_val,
                'detail': f'Camera at {ip}',
            })
        return Response({
            'total_cameras': len(cameras),
            'active_cameras': active,
            'camera_results': results,
        })


class RangeScheduleViewSet(viewsets.ModelViewSet):
    queryset = RangeSchedule.objects.all()
    serializer_class = RangeScheduleSerializer
    filterset_fields = ['status', 'department']
    ordering_fields = ['date', 'time_slot']
