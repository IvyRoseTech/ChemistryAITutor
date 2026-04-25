# from django.contrib import admin
# from django.urls import path, include

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     # path('api/', include('api.urls')),
#      path("api/", include("qa_api.urls")),
# ]



# from django.urls import include, path

# urlpatterns = [
#     path("api/", include("qa_api.urls")),
# ]

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('qa_api.urls')),
]

