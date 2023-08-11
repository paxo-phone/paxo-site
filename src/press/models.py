from django.db import models


class Article(models.Model):
    name = models.CharField(max_length=128)
    newspaper_name = models.CharField(max_length=128)
    description = models.TextField()
    link = models.URLField()
    date = models.DateField(auto_now=True)

    def __str__(self):
        return f"{self.name}, {self.newspaper_name} - {self.date}"
