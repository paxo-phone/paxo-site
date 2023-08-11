from django.shortcuts import render

from .models import Step, Tutorial


def index(request):
    tutorials = Tutorial.objects.all()
    return render(request, 'tutorials/index.html', {'tutorials': tutorials})


def view_tutorial(request, tutorial_id):
    tutorial = Tutorial.objects.get(id=tutorial_id)
    return render(request, 'tutorials/tutorial.html', {'tutorial': tutorial})


def view_step(request, tutorial_id):
    """
    Welpike

    Could be an entire template or a partial for htmx.

    If 'HX-Request' request header is detected, this functions returns a partial (:template:`tutorials/partials/step.html`) that contains the html that will replace past step's template.
    Otherwise, it returns the entire template (:template:`tutorials/step.html`)
    """
    tutorial = Tutorial.objects.get(id=tutorial_id)
    step = Step.objects.get(tutorial__id=tutorial_id, step_index=request.GET["index"])

    if 'HX-Request' in request.headers:   # if request is sent via htmx, return a partial
        return render(request, 'tutorials/partials/step.html', {'step': step, 'tutorial': tutorial})

    # else return the entire template
    return render(request, 'tutorials/step.html', {'step': step, 'tutorial': tutorial})


def step_end(request, tutorial_id):
    tutorial = Tutorial.objects.get(id=tutorial_id)
    return render(request, 'tutorials/step-end.html', {'tutorial': tutorial})
