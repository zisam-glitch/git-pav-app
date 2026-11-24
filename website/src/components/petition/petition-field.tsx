import type { InputHTMLAttributes } from "react";

/** A Hims-style field: a white soft-shadow box with the label small inside the top edge. */
export function PetitionField({
  id,
  label,
  className = "",
  ...rest
}: { id: string; label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        placeholder={label}
        {...rest}
        className="peer h-[60px] w-full rounded-[14px] border border-transparent bg-white px-4 pt-5 text-[16px] text-[#1b1b1b] shadow-[0_2px_10px_rgba(20,20,40,0.06)] outline-none placeholder-transparent focus:border-[#1b1b1b]"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-2.5 left-4 text-[12px] text-[#6b6b70] transition-all peer-placeholder-shown:top-[19px] peer-placeholder-shown:text-[16px] peer-focus:top-2.5 peer-focus:text-[12px]"
      >
        {label}
      </label>
    </div>
  );
}
