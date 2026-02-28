from rest_framework.permissions import BasePermission


class IsProvider(BasePermission):
    """Allow access only to authenticated users with role=provider."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "provider"
        )
