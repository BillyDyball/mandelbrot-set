import { ReactNode } from "react";

interface InputFieldProps {
  children: ReactNode;
  containerClasses?: string;
  label?: string;
}

function InputField({ children, containerClasses, label }: InputFieldProps) {
  return (
    <div
      className={
        "h-fit w-full bg-gray-300 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-40 p-2 " +
        containerClasses
      }
    >
      {label && (
        <label
          htmlFor={label}
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          {label}
        </label>
      )}

      {children}
    </div>
  );
}

export default InputField;
