from django.urls import path
from .views import test_api, upload_csv, get_history
from .views import register_user
from .views import generate_report
from .views import health_check



urlpatterns = [
    path('test/', test_api),
    path('upload/', upload_csv),
    path('history/', get_history),
    path('register/', register_user),
    path('report/', generate_report),
    path("health/", health_check),

]
