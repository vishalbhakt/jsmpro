from django.core.management import call_command
from rest_framework import status
from rest_framework.test import APIClient, APITestCase


class APISmokeTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_demo", verbosity=0)

    def login(self, username, password):
        response = self.client.post(
            "/api/auth/token/",
            {"username": username, "password": password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        return response

    def test_student_token_contains_role_and_profile_data(self):
        response = self.login("student", "Student@12345")

        self.assertEqual(response.data["user"]["role"], "Student")
        self.assertTrue(response.data["user"]["profile"]["admission_number"].startswith("ADM"))

    def test_student_can_read_scoped_portal_data(self):
        self.login("student", "Student@12345")

        self.assertEqual(self.client.get("/api/results/").status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get("/api/notes/").status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get("/api/payments/").status_code, status.HTTP_200_OK)

    def test_admin_can_read_users(self):
        self.login("admin", "Admin@12345")

        response = self.client.get("/api/users/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data["count"], 3)

    def test_public_inquiry_can_be_created(self):
        client = APIClient()

        response = client.post(
            "/api/inquiries/",
            {
                "student_name": "Ananya Singh",
                "guardian_name": "Rahul Singh",
                "email": "rahul@example.com",
                "phone": "9000011111",
                "preferred_class": "Class 8",
                "message": "Please call back.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
