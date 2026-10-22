// Shared registry for the Strong Heart, Wise Mind Life Skills series.
// Drives the library cards, the navbar panel, and the iframe view.
const LIFE_SKILL_LESSONS = [
  { id: 1, file: "lesson1.html", num: "Lesson 1", name: "Why We Feel", title: "Understanding feelings and learning self-control", desc: "Ages 10–13 · Story-centered lesson about noticing feelings, patience, and choosing what pleases Allah." },
  { id: 2, file: "lesson2.html", num: "Lesson 2", name: "Anger: Pause Before Harm", title: "Managing the first seconds of anger with the Prophetic pause", desc: "Ages 10–13 · The pause between feeling and harm: sit, seek refuge, stay silent, cool down." },
  { id: 3, file: "lesson3.html", num: "Lesson 3", name: "Sadness and Grief", title: "Carrying a heavy heart honestly — name it, share it, turn to Allah", desc: "Ages 10–13 · Tears are mercy, not weakness: Yaqub's grief, the Prophet's ﷺ tears, and heart first aid." },
  { id: 4, file: "lesson4.html", num: "Lesson 4", name: "Fear and Worry", title: "The Anchor: call to Allah, check the thought, slow the body, make one move", desc: "Ages 10–13 · Fear is a signal, not a fact: Yunus's du'a, dhikr, and one brave step." },
  { id: 5, file: "lesson5.html", num: "Lesson 5", name: "Jealousy and Comparison", title: "The Mizan Check — feel the sting, ask Allah, bless them, count your own", desc: "Ages 10–13 · Turning the sting into gratitude and ghibta, with the Prophet's ﷺ two directions of looking." },
  { id: 6, file: "lesson6.html", num: "Lesson 6", name: "Guilt, Regret, and Tawbah", title: "The Tawbah Path: stop, regret, seek, return — the door never closes", desc: "Ages 10–13 · Guilt is mercy knocking: Allah forgives ALL (39:53) and repair makes the heart light." },
  { id: 7, file: "lesson7.html", num: "Lesson 7", name: "Hurt, Rejection, and Self-Worth", title: "The Worth Anchor — your value was set by Allah before anyone voted", desc: "Ages 10–13 · Grieve honestly, anchor on 17:70 and 95:4, answer with dignity, widen your circle." },
  { id: 8, file: "lesson8.html", num: "Lesson 8", name: "Failure and Recovery", title: "The Comeback Plan: feel, learn, re-enter smaller, trust the Owner", desc: "Ages 10–13 · One fall is news, not a nationality — effort in Allah's math is never wasted." },
  { id: 9, file: "lesson9.html", num: "Lesson 9", name: "Sabr During Difficulty", title: "The Sabr Kit: hold the shock, pray the pain, work your part, wait on Allah", desc: "Ages 10–13 · Sabr is standing firm while working — Ayyub's tongue and the trainable gift of patience." },
  { id: 10, file: "lesson10.html", num: "Lesson 10", name: "Tawakkul and Uncertainty", title: "The Two-Hand Rule: do your part, tie the camel, ask Allah, let go", desc: "Ages 10–13 · Hands busy, heart surrendered — istikhara, shura, and the trust of the hungry bird." },
  { id: 11, file: "lesson11.html", num: "Lesson 11", name: "Gratitude Without Denying Pain", title: "Honest Shukr: name the hurt, name the gift, thank with both hands, act", desc: "Ages 10–13 · Blessed AND broken at once — gratitude never demands a lie, and grief never bans joy." },
  { id: 12, file: "lesson12.html", num: "Lesson 12", name: "Hope and Rising Again", title: "The Rising Loop: turn, hope, one step, again — your record is not your sentence", desc: "Ages 10–13 · The program's closing hope: no case sealed, no year lost — Allah's hand is out day and night." },
];

// Stable targets for the in-lesson "Jump to section" control. Every
// lesson1..12.html carries these exact section ids (verified 2026-09-07).
const LIFE_SKILL_SECTIONS = [
  { id: "story", label: "The story" },
  { id: "quran", label: "Qur'an anchor" },
  { id: "prophetic", label: "Prophetic lens" },
  { id: "difference", label: "Signal · Thought · Choice" },
  { id: "skill", label: "The skill tool" },
  { id: "transfer", label: "Practice story" },
  { id: "challenge", label: "Home challenge" },
  { id: "guide", label: "Parent guide" },
];

export { LIFE_SKILL_LESSONS, LIFE_SKILL_SECTIONS };
