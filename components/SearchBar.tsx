type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="mb-3 block">
      <span className="sr-only">搜索</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="搜索文字…"
        className="w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm text-rose-950 outline-none placeholder:text-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
      />
    </label>
  );
}
