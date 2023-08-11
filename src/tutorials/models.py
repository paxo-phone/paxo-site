from django.contrib.auth.models import User
from django.db import models


class Tutorial(models.Model):
    name = models.CharField(max_length=128)
    description = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    date_created = models.DateTimeField(auto_now=True)
    date_updated = models.DateTimeField(auto_now_add=True)
    end_title = models.CharField(max_length=128, default="")
    end_text = models.TextField(default="")
    end_gif = models.URLField(default="https://media2.giphy.com/media/cQNRp4QA8z7B6/giphy.gif?cid=ecf05e47ohjkohlyjituly1p8eksruightei9lq4e60ghwoz&ep=v1_gifs_search&rid=giphy.gif&ct=g")

    def __str__(self):
        return f"{self.name}, {self.author}"


class Step(models.Model):
    name = models.CharField(max_length=128)
    content = models.TextField()
    video_url = models.URLField()
    tutorial = models.ForeignKey(Tutorial, on_delete=models.CASCADE)
    step_index = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.tutorial.name} - {self.name}"

    def get_past_msg(self):
        """
        Permits to get the message depending on the current step index.

        Either Step {n - 1} or step.tutorial.name
        """
        if self.step_index - 1 <= 0:
            return self.tutorial.name
        return f"Etape {self.step_index - 1}"

    def get_future_msg(self):
        """
        Same as :model:`tutorials.Step`.get_past_msg() but increments the index.
        """
        all_steps = Step.objects.filter(tutorial__id=self.tutorial.id)
        if self.step_index + 1 > len(all_steps):
            return "Terminer"
        return f"Etape {self.step_index + 1}"

    def get_past_link(self):
        """
        Permits to get the action that the button does depending on the current step index.

        Either redirects to tutorial page or loads the next step.
        """
        if self.step_index - 1 <= 0:
            return f"onclick=location.href='/tutorials/t/{self.tutorial.id}'"
        return f"hx-get=/tutorials/t/{self.tutorial.id}/step?index={self.step_index - 1}"

    def get_future_link(self):
        """
        Same as :model:`tutorials.Step`.get_past_link() but reversed, and the redirection is to
        :template:`tutorials/step-end.html`.
        """
        all_steps = Step.objects.filter(tutorial__id=self.tutorial.id)
        if self.step_index + 1 > len(all_steps):
            return f"onclick=location.href='/tutorials/t/{self.tutorial.id}/end'"
        return f"hx-get=/tutorials/t/{self.tutorial.id}/step?index={self.step_index + 1}"
