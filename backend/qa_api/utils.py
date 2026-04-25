# import json

# def load_syllabus(path="backend/syllabus/data/syllabus.json"):
#     with open(path, "r", encoding="utf-8") as f:
#         syllabus = json.load(f)

#     # Flatten JSON into list of subtopics
#     subtopics = []
#     for topic, subs in syllabus.items():
#         for sub_code, content in subs.items():
#             subtopics.append({
#                 "topic": topic,
#                 "subtopic": sub_code,
#                 "content": content
#             })
#     return subtopics

# if __name__ == "__main__":
#     subs = load_syllabus()
#     print(f"Loaded {len(subs)} subtopics")
#     print(subs[:3])  # first 3 entries
