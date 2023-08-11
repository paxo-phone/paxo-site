from django.urls import path

from .views import *

app_name = "core"

urlpatterns = [
    path('', index, name="index"),
    path('contribute', contribute, name="contribute"),
    path('contact', contact, name="contact"),
]
