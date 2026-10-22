import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from lesson_builder import build
from lessons_data import LESSONS  # lessons 5-8

for n in sorted(LESSONS, key=int):
    print(build(LESSONS[n]))

with open(os.path.join(os.path.dirname(__file__), "lessons_data_9.json"), encoding="utf-8") as f:
    D = json.load(f)
for k in sorted(D, key=int):
    print(build(D[k]))
