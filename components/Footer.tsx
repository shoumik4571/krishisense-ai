export default function Footer() {
  return (
    <footer className="border-t border-field-200/70 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-xs text-stone-500">
        <p>
          <span className="font-semibold text-field-800">KrishiSense AI</span> — hackathon prototype for GDG Code for
          Communities 2.0 · Track 4: Agricultural Intelligence
        </p>
        <p>AI assessments are advisory only. Crop analysis powered by Gemini.</p>
      </div>
    </footer>
  );
}
