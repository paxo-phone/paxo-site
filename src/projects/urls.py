from django.urls import path

from .views import *

app_name = "projects"

urlpatterns = [
    path('', index, name='index')
]
