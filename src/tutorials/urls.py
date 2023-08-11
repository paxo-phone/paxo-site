from django.urls import path

from .views import *

app_name = "tutorials"

urlpatterns = [
    path('', index, name="index"),
    path('t/<int:tutorial_id>', view_tutorial, name="view_tutorial"),
    path('t/<int:tutorial_id>/step', view_step, name="view_step"),
    path('t/<int:tutorial_id>/end', step_end, name="step_end"),
]
