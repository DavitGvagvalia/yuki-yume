export default function CartBadge({ count }) {
  if (count === 0) return null;
  return (
    <span
      className="
        absolute
        top-[-7px]
        right-[-1px]
        w-5
        h-5
        rounded-full
        bg-accent-hover
        text-white
        text-xs
        flex
        items-center
        justify-center
        font-semibold
      "
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
