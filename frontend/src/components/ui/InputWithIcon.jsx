/**
 * InputWithIcon — flex-based icon + input wrapper.
 * Uses explicit Tailwind utilities (not .input-field) on the wrapper
 * to avoid CSS class specificity conflicts with padding overrides.
 * Focus ring is handled via focus-within on the wrapper div.
 *
 * Props:
 *   icon       — Lucide component to render on the left
 *   type       — input type (default "text")
 *   className  — extra classes appended to the wrapper div
 *   All other props are forwarded to the <input> element.
 */
export default function InputWithIcon({ icon: Icon, type = 'text', className = '', ...inputProps }) {
  return (
    <div
      className={`w-full flex items-center gap-2 px-2.5 bg-white border border-gray-200 rounded-[0.625rem]
        transition-[border-color,box-shadow] duration-150
        focus-within:border-blue-500 focus-within:ring-[3px] focus-within:ring-blue-500/10
        ${className}`}
    >
      <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      <input
        type={type}
        className="flex-1 bg-transparent outline-none py-[0.45rem] text-sm text-gray-900 placeholder:text-gray-400 font-[inherit]"
        {...inputProps}
      />
    </div>
  );
}
