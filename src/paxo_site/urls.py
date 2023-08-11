from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('', include('core.urls')),
    path('press/', include('press.urls')),
    path('projects/', include('projects.urls')),
    path('tutorials/', include('tutorials.urls')),
    path('admin/', admin.site.urls),
]
