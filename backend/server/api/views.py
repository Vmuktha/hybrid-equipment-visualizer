import pandas as pd

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from django.contrib.auth.models import User
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from rest_framework.permissions import IsAuthenticated
from .models import Dataset
from rest_framework.permissions import AllowAny


@api_view(['GET', 'HEAD'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "alive"})

# Test API
@api_view(['GET'])
def test_api(request):
    return Response({"message": "Backend working 🚀"})


# Upload CSV API
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_csv(request):

    if 'file' not in request.FILES:
        return Response(
            {"error": "No file uploaded"},
            status=status.HTTP_400_BAD_REQUEST
        )

    file = request.FILES['file']

    try:
        # Read CSV
        df = pd.read_csv(file)

        # Normalize column names
        df.columns = [
            col.strip().lower().replace(" ", "_")
            for col in df.columns
        ]

        # Possible column mappings
        column_map = {
            "equipment_name": ["equipment_name", "equip_name", "machine", "device"],
            "type": ["type", "category", "equip_type"],
            "flowrate": ["flowrate", "flow_rate", "flow"],
            "pressure": ["pressure", "press"],
            "temperature": ["temperature", "temp", "temp_c"]
        }

        mapped_cols = {}

        # Auto detect columns
        for key, options in column_map.items():
            for col in df.columns:
                if col in options:
                    mapped_cols[key] = col

        # Check missing fields
        missing = [
            key for key in column_map.keys()
            if key not in mapped_cols
        ]

        if missing:
            return Response(
                {
                    "error": "Missing required fields",
                    "missing": missing,
                    "found": list(df.columns)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Rename to standard names
        df = df.rename(columns={
            mapped_cols["equipment_name"]: "Equipment Name",
            mapped_cols["type"]: "Type",
            mapped_cols["flowrate"]: "Flowrate",
            mapped_cols["pressure"]: "Pressure",
            mapped_cols["temperature"]: "Temperature"
        })

        # Analytics
        summary = {
            "total_records": len(df),
            "avg_flowrate": float(df["Flowrate"].mean()),
            "avg_pressure": float(df["Pressure"].mean()),
            "avg_temperature": float(df["Temperature"].mean()),
            "type_distribution": df["Type"].value_counts().to_dict()
        }

        # Save to DB
        dataset = Dataset.objects.create(
            name=file.name,
            summary=summary,
            data=df.head(100).to_dict(orient="records")
        )

        return Response(
            {
                "message": "Upload successful 🎉",
                "dataset_id": dataset.id,
                "summary": summary,
                "rows": df.head(50).to_dict(orient="records")

            },
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# History API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_history(request):

    datasets = Dataset.objects.order_by('-uploaded_at')[:5]

    data = []

    for d in datasets:
        data.append({
            "id": d.id,
            "name": d.name,
            "uploaded_at": d.uploaded_at,
            "summary": d.summary,
            "rows": d.data if hasattr(d, "data") else []

        })

    return Response(data)

from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    print("REGISTER DATA:", request.data)
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not username or not password or not email:
        return Response(
            {"error": "All fields are required"},
            status=400
        )

    # Validate Email
    try:
        validate_email(email)
    except ValidationError:
        return Response(
            {"error": "Invalid email format"},
            status=400
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"},
            status=400
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "Email already registered"},
            status=400
        )

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    return Response(
        {"message": "User created successfully"},
        status=201
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_report(request):

    user = request.user

    # Get latest dataset
    dataset = Dataset.objects.order_by('-uploaded_at').first()

    if not dataset:
        return Response(
            {"error": "No data available"},
            status=400
        )

    summary = dataset.summary

    # Create response
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="report.pdf"'

    # Create PDF
    p = canvas.Canvas(response, pagesize=A4)
    width, height = A4

    y = height - 50

    # Title
    p.setFont("Helvetica-Bold", 20)
    p.drawString(180, y, "Equipment Analysis Report")

    y -= 50

    # User Info
    p.setFont("Helvetica", 12)
    p.drawString(50, y, f"User: {user.username}")
    y -= 20

    p.drawString(50, y, f"Date: {dataset.uploaded_at}")
    y -= 30

    # Summary
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "Summary Statistics")
    y -= 20

    p.setFont("Helvetica", 12)

    p.drawString(50, y, f"Total Records: {summary['total_records']}")
    y -= 20

    p.drawString(50, y, f"Avg Flowrate: {summary['avg_flowrate']:.2f}")
    y -= 20

    p.drawString(50, y, f"Avg Pressure: {summary['avg_pressure']:.2f}")
    y -= 20

    p.drawString(50, y, f"Avg Temperature: {summary['avg_temperature']:.2f}")
    y -= 30

    # Distribution
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "Equipment Distribution")
    y -= 20

    p.setFont("Helvetica", 12)

    for k, v in summary["type_distribution"].items():
        p.drawString(70, y, f"{k}: {v}")
        y -= 18

    # Footer
    y -= 40
    p.setFont("Helvetica-Oblique", 10)
    p.drawString(50, y, "Generated by Chem Equipment Analyzer")

    p.showPage()
    p.save()

    return response
