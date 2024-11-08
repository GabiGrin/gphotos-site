import {
  ChainIcon,
  EditingIcon,
  EmailIcon,
  WebsiteIcon,
  SortIcon,
  SaveDeployIcon,
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
import { Album, LayoutConfig, Photo, Site } from "@/types/gphotos";
import { getSiteHost, getSiteUrl } from "@/utils/baseUrl";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClientApi } from "@/utils/dal/client-api";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AlbumIcon } from "@/app/components/icons/icons";
import ManageAlbumsModal from "@/app/components/modals/ManageAlbumsModal";
import { useDebounce } from "@/hooks/useDebounce";
import { CheckIcon } from "@/app/components/icons/icons";
import { EyeIcon, Loader2 } from "lucide-react";

export default function SettingsPanel(props: {
  site: Site;
  onChange: (config: LayoutConfig) => void;
  defaultEmail: string;
  onManageImages: () => void;
  onImportImages: () => void;
  images: Photo[];
  albums: Album[];
  onAlbumsChange: (albums: Album[]) => void;
}) {
  const config = (props.site.layout_config as LayoutConfig) ?? {};
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showAlbumsModal, setShowAlbumsModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  const debouncedConfig = useDebounce(config, 800);

  useEffect(() => {
    setSaveStatus("saving");

    let timeout: NodeJS.Timeout;

    const save = async () => {
      const client = createClient();
      const clientApi = createClientApi(client);
      await clientApi.saveLayoutConfig(config);
      setSaveStatus("saved");
      const _timeout = setTimeout(() => {
        setSaveStatus("idle");
      }, 4000);

      timeout = _timeout;
    };

    save();

    return () => clearTimeout(timeout);
  }, [debouncedConfig]);

  const updateConfig = (updates: Partial<LayoutConfig>) => {
    props.onChange({
      ...config,
      ...updates,
    });
  };

  const EditButton = ({
    show,
    field,
    value,
    type = "text",
    onSave,
  }: {
    show?: boolean;
    field: string;
    value?: string;
    type?: "text" | "email" | "url" | "textarea";
    onSave: (value: string) => void;
  }) => {
    const [tempValue, setTempValue] = useState(value || "");
    const [open, setOpen] = useState(false);

    useEffect(() => {
      if (editingField === field) {
        setOpen(true);
        setEditingField(null);
      }
    }, [editingField, field]);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={`main-btn ${!show ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!show}
          >
            Edit
          </button>
        </PopoverTrigger>
        {show && (
          <PopoverContent className="w-80">
            <div className="flex flex-col gap-2">
              {type === "textarea" ? (
                <textarea
                  className="w-full p-2 border rounded"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  rows={4}
                />
              ) : (
                <input
                  type={type}
                  className="w-full p-2 border rounded"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                />
              )}
              <button
                className="main-btn !bg-blue-500 text-white"
                onClick={() => {
                  onSave(tempValue);
                  setOpen(false);
                }}
              >
                Save
              </button>
            </div>
          </PopoverContent>
        )}
      </Popover>
    );
  };

  const currentMaxColumns = config.maxColumns ?? 3;

  return (
    <div className="bg-zinc-50 w-full antialiased border-b-neutral-200 border-b">
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-between gap-5 py-8">
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

              {props.images ? (
                <button
                  className={`main-btn ${props.images.length === 0 ? "!bg-blue-500 text-white" : ""}`}
                  onClick={
                    props.images.length === 0
                      ? props.onImportImages
                      : props.onManageImages
                  }
                >
                  {props.images.length === 0
                    ? "Import images"
                    : "Manage images"}
                </button>
              ) : null}
            </div>
            <div className="flex flex-row gap-2 items-center">
              <span className="text-sm inline-flex items-center gap-3 text-neutral-700">
                <AlbumIcon /> Albums
              </span>
              <button
                className="main-btn"
                onClick={() => setShowAlbumsModal(true)}
              >
                Manage albums
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-[10px]">
            <h2 className="text-sm font-medium mb-1">Buttons</h2>

            <div className="grid grid-cols-[auto_auto_1fr_auto] gap-x-2 gap-y-1 grid-flow-row-dense	grid-rows-3 p-2 items-center">
              <ShareIcon />
              <Switch
                id="share-button"
                checked={config.buttons?.share?.show}
                onCheckedChange={(checked) =>
                  updateConfig({
                    buttons: {
                      ...config.buttons,
                      share: { ...config?.buttons?.share, show: checked },
                    },
                  })
                }
              />
              <Label htmlFor="share-button" className="text-sm font-normal">
                Share
              </Label>
              <EditButton
                show={Boolean(config.buttons?.share?.show)}
                field="share"
                value={config.buttons?.share?.value}
                type="url"
                onSave={(value) =>
                  updateConfig({
                    buttons: {
                      ...config.buttons,
                      share: { show: true, value },
                    },
                  })
                }
              />

              <EmailIcon />
              <Switch
                id="email-button"
                checked={Boolean(config.buttons?.email?.show)}
                onCheckedChange={(checked) =>
                  updateConfig({
                    buttons: {
                      ...config.buttons,
                      email: {
                        show: checked,
                        value:
                          config.buttons?.email?.value || props.defaultEmail,
                      },
                    },
                  })
                }
              />
              <Label htmlFor="email-button" className="text-sm font-normal">
                Email
              </Label>
              <EditButton
                show={Boolean(config.buttons?.email?.show)}
                field="email"
                value={config.buttons?.email?.value}
                type="email"
                onSave={(value) =>
                  updateConfig({
                    buttons: {
                      ...config.buttons,
                      email: { show: true, value },
                    },
                  })
                }
              />

              <WebsiteIcon />
              <Switch
                id="website-button"
                checked={Boolean(config.buttons?.website?.show)}
                onCheckedChange={(checked) =>
                  updateConfig({
                    buttons: {
                      ...config.buttons,
                      website: {
                        show: checked,
                        value:
                          config.buttons?.website?.value ||
                          "https://www.example.com",
                      },
                    },
                  })
                }
              />
              <Label htmlFor="website-button" className="text-sm font-normal">
                Website
              </Label>
              <EditButton
                show={Boolean(config.buttons?.website?.show)}
                field="website"
                value={config.buttons?.website?.value}
                type="url"
                onSave={(value) =>
                  updateConfig({
                    buttons: {
                      ...config.buttons,
                      website: { show: true, value },
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium mb-1">Display</h2>
            <div className="grid grid-cols-[auto_auto_1fr_auto] gap-x-2 gap-y-1 grid-flow-row-dense	grid-rows-3 p-2 items-center">
              <HeadingIcon className="col-span-[20px]" />
              <Switch
                id="heading-button"
                checked={Boolean(config.content?.title?.show)}
                onCheckedChange={(checked) => {
                  updateConfig({
                    content: {
                      ...config.content,
                      title: {
                        show: checked,
                        value: config.content?.title?.value || "",
                      },
                    },
                  });
                  if (checked && !config.content?.title?.value) {
                    setEditingField("title");
                  }
                }}
              />
              <Label htmlFor="heading-button" className="text-sm font-normal">
                Heading
              </Label>
              <EditButton
                show={config.content?.title?.show}
                field="title"
                value={config.content?.title?.value}
                onSave={(value) => {
                  setEditingField(null);
                  updateConfig({
                    content: {
                      ...config.content,
                      title: {
                        show: true,
                        value: value,
                      },
                    },
                  });
                }}
              />

              <TextIcon />
              <Switch
                id="text-button"
                checked={config.content?.description?.show}
                onCheckedChange={(checked) => {
                  updateConfig({
                    content: {
                      ...config.content,
                      description: {
                        show: checked,
                        value: config.content?.description?.value || "",
                      },
                    },
                  });
                  if (checked && !config.content?.description?.value) {
                    setEditingField("description");
                  }
                }}
              />
              <Label htmlFor="text-button" className="text-sm font-normal">
                Description
              </Label>
              <EditButton
                show={config.content?.description?.show}
                field="description"
                value={config.content?.description?.value}
                type="textarea"
                onSave={(value) => {
                  setEditingField(null);
                  updateConfig({
                    content: {
                      ...config.content,
                      description: {
                        show: true,
                        value: value,
                      },
                    },
                  });
                }}
              />

              <SortIcon />
              <Label htmlFor="sort-button" className="text-sm font-normal">
                Sort
              </Label>
              <div />
              <Select
                value={config.sort ?? "newest"}
                onValueChange={(value) => updateConfig({ sort: value as any })}
              >
                <SelectTrigger className="!w-[130px] !p-0 !px-3 !py-[3px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                </SelectContent>
              </Select>

              <ColumnsIcon />
              <Label htmlFor="columns-button" className="text-sm font-normal">
                Max. Columns
              </Label>
              <div />
              <div className="flex flex-row gap-1">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    className={`main-btn ${
                      currentMaxColumns === num ? "!bg-blue-500 text-white" : ""
                    }`}
                    onClick={() => updateConfig({ maxColumns: num as any })}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-2">
          <div className="flex flex-row gap-2 justify-center">
            {saveStatus === "saving" && (
              <div className="text-sm text-neutral-500 flex items-center gap-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving and publishing changes...
              </div>
            )}
            {saveStatus === "saved" && (
              <div className="text-sm text-green-600 flex items-center gap-1">
                <CheckIcon className="w-4 h-4" />
                Changes saved and published
              </div>
            )}
            {saveStatus === "idle" && (
              <div className="text-sm text-neutral-500 flex items-center gap-1">
                <SaveDeployIcon className="w-4 h-4" />
                Changes will be published automatically
              </div>
            )}
          </div>
          <a
            className="main-btn"
            href={getSiteUrl(props.site.username)}
            target="_blank"
          >
            <EyeIcon className="w-4 h-4" /> View Gallery Website
          </a>
        </div>
      </div>
      <ManageAlbumsModal
        open={showAlbumsModal}
        onOpenChange={setShowAlbumsModal}
        images={props.images || []}
        userId={props.site.user_id}
        albums={props.albums}
        onAlbumsChange={props.onAlbumsChange}
      />
    </div>
  );
}
