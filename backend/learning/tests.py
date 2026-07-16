from django.test import TestCase
from learning.models import VideoLecture
from academics.models import ClassRoom, Subject

class VideoLectureModelTest(TestCase):
    def setUp(self):
        self.classroom = ClassRoom.objects.create(name="Test Class")
        self.subject = Subject.objects.create(name="Test Subject", classroom=self.classroom)

    def test_youtube_embed_conversion(self):
        # 1. Standard YouTube URL
        vid1 = VideoLecture.objects.create(
            classroom=self.classroom,
            subject=self.subject,
            title="Video 1",
            video_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        )
        self.assertEqual(vid1.embed_video_url, "https://www.youtube.com/embed/dQw4w9WgXcQ")

        # 2. Short Link
        vid2 = VideoLecture.objects.create(
            classroom=self.classroom,
            subject=self.subject,
            title="Video 2",
            video_url="https://youtu.be/dQw4w9WgXcQ"
        )
        self.assertEqual(vid2.embed_video_url, "https://www.youtube.com/embed/dQw4w9WgXcQ")

        # 3. Embed Link (Should stay unchanged)
        vid3 = VideoLecture.objects.create(
            classroom=self.classroom,
            subject=self.subject,
            title="Video 3",
            video_url="https://www.youtube.com/embed/dQw4w9WgXcQ"
        )
        self.assertEqual(vid3.embed_video_url, "https://www.youtube.com/embed/dQw4w9WgXcQ")

        # 4. Direct/Other URL (Should stay unchanged)
        vid4 = VideoLecture.objects.create(
            classroom=self.classroom,
            subject=self.subject,
            title="Video 4",
            video_url="https://example.com/lecture.mp4"
        )
        self.assertEqual(vid4.embed_video_url, "https://example.com/lecture.mp4")
