export function ChoiceCards({
  options,
  onPick,
}: {
  options: string[];
  onPick: (x: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {options.map((op) => (
        <button
          key={op}
          onClick={() => onPick(op)}
          className="bg-white border-2 rounded-xl p-4 hover:bg-blue-50 text-lg transition"
        >
          {op}
        </button>
      ))}
    </div>
  );
}
