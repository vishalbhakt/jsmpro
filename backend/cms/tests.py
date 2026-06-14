from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .models import ContactMessage


class ContactMessageTests(APITestCase):
    def test_public_contact_message_can_be_created(self):
        response = self.client.post(
            "/api/contact-messages/",
            {
                "name": "Aarav Singh",
                "email": "aarav@example.com",
                "phone": "9000012345",
                "subject": "General help",
                "message": "Please share timing details.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ContactMessage.objects.count(), 1)

    def test_admin_can_list_contact_messages(self):
        user_model = get_user_model()
        admin = user_model.objects.create_superuser(
            username="cmsadmin",
            email="cmsadmin@example.com",
            password="Admin@12345",
        )
        ContactMessage.objects.create(
            name="Aarav Singh",
            email="aarav@example.com",
            phone="9000012345",
            subject="General help",
            message="Please share timing details.",
        )

        client = APIClient()
        token_response = client.post(
            "/api/auth/token/",
            {"username": "cmsadmin", "password": "Admin@12345"},
            format="json",
        )
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_response.data['access']}")

        response = client.get("/api/contact-messages/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
