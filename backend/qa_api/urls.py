# from django.urls import path
# from .ask import AskQuestionAPIView

# urlpatterns = [
#     path("ask/", AskQuestionAPIView.as_view(), name="ask"),
# ]

# urlpatterns = [
#     path("ask/", AskView.as_view(), name="ask"),
# ]


# from django.urls import path
# from .views import AskView

# urlpatterns = [
#     path('ask/', AskView.as_view(), name='ask'),
# ]



from django.urls import path
from .ask import ask_question

urlpatterns = [
    path('ask/', ask_question, name='ask-question'),
]
