"""
Real computer vision shot analysis using OpenCV.

Detects bullet holes in target photos by comparing before/after images.
Uses image differencing, contour detection, and geometric scoring.
"""
import time
import io
import base64
import urllib.request
import numpy as np
import cv2
from PIL import Image
from django.utils import timezone
from ..models.ai_analysis import ShotAnalysis
from ..models.queue import QueueEntry


class CVAnalysisService:
    """OpenCV-based target analysis."""

    # Target scoring rings (standard pistol target)
    # Center = 10, outer rings decrease
    SCORING_RINGS = [
        {'radius': 0.05, 'score': 10},   # X-ring
        {'radius': 0.10, 'score': 10},   # 10-ring
        {'radius': 0.15, 'score': 9},    # 9-ring
        {'radius': 0.20, 'score': 8},    # 8-ring
        {'radius': 0.25, 'score': 7},    # 7-ring
        {'radius': 0.30, 'score': 6},    # 6-ring
        {'radius': 0.35, 'score': 5},    # 5-ring
        {'radius': 0.40, 'score': 4},    # 4-ring
        {'radius': 0.45, 'score': 3},    # 3-ring
        {'radius': 0.50, 'score': 2},    # 2-ring
    ]

    @staticmethod
    def _load_image(url_or_base64: str) -> np.ndarray:
        """Load image from URL or base64 string to grayscale numpy array."""
        if url_or_base64.startswith('data:image'):
            # Base64 encoded
            header, data = url_or_base64.split(',', 1)
            img_data = base64.b64decode(data)
            nparr = np.frombuffer(img_data, np.uint8)
            return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        elif url_or_base64.startswith('http'):
            # URL
            req = urllib.request.urlopen(url_or_base64, timeout=10)
            arr = np.asarray(bytearray(req.read()), dtype=np.uint8)
            return cv2.imdecode(arr, cv2.IMREAD_COLOR)
        else:
            # Assume base64 raw
            img_data = base64.b64decode(url_or_base64)
            nparr = np.frombuffer(img_data, np.uint8)
            return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    @staticmethod
    def _detect_target_center(img: np.ndarray) -> tuple:
        """Detect the center of the target using circle detection."""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape

        # Try HoughCircles to find target center
        circles = cv2.HoughCircles(
            gray, cv2.HOUGH_GRADIENT, dp=1.2, minDist=w // 2,
            param1=50, param2=30, minRadius=w // 6, maxRadius=w // 2,
        )
        if circles is not None:
            circles = np.round(circles[0, :]).astype('int')
            # Take the largest circle
            largest = max(circles, key=lambda c: c[2])
            return (largest[0], largest[1]), largest[2]

        # Fallback: use image center
        return (w // 2, h // 2), min(w, h) // 3

    @staticmethod
    def _compute_score(cx: float, cy: float, center_x: int, center_y: int, target_radius: int) -> int:
        """Compute score based on distance from target center."""
        dist = ((cx - center_x) ** 2 + (cy - center_y) ** 2) ** 0.5
        normalized_dist = dist / target_radius if target_radius > 0 else 1.0

        for ring in CVAnalysisService.SCORING_RINGS:
            if normalized_dist <= ring['radius']:
                return ring['score']

        return 0  # Miss

    @staticmethod
    def _create_annotated_image(before_img: np.ndarray, after_img: np.ndarray,
                                  hits: list, center_x: int, center_y: int) -> bytes:
        """Create annotated image with hit markers."""
        annotated = after_img.copy()

        for hit in hits:
            cx, cy = hit['pixel_x'], hit['pixel_y']
            score = hit['score']

            # Draw circle around hit
            color = (0, 0, 255) if score >= 7 else (0, 165, 255) if score >= 4 else (0, 0, 200)
            cv2.circle(annotated, (cx, cy), 12, color, 2)
            cv2.circle(annotated, (cx, cy), 3, color, -1)

            # Score label
            cv2.putText(annotated, str(score), (cx + 15, cy - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

        # Encode to base64 JPEG
        _, buffer = cv2.imencode('.jpg', annotated, [cv2.IMWRITE_JPEG_QUALITY, 85])
        return base64.b64encode(buffer).decode('utf-8')

    @staticmethod
    def run_cv_analysis(analysis_id: str) -> ShotAnalysis:
        """
        Run real CV analysis on before/after target photos.
        Detects bullet holes by image differencing.
        """
        analysis = ShotAnalysis.objects.get(id=analysis_id)
        start_time = time.time()

        try:
            analysis.status = ShotAnalysis.AnalysisStatus.PROCESSING
            analysis.save()

            before_url = analysis.before_photo_url
            after_url = analysis.after_photo_url

            if not before_url or not after_url:
                raise ValueError('Both before_photo_url and after_photo_url are required')

            # Load images
            before_img = CVAnalysisService._load_image(before_url)
            after_img = CVAnalysisService._load_image(after_url)

            if before_img is None or after_img is None:
                raise ValueError('Failed to load images')

            # Ensure same size
            h, w = min(before_img.shape[0], after_img.shape[0]), min(before_img.shape[1], after_img.shape[1])
            before_img = cv2.resize(before_img, (w, h))
            after_img = cv2.resize(after_img, (w, h))

            # Convert to grayscale
            before_gray = cv2.cvtColor(before_img, cv2.COLOR_BGR2GRAY)
            after_gray = cv2.cvtColor(after_img, cv2.COLOR_BGR2GRAY)

            # Detect target center
            (center_x, center_y), target_radius = CVAnalysisService._detect_target_center(after_img)

            # Image differencing to find new holes
            diff = cv2.absdiff(before_gray, after_gray)

            # Apply Gaussian blur to reduce noise
            diff_blur = cv2.GaussianBlur(diff, (5, 5), 0)

            # Threshold to isolate significant changes
            _, thresh = cv2.threshold(diff_blur, 30, 255, cv2.THRESH_BINARY)

            # Morphological operations to clean up
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
            thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)

            # Find contours (bullet holes)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            detected_hits = []
            detected_misses = []

            # Filter contours by size (bullet holes are small circular features)
            min_area = max(20, (w * h) * 0.00005)
            max_area = max(100, (w * h) * 0.005)

            for contour in contours:
                area = cv2.contourArea(contour)
                if area < min_area or area > max_area:
                    continue

                # Get centroid
                M = cv2.moments(contour)
                if M['m00'] == 0:
                    continue
                cx = int(M['m10'] / M['m00'])
                cy = int(M['m01'] / M['m00'])

                # Check circularity
                perimeter = cv2.arcLength(contour, True)
                if perimeter == 0:
                    continue
                circularity = 4 * np.pi * area / (perimeter * perimeter)
                if circularity < 0.3:
                    continue

                # Compute score
                score = CVAnalysisService._compute_score(cx, cy, center_x, center_y, target_radius)

                # Normalized coordinates (0-1)
                norm_x = round(cx / w, 4)
                norm_y = round(cy / h, 4)

                if score > 0:
                    detected_hits.append({
                        'x': norm_x,
                        'y': norm_y,
                        'pixel_x': cx,
                        'pixel_y': cy,
                        'score': score,
                        'ring': score,
                        'area': round(area, 1),
                    })
                else:
                    detected_misses.append({
                        'x': norm_x,
                        'y': norm_y,
                        'score': 0,
                    })

            # Create annotated image
            annotated_b64 = CVAnalysisService._create_annotated_image(
                before_img, after_img, detected_hits, center_x, center_y
            )

            hit_count = len(detected_hits)
            miss_count = len(detected_misses)
            total_shots = hit_count + miss_count
            total_score = sum(h['score'] for h in detected_hits)
            accuracy = round((hit_count / total_shots * 100), 1) if total_shots > 0 else 0.0

            # Clean pixel coords for JSON storage
            for h in detected_hits:
                del h['pixel_x']
                del h['pixel_y']
                del h['area']

            analysis.detected_hits = detected_hits
            analysis.detected_misses = detected_misses
            analysis.total_shots_detected = total_shots
            analysis.hit_count = hit_count
            analysis.miss_count = miss_count
            analysis.total_score = total_score
            analysis.accuracy = accuracy
            analysis.confidence = round(min(0.95, 0.7 + (total_shots * 0.03)), 2) if total_shots > 0 else 0.0
            analysis.annotated_photo_url = f'data:image/jpeg;base64,{annotated_b64}'
            analysis.model_version = 'opencv-v2.0'
            analysis.processing_time_ms = int((time.time() - start_time) * 1000)
            analysis.status = ShotAnalysis.AnalysisStatus.COMPLETED
            analysis.completed_at = timezone.now()
            analysis.save()

            # Update queue entry
            if analysis.queue_entry_id:
                entry = QueueEntry.objects.get(id=analysis.queue_entry_id)
                entry.total_shots = total_shots
                entry.hit_count = hit_count
                entry.miss_count = miss_count
                entry.total_score = total_score
                entry.accuracy = accuracy
                entry.passed = accuracy >= 60.0
                entry.save()

            return analysis

        except Exception as e:
            analysis.status = ShotAnalysis.AnalysisStatus.FAILED
            analysis.error_message = str(e)
            analysis.processing_time_ms = int((time.time() * 1000) - start_time)
            analysis.save()
            raise
