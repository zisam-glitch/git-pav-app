import type { InputHTMLAttributes } from "react";

/** A plain underline field with its label above, in black on white. */
export function PetitionField({
  id,
  label,
  className = "",
  ...rest
}: { id: string; label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[13px] tracking-wide text-black/55 uppercase">
        {label}
      </label>
      <input
        id={id}
        {...rest}
        className="mt-1 h-12 w-full border-0 border-b border-black/25 bg-transparent px-0 text-[20px] text-black outline-none focus:border-black"
      />
    </div>
  );
}
