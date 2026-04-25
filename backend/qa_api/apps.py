import sys
from django.apps import AppConfig
from django.conf import settings
from pathlib import Path

class QaApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'qa_api'

    def ready(self):
        # Prevent double loading if ready() is called multiple times (e.g. runserver reloader)
        # Note: In production it runs once. In dev, we just want to ensure it works.
        from . import topic_registry
        from .topic_index import load_syllabus, build_topic_index

        if topic_registry.TOPIC_INDEX is not None:
            return

        try:
            # Resolve syllabus path relative to settings.BASE_DIR
            # User prompted: "backend/data/syllabus.json".
            # My file check showed: "backend/data/syllabus/chemistry_syllabus.json".
            # I will check for the file I verified exists.
            
            base = Path(settings.BASE_DIR)
            syllabus_path = base / "data" / "syllabus" / "chemistry_syllabus.json"
            
            # Load and build
            print(f"Loading syllabus from {syllabus_path}...")
            syllabus_data = load_syllabus(str(syllabus_path))
            index = build_topic_index(syllabus_data)
            
            if not index:
                 raise ValueError("Topic index is empty after build!")
                 
            # Store in registry
            topic_registry.TOPIC_INDEX = index
            print(f"Successfully loaded topic index with {len(index)} terms.")
            
        except Exception as e:
            # CRASH STARTUP LOUDLY
            print(f"FATAL: Failed to load syllabus topic index: {e}", file=sys.stderr)
            sys.exit(1)
