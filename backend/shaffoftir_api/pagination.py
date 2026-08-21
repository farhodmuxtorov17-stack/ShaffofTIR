"""
Custom pagination with metadata envelope.

Returns paginated results in a consistent structure:

    {
        "count": 142,
        "page": 1,
        "page_size": 50,
        "total_pages": 3,
        "results": [ ... ]
    }
"""
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardPageNumberPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 200

    def get_paginated_response(self, data):
        return Response({
            "count": self.page.paginator.count,
            "page": self.page.number,
            "page_size": self.get_page_size(self.request),
            "total_pages": self.page.paginator.num_pages,
            "results": data,
        })
