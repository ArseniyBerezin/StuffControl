from django.db import models
from django.db import models


class UserInfo(models.Model):
    nickname = models.CharField(max_length=100)
    email = models.EmailField()
    position = models.CharField(max_length=100)
    date_established = models.DateField()
    date_promotion = models.DateField()
    note = models.TextField()

    def __str__(self):
        return f"{self.nickname} - {self.email}"