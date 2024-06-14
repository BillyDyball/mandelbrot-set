export const classNames = (
  className: string,
  optionalClassNames: { [key: string]: boolean } = {}
) => {
  return (
    className +
    " " +
    Object.keys(optionalClassNames)
      .filter((key) => optionalClassNames[key])
      .join(" ")
  );
};
