import Link, { LinkProps } from "./Link";

interface IconLinkProps extends LinkProps {}

function IconLink(props: IconLinkProps) {
  return (
    <Link className="w-10 h-10 block [&>*]:w-full [&>*]:h-full" {...props} />
  );
}

export default IconLink;
