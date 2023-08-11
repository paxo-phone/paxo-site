from django.shortcuts import render

from .models import Article


def index(request):
    """
    TODO: add style for articles' index
    """
    articles = Article.objects.all()
    return render(request, 'press/index.html', {'articles': articles})
