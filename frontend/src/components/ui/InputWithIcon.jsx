export default function InputWithIcon({ icon: Icon, type = 'text', className = '', ...inputProps }) {
  return (
    <div
      className={`w-full flex items-center gap-2 px-2.5 bg-white border border-gray-200 rounded-[0.625rem]
        transition-[border-color,box-shadow] duration-150
        focus-within:border-brand-500 focus-within:ring-[3px] focus-within:ring-brand-500/10
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
