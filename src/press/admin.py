from django.contrib import admin

from .models import Article


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ["name", "newspaper_name", "link", "date"]
    list_filter = ["newspaper_name"]
    search_fields = ["name", "newspaper_name", "description", "link", "date"]
