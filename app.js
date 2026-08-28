const moods = {
  sleepy: { score: 34, title: "Moving gently", description: "Your only job today can be taking care of you." },
  okay: { score: 58, title: "Steady and okay", description: "Not every day needs to be extraordinary." },
  bright: { score: 82, title: "Feeling bright", description: "A little sunshine is finding its way in." },
  sparkly: { score: 96, title: "Extra sparkly", description: "You are carrying some lovely energy today." }
};
const SUPABASE_URL = "https://lbcubdivdriyauwqjrpc.supabase.co";
const SUPABASE_KEY = "sb_publishable_teySu7QZtls5z8EZmNscxw_5C-yMsY8";
const $ = (id) => document.getElementById(id);
document.querySelectorAll(".mood-option").forEach((button) => button.addEventListener("click", () => {
  const mood = moods[button.dataset.mood];
  document.querySelectorAll(".mood-option").forEach((item) => item.classList.toggle("active", item === button));
  $("score").textContent = mood.score;
  $("moodTitle").textContent = mood.title;
  $("moodDescription").textContent = mood.description;
  $("meterFill").style.width = `${mood.score}%`;
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
    if (!response.ok) {
      throw new Error(`Supabase returned ${response.status}`);
    }
    $("savedMessage").textContent = "Saved securely to your mood journal.";
    saveButton.textContent = "Saved ✓";
  } catch (error) {
    console.error("Unable to save mood check-in:", error);
    $("savedMessage").textContent = "Could not save. Check your Supabase table and permissions.";
    saveButton.innerHTML = 'Try again <span>↻</span>';
  } finally {
    saveButton.disabled = false;
  }
});
$("themeButton").addEventListener("click", () => document.body.classList.toggle("dark"));
