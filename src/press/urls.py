from django.urls import path

from .views import *

app_name = "press"

urlpatterns = [
    path('', index, name='index')
]
