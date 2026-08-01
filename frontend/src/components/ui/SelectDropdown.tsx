import Select, { Props as SelectProps, GroupBase } from "react-select";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function SelectDropdown<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: SelectProps<Option, IsMulti, Group> & { error?: boolean }) {
  return (
    <Select
      {...props}
      unstyled
      classNames={{
        control: (state) =>
          cn(
            "flex min-h-11 w-full items-center justify-between rounded-md border bg-white/60 backdrop-blur-sm px-3 py-1 shadow-sm transition-colors",
            state.isFocused ? "border-slate-400 ring-2 ring-slate-200" : "border-slate-200/80",
            props.error ? "border-red-500 ring-red-200" : "",
            state.isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          ),
        placeholder: () => "text-slate-500",
        input: () => "text-slate-900",
        valueContainer: () => "gap-1",
        singleValue: () => "text-slate-900",
        multiValue: () => "bg-slate-200 rounded-sm px-1 py-0.5 m-0.5",
        multiValueLabel: () => "text-sm text-slate-900",
        multiValueRemove: () => "hover:bg-slate-300 hover:text-red-500 rounded-sm ml-1 px-1",
        clearIndicator: () => "text-slate-400 hover:text-slate-600 p-1 rounded-md",
        dropdownIndicator: () => "text-slate-400 hover:text-slate-600 p-1",
        menu: () => "mt-1.5 rounded-md border border-white/60 bg-white/80 backdrop-blur-xl shadow-lg p-1 z-50",
        groupHeading: () => "px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase",
        option: (state) =>
          cn(
            "relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors",
            state.isFocused ? "bg-slate-100/80 text-slate-900" : "text-slate-700",
            state.isSelected ? "bg-slate-200 text-slate-900 font-medium" : "",
            state.isDisabled ? "pointer-events-none opacity-50" : ""
          ),
        noOptionsMessage: () => "py-6 text-center text-sm text-slate-500",
      }}
    />
  );
}
