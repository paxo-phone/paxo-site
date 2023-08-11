from django.shortcuts import render


def index(request):
    return render(request, "core/home.html")


def contribute(request):
    """
    feature idea : put a list of contributors
    """
    return render(request, "core/contribute.html")


def contact(request):
    """
    TODO: contact form feature (for not being dependant of google for that)
    """
    return render(request, "core/contact.html")

