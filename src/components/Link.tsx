import { ComponentPropsWithoutRef } from "react";

export type LinkProps = ComponentPropsWithoutRef<"a">;

function Link({ className, ...props }: LinkProps) {
  return (
    <a
      className={"hover:underline cursor-pointer text-blue-400 " + className}
      {...props}
    />
  );
}

export default Link;
