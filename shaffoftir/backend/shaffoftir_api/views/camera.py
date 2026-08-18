from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
import socket
from ..models.camera import LaneCamera
from ..serializers.camera import LaneCameraSerializer

class LaneCameraListView(generics.ListCreateAPIView):
    queryset = LaneCamera.objects.all()
    serializer_class = LaneCameraSerializer
    filterset_fields = ['status', 'lane_number']

class LaneCameraDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LaneCamera.objects.all()
    serializer_class = LaneCameraSerializer

class CameraHealthCheckView(APIView):
    """POST /api/cameras/health/ — check camera connectivity"""
    def post(self, request):
        cameras = request.data.get('cameras', [])
        results = []
        for cam in cameras:
            ip = cam.get('camera_ip')
            port = cam.get('port', 554)
            status_val = 'OFFLINE'
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(3)
                result = sock.connect_ex((ip, port))
                if result == 0:
                    status_val = 'ONLINE'
                sock.close()
            except Exception:
                status_val = 'OFFLINE'
            
            results.append({
                'camera_ip': ip,
                'status': status_val,
                'label': cam.get('label'),
            })
        
        active = sum(1 for r in results if r['status'] == 'ONLINE')
        return Response({
            'total_cameras': len(results),
            'active_cameras': active,
            'camera_results': results,
        })
