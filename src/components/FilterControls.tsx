interface FilterControlsProps {
  activeRegion: string;
  categories: Array<{ key: string; label: string }>;
  onFilter: (region: string) => void;
}

export default function FilterControls({
  activeRegion,
  categories,
  onFilter,
}: FilterControlsProps) {
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-30 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2">
      <div className="pointer-events-auto flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/65 p-2 backdrop-blur-xl">
          {categories.map((category) => {
            const isActive = activeRegion === category.key;
            return (
              <button
                key={category.key}
                type="button"
                className={`rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] transition-colors ${
                  isActive
                    ? "bg-accent text-black"
                    : "text-content hover:bg-white/10"
                }`}
                onClick={() => onFilter(category.key)}
              >
                {category.label}
              </button>
            );
          })}
        </div>
        <p className="rounded-full border border-white/10 bg-black/45 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-content/70 backdrop-blur-md">
          Drag to explore
        </p>
      </div>
    </div>
  );
}
