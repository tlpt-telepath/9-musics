type SharePanelProps = {
  onCopyShareText: () => void;
  shareText: string;
  copyError: string | null;
};

export function SharePanel({ onCopyShareText, shareText, copyError }: SharePanelProps) {
  return (
    <section className="space-y-3 rounded-lg border border-slate-700 bg-slate-900/60 p-4">
      <div className="rounded-md border border-slate-700 p-3">
        <p className="mb-2 text-xs text-slate-300">X向けシェア文（任意）</p>
        <p className="mb-2 text-[11px] text-slate-300">文字数: {shareText.length}</p>
        <p className="mb-3 whitespace-pre-wrap text-xs text-slate-100">{shareText}</p>
        <button
          type="button"
          onClick={onCopyShareText}
          className="rounded border border-slate-600 px-3 py-1 text-xs text-slate-100 hover:bg-slate-700"
        >
          シェア文をコピー
        </button>
        {copyError && <p className="mt-2 text-xs text-rose-300">{copyError}</p>}
      </div>
    </section>
  );
}
