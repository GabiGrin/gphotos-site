import {
  ChainIcon,
  EditingIcon,
  EmailIcon,
  WebsiteIcon,
  SortIcon,
} from "@/app/components/icons/icons";
import {
  ImagesIcon,
  ShareIcon,
  HeadingIcon,
  TextIcon,
  ColumnsIcon,
} from "@/app/components/icons/icons";
import { PremiumIcon } from "@/app/components/icons/PremiumIcon";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LayoutConfig, Site } from "@/types/gphotos";
import { getSiteHost, getSiteUrl } from "@/utils/baseUrl";
import Link from "next/link";

export default function SettingsPanel(props: {
  site: Site;
  onChange: (config: LayoutConfig) => void;
}) {
  return (
    <div className="bg-zinc-50 w-full antialiased">
      <div className="max-w-5xl mx-auto px-4 py-1 flex flex-col items-center justify-between gap-5 py-8">
        <h1 className="text-2xl font-medium tracking-tight text-center">
          Edit your gallery
        </h1>
        <div className="flex flex-row gap-4 w-full justify-center items-center">
          <Link
            className="text-neutral-700 text-sm"
            href={getSiteUrl(props.site.username)}
            target="_blank"
          >
            {getSiteHost(props.site.username)}
          </Link>
          <button className="main-btn">
            <ChainIcon /> Connect custom domain <PremiumIcon />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8 w-full max-w-5xl">
          <div className="flex flex-col gap-[10px]">
            <h2 className="text-sm font-medium mb-1">General</h2>
            <div className="flex flex-row gap-2 items-center">
              <span className="text-sm inline-flex items-center gap-3 text-neutral-700">
                {" "}
                <ImagesIcon /> Images{" "}
              </span>

              <button className="main-btn">Manage images</button>
            </div>
          </div>

          <div className="flex flex-col gap-[10px]">
            <h2 className="text-sm font-medium mb-1">Buttons</h2>

            <div className="grid grid-cols-[auto_auto_1fr_auto] gap-x-2 gap-y-1 grid-flow-row-dense	grid-rows-3 p-2 items-center">
              <ShareIcon />
              <Switch id="share-button" />
              <Label htmlFor="share-button" className="text-sm font-normal">
                Share
              </Label>
              <button className="main-btn">Edit</button>

              <EmailIcon />
              <Switch id="email-button" />
              <Label htmlFor="email-button" className="text-sm font-normal">
                Email
              </Label>
              <button className="main-btn">Edit</button>

              <WebsiteIcon />
              <Switch id="website-button" />
              <Label htmlFor="website-button" className="text-sm font-normal">
                Website
              </Label>
              <button className="main-btn">Edit</button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium mb-1">Display</h2>
            <div className="grid grid-cols-[auto_auto_1fr_auto] gap-x-2 gap-y-1 grid-flow-row-dense	grid-rows-3 p-2 items-center">
              <HeadingIcon className="col-span-[20px]" />
              <Switch id="heading-button" />
              <Label htmlFor="heading-button" className="text-sm font-normal">
                Heading
              </Label>
              <div>
                <button className="main-btn">Edit</button>
              </div>

              <TextIcon />
              <Switch id="text-button" />
              <Label htmlFor="text-button" className="text-sm font-normal">
                Description
              </Label>
              <div>
                <button className="main-btn">Edit</button>
              </div>

              <SortIcon />
              <Label htmlFor="sort-button" className="text-sm font-normal">
                Sort
              </Label>
              <div />
              <div>
                <button className="main-btn">Newest first</button>
              </div>
              <ColumnsIcon />
              <Label htmlFor="columns-button" className="text-sm font-normal">
                Columns
              </Label>
              <div />
              <div className="flex flex-row gap-1">
                <button className="main-btn">1</button>
                <button className="main-btn">2</button>
                <button className="main-btn">3</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
