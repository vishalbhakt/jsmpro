import os
import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from academics.models import ClassRoom
from finance.models import FeePlan, AdditionalFeeItem

class Command(BaseCommand):
    help = 'Seed realistic master fee structures for UKG to Class 10'

    def handle(self, *args, **options):
        # Academic session
        session_year = "2026-27"
        
        # Define grades and their specific tuition fees
        grades_info = [
            {"name": "UKG", "tuition_monthly": 1500, "admission": 3000, "exam": 1000},
            {"name": "Grade 1", "tuition_monthly": 2000, "admission": 4000, "exam": 1200},
            {"name": "Grade 2", "tuition_monthly": 2000, "admission": 4000, "exam": 1200},
            {"name": "Grade 3", "tuition_monthly": 2000, "admission": 4000, "exam": 1200},
            {"name": "Grade 4", "tuition_monthly": 2000, "admission": 4000, "exam": 1200},
            {"name": "Grade 5", "tuition_monthly": 2000, "admission": 4000, "exam": 1500},
            {"name": "Grade 6", "tuition_monthly": 2500, "admission": 5000, "exam": 1800},
            {"name": "Grade 7", "tuition_monthly": 2500, "admission": 5000, "exam": 1800},
            {"name": "Grade 8", "tuition_monthly": 2500, "admission": 5000, "exam": 2000},
            {"name": "Grade 9", "tuition_monthly": 3500, "admission": 6000, "exam": 2500},
            {"name": "Class 10", "tuition_monthly": 3500, "admission": 6000, "exam": 2500},
        ]
        
        self.stdout.write(self.style.WARNING("Starting master FeePlan seeding..."))
        
        for g in grades_info:
            name = g["name"]
            
            # Fetch or create Classroom Grade safely
            classroom = ClassRoom.objects.filter(name=name, academic_year=session_year).first()
            if not classroom:
                classroom = ClassRoom.objects.create(
                    name=name,
                    academic_year=session_year,
                    capacity=40,
                    is_active=True
                )
                self.stdout.write(self.style.SUCCESS(f"Created Classroom Grade: {classroom}"))
            
            # Create/Update Master Fee Plan
            title = f"{name} Academic Fee Structure {session_year}"
            
            # Calculate annual tuition fee
            annual_tuition = g["tuition_monthly"] * 12
            
            plan, plan_created = FeePlan.objects.update_or_create(
                classroom=classroom,
                title=title,
                defaults={
                    "academic_year": session_year,
                    "admission_fee": Decimal(str(g["admission"])),
                    "tuition_fee": Decimal(str(annual_tuition)),
                    "exam_fee": Decimal(str(g["exam"])),
                    "computer_fee": Decimal("1200.00"),
                    "library_fee": Decimal("800.00"),
                    "sports_fee": Decimal("1000.00"),
                    "transport_fee": Decimal("0.00"),
                    "misc_fee": Decimal("500.00"),
                    "discount": Decimal("0.00"),
                    "scholarship": Decimal("0.00"),
                    "late_fee": Decimal("0.00"),
                    "due_date": "2026-06-30",
                    "fee_type": "annual",
                    "payment_frequency_options": ["monthly", "half_yearly", "yearly"],
                    "is_active": True
                }
            )
            
            # Clear old additional items to avoid duplicates on re-run
            plan.additional_items.all().delete()
            
            # Add dynamic Add-on items depending on Grade
            if name in ["UKG", "Kindergarten"]:
                AdditionalFeeItem.objects.create(
                    fee_plan=plan,
                    item_name="Smart Class & Activity Fee",
                    amount=Decimal("1200.00"),
                    is_mandatory_for_class=True
                )
                AdditionalFeeItem.objects.create(
                    fee_plan=plan,
                    item_name="Toy & Play Area Maintenance",
                    amount=Decimal("500.00"),
                    is_mandatory_for_class=True
                )
            elif name in ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"]:
                AdditionalFeeItem.objects.create(
                    fee_plan=plan,
                    item_name="Smart Class & Lab Fee",
                    amount=Decimal("1500.00"),
                    is_mandatory_for_class=True
                )
                AdditionalFeeItem.objects.create(
                    fee_plan=plan,
                    item_name="Art & Craft Material Fee",
                    amount=Decimal("800.00"),
                    is_mandatory_for_class=False
                )
            elif name in ["Grade 6", "Grade 7", "Grade 8"]:
                AdditionalFeeItem.objects.create(
                    fee_plan=plan,
                    item_name="Computer Science Fee",
                    amount=Decimal("2000.00"),
                    is_mandatory_for_class=True
                )
                AdditionalFeeItem.objects.create(
                    fee_plan=plan,
                    item_name="Robotics Course",
                    amount=Decimal("3000.00"),
                    is_mandatory_for_class=False
                )
                AdditionalFeeItem.objects.create(
                    fee_plan=plan,
                    item_name="Transport Bus Fee",
                    amount=Decimal("5000.00"),
                    is_mandatory_for_class=False
                )
            else: # Grade 9 & Class 10
                AdditionalFeeItem.objects.create(
                    fee_plan=plan,
                    item_name="Science Lab & Activity Fee",
                    amount=Decimal("2500.00"),
                    is_mandatory_for_class=True
                )
                AdditionalFeeItem.objects.create(
                    fee_plan=plan,
                    item_name="Computer Science Fee",
                    amount=Decimal("2500.00"),
                    is_mandatory_for_class=True
                )
                AdditionalFeeItem.objects.create(
                    fee_plan=plan,
                    item_name="Robotics Course",
                    amount=Decimal("3500.00"),
                    is_mandatory_for_class=False
                )
                AdditionalFeeItem.objects.create(
                    fee_plan=plan,
                    item_name="Transport Bus Fee",
                    amount=Decimal("6000.00"),
                    is_mandatory_for_class=False
                )
            
            # Recalculate amount
            plan.save()
            self.stdout.write(self.style.SUCCESS(f"Saved Fee Plan for {name}: Total Rs.{plan.amount}"))
            
        self.stdout.write(self.style.SUCCESS("All master fee plans seeded successfully!"))
