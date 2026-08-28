const moods = {
  sleepy: { score: 34, title: "Moving gently", description: "Your only job today can be taking care of you." },
  okay: { score: 58, title: "Steady and okay", description: "Not every day needs to be extraordinary." },
  bright: { score: 82, title: "Feeling bright", description: "A little sunshine is finding its way in." },
  sparkly: { score: 96, title: "Extra sparkly", description: "You are carrying some lovely energy today." }
};
const SUPABASE_URL = "https://lbcubdivdriyauwqjrpc.supabase.co";
const SUPABASE_KEY = "sb_publishable_teySu7QZtls5z8EZmNscxw_5C-yMsY8";
const $ = (id) => document.getElementById(id);
const LOCAL_CHECKINS_KEY = "rara-mood-checkins";
if (new URLSearchParams(window.location.search).get("reset") === "1") {
  localStorage.removeItem(LOCAL_CHECKINS_KEY);
  window.history.replaceState({}, "", window.location.pathname);
}
function dayKey(date) { const value = new Date(date); return `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`; }
function calculateStreak(rows) {
  const days = new Set(rows.map((row) => dayKey(row.created_at || row.date)));
  const cursor = new Date(); let streak = 0;
  cursor.setHours(0, 0, 0, 0);
  while (days.has(dayKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}
function renderStreak(rows) { const count = calculateStreak(rows); $("streak").textContent = `✦ ${count} day${count === 1 ? "" : "s"} streak`; }
function loadStreak() { renderStreak(JSON.parse(localStorage.getItem(LOCAL_CHECKINS_KEY) || "[]")); }
document.querySelectorAll(".mood-option").forEach((button) => button.addEventListener("click", () => {
  const mood = moods[button.dataset.mood];
  document.querySelectorAll(".mood-option").forEach((item) => item.classList.toggle("active", item === button));
  $("score").textContent = mood.score; $("moodTitle").textContent = mood.title; $("moodDescription").textContent = mood.description; $("meterFill").style.width = `${mood.score}%`;
}));
document.querySelectorAll(".chip").forEach((chip) => chip.addEventListener("click", () => chip.classList.toggle("selected")));
const saveButton = $("saveButton");
saveButton.addEventListener("click", async () => {
  const activeMood = document.querySelector(".mood-option.active");
  const selectedFeelings = [...document.querySelectorAll(".chip.selected")].map((chip) => chip.dataset.feeling);
  saveButton.disabled = true;
  saveButton.textContent = "Saving...";
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/mood_responses`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        mood: activeMood.dataset.mood,
        feeling: selectedFeelings.join(", "),
        journal: $("journal").value.trim()
      })
    });
    if (!response.ok) throw new Error(`Supabase returned ${response.status}`);
    const checkins = JSON.parse(localStorage.getItem(LOCAL_CHECKINS_KEY) || "[]");
    checkins.push({ created_at: new Date().toISOString() });
    localStorage.setItem(LOCAL_CHECKINS_KEY, JSON.stringify(checkins));
    renderStreak(checkins);
    $("savedMessage").textContent = "Saved securely to Rara's mood journal.";
    saveButton.textContent = "Saved ✓";
  } catch (error) {
    console.error("Unable to save mood check-in:", error);
    $("savedMessage").textContent = "Could not save. Please try again.";
    saveButton.innerHTML = 'Try again <span>↻</span>';
  } finally {
    saveButton.disabled = false;
    setTimeout(() => { saveButton.innerHTML = 'Save check-in <span>→</span>'; }, 1800);
  }
});
$("themeButton").addEventListener("click", () => document.body.classList.toggle("dark"));
loadStreak();
