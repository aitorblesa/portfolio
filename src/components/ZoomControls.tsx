interface ZoomControlsProps {
  onZoom: (factor: number) => void;
  onReset: () => void;
}

const baseButtonClass =
  "flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/65 text-lg font-semibold text-content backdrop-blur-xl transition-colors hover:bg-white/10";

export default function ZoomControls({ onZoom, onReset }: ZoomControlsProps) {
  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2">
      <button
        type="button"
        className={baseButtonClass}
        onClick={() => onZoom(1.1)}
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        type="button"
        className={baseButtonClass}
        onClick={() => onZoom(0.72)}
        aria-label="Zoom out"
      >
        -
      </button>
      <button
        type="button"
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-sm font-bold uppercase tracking-[0.18em] text-black shadow-lg shadow-black/30 transition-opacity hover:opacity-90"
        onClick={onReset}
        aria-label="Reset view"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon icon-tabler icons-tabler-outline icon-tabler-location"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
        </svg>
      </button>
    </div>
  );
}
