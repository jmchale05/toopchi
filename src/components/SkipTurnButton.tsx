type SkipTurnButtonProps = {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
};

export function SkipTurnButton({
  onClick,
  className = "",
  disabled,
}: SkipTurnButtonProps) {
  return (
    <button
      type="button"
      className={`btn-skip ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      Skip turn
    </button>
  );
}
