from django.contrib import admin
from .models import (
    SystemUser, Employee, HRDepartment,
    Weapon, ShootingRange, ShootingLane, RangeRubeg, LaneCamera,
    ShootingSession, Soldier, Shot, Protocol,
    TrainingPlan, TrainingAssignment, TBSafetyTest,
    RangeSchedule, AppNotification, AuditLog,
    FaceRegistration, FaceCheckIn, FaceCheckInEntry,
    ShootingQueue, QueueEntry, ShotAnalysis,
)

admin.site.register(SystemUser)
admin.site.register(Employee)
admin.site.register(HRDepartment)
admin.site.register(Weapon)
admin.site.register(ShootingRange)
admin.site.register(ShootingLane)
admin.site.register(RangeRubeg)
admin.site.register(LaneCamera)
admin.site.register(ShootingSession)
admin.site.register(Soldier)
admin.site.register(Shot)
admin.site.register(Protocol)
admin.site.register(TrainingPlan)
admin.site.register(TrainingAssignment)
admin.site.register(TBSafetyTest)
admin.site.register(RangeSchedule)
admin.site.register(AppNotification)
admin.site.register(AuditLog)
admin.site.register(FaceRegistration)
admin.site.register(FaceCheckIn)
admin.site.register(FaceCheckInEntry)
admin.site.register(ShootingQueue)
admin.site.register(QueueEntry)
admin.site.register(ShotAnalysis)
