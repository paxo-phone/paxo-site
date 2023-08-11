from django.db import models


class Project(models.Model):
    name = models.CharField(max_length=128)
    description = models.TextField()
    link = models.URLField()

    def __str__(self):
        return self.name
