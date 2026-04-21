from rest_framework.permissions import BasePermission


class IsDonor(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_donor)


class IsHospitalAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.is_hospital_admin
        )


class IsSystemAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == request.user.Role.SYSTEM_ADMIN or request.user.is_superuser)
        )
