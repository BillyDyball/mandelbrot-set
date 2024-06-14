import { useContext, useMemo, useState } from "react";
import GithubLogo from "../assets/github-logo.svg?react";
import { ContextControl } from "../providers/ProviderControl";
import { classNames } from "../utils/common.utils";
import ColorGradient from "./ColorGradient";
import IconLink from "./IconLink";
import InputField from "./InputField";
import Link from "./Link";
import Select from "./Select";

function ControlDialog() {
  const [open, setOpen] = useState<boolean>(false);
  const { controls, setControls } = useContext(ContextControl);

  const sidebarClasses = useMemo(
    () =>
      classNames(
        "h-full w-96 transition-transform  bg-gray-400 rounded-xl bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-20 p-4 gap-4 flex flex-col",
        {
          "-translate-x-6": open,
          "translate-x-full": !open,
        }
      ),
    [open]
  );

  return (
    <>
      <button
        className="h-20 w-4 absolute top-1/2 right-0 rounded-l-lg z-10 bg-clip-padding backdrop-filter backdrop-blur-md bg-gray-400 bg-opacity-20"
        onClick={() => setOpen((prev) => !prev)}
      />
      <div className="h-screen w-fit absolute top-0 right-0 py-4 box-border">
        <div className={sidebarClasses}>
          <InputField label="Resolution">
            <Select>
              <option selected hidden>
                Choose a resolution
              </option>
              <option value="US">1024×768</option>
              <option value="CA">1280×800</option>
              <option value="FR">1280×1024</option>
              <option value="DE">2560×1440</option>
            </Select>
          </InputField>

          <InputField containerClasses="pt-7">
            <ColorGradient colors={controls.colors} />
          </InputField>

          <div className="w-full h-fit  absolute bottom-2 left-0">
            <div className="flex justify-center px-4 py-2 gap-4">
              <IconLink>
                <GithubLogo />
              </IconLink>
            </div>
            <p className="text-center">
              Made by <Link>Billy Dyball</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default ControlDialog;
