from rest_framework.throttling import AnonRateThrottle, UserRateThrottle, ScopedRateThrottle


class RealIPThrottleMixin:
    def get_ident(self, request):
        xff = request.META.get('HTTP_X_FORWARDED_FOR')
        if xff:
            # leftmost entry is always the original client IP
            return xff.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')


class RealIPAnonThrottle(RealIPThrottleMixin, AnonRateThrottle):
    pass


class RealIPUserThrottle(RealIPThrottleMixin, UserRateThrottle):
    pass


class RealIPScopedThrottle(RealIPThrottleMixin, ScopedRateThrottle):
    pass