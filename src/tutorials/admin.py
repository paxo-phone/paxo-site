from django.contrib import admin
from django import forms

from .models import Step, Tutorial


admin.site.empty_value_display = "(None)"


@admin.register(Step)
class StepAdmin(admin.ModelAdmin):
    list_display = ["name", "tutorial"]
    list_filter = ["tutorial", "tutorial__author"]
    search_fields = ["name", "content", "video_url"]

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        disabled_fields = set()

        if request.user != obj.tutorial.author:
            disabled_fields |= {
                'name',
                'content',
                'video_url',
                'tutorial',
                'step_index'
            }

        for f in disabled_fields:
            if f in form.base_fields:
                form.base_fields[f].disabled = True

        return form


@admin.register(Tutorial)
class TutorialAdmin(admin.ModelAdmin):
    readonly_fields = ["author"]
    list_display = ["name", "author", "date_created", "date_updated"]
    list_filter = ["author"]
    search_fields = ["name", "description", "author__username", "date_created", "date_updated"]

    def save_model(self, request, obj, form, change):
        obj.author = request.user
        super().save_model(request, obj, form, change)

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        disabled_fields = set()

        if request.user != obj.author:
            disabled_fields |= {
                'name',
                'description',
                'end_title',
                'end_text',
                'end_gif'
            }

        for f in disabled_fields:
            if f in form.base_fields:
                form.base_fields[f].disabled = True

        return form
