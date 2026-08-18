from django.contrib import admin
from .models.user import SystemUser
from .models.hr import HREmployee, HRDepartment
from .models.weapon import Weapon, WeaponAssignment
from .models.range import ShootingRange, RangeRubeg, ShootingLane
from .models.session import ShootingSession, Soldier, Shot
from .models.session_flow import ShootingSessionFlow
from .models.training import TrainingPlan, TrainingAssignment
from .models.tb_test import TBSafetyTest, TBSafetyTestResult
from .models.protocol import Protocol
from .models.camera import LaneCamera
from .models.schedule import RangeSchedule
from .models.notification import AppNotification
from .models.audit import AuditLog
from .models.comment import OperatorComment, ReviewReason

admin.site.register(SystemUser)
admin.site.register(HREmployee)
admin.site.register(HRDepartment)
admin.site.register(Weapon)
admin.site.register(WeaponAssignment)
admin.site.register(ShootingRange)
admin.site.register(RangeRubeg)
admin.site.register(ShootingLane)
admin.site.register(ShootingSession)
admin.site.register(Soldier)
admin.site.register(Shot)
admin.site.register(ShootingSessionFlow)
admin.site.register(TrainingPlan)
admin.site.register(TrainingAssignment)
admin.site.register(TBSafetyTest)
admin.site.register(TBSafetyTestResult)
admin.site.register(Protocol)
admin.site.register(LaneCamera)
admin.site.register(RangeSchedule)
admin.site.register(AppNotification)
admin.site.register(AuditLog)
admin.site.register(OperatorComment)
admin.site.register(ReviewReason)
