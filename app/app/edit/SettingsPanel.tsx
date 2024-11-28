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
import { Album, LayoutConfig, Photo, Site } from "@/types/myphotos";
import { getSiteHost, getSiteUrl } from "@/utils/baseUrl";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect, useCallback } from "react";
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
import {
  EyeIcon,
  Loader2,
  ChevronDown,
  CodeIcon,
  LockIcon,
} from "lucide-react";
import { MainButton } from "@/app/components/MainButton";
import { usePremiumLimits } from "@/hooks/use-premium-limits";
import ConnectDomainModal from "@/app/components/modals/ConnectDomainModal";
import EmbedModal from "@/app/components/modals/EmbedModal";

interface SettingsPanelProps {
  site: Site;
  onChange: (config: LayoutConfig) => void;
  defaultEmail: string;
  onManageImages: () => void;
  onImportImages: () => void;
  images: Photo[];
  albums: Album[];
  onAlbumsChange: (albums: Album[]) => void;
}

function EditButton({
  show,
  field,
  value,
  type = "text",
  onSave,
}: {
  show?: boolean;
  field: string;
  value?: string;
  type?: "text" | "email" | "url" | "textarea" | "password";
  onSave: (value: string) => void;
}) {
  const [tempValue, setTempValue] = useState(value || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setTempValue(value || "");
    }
  }, [value, open]);

  const handleSave = useCallback(() => {
    onSave(tempValue);
    setOpen(false);
  }, [tempValue, onSave]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <MainButton
          className={`${!show ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!show}
        >
          Edit
        </MainButton>
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
                autoFocus
              />
            ) : (
              <input
                type={type}
                className="w-full p-2 border rounded"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                autoFocus
              />
            )}
            <MainButton
              className="main-btn !bg-blue-500 text-white"
              onClick={handleSave}
            >
              Save
            </MainButton>
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}

export default function SettingsPanel({
  site,
  onChange,
  defaultEmail,
  onManageImages,
  onImportImages,
  images,
  albums,
  onAlbumsChange,
}: SettingsPanelProps) {
  const config = (site.layout_config as LayoutConfig) ?? {};
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showAlbumsModal, setShowAlbumsModal] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [showEmbedModal, setShowEmbedModal] = useState(false);

  const limits = usePremiumLimits(site);

  const debouncedConfig = useDebounce(config, 800);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

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
    onChange({
      ...config,
      ...updates,
    });
  };

  const currentMaxColumns = config.maxColumns ?? 3;

  return (
    <div className="bg-zinc-50 w-full antialiased border-b-neutral-200 border-b">
      <div className="max-w-5xl mx-auto px-6 md:px-4 flex flex-col items-center justify-between gap-5 py-4 md:py-8">
        <h1 className="text-xl md:text-2xl font-medium tracking-tight text-center">
          Edit your gallery
        </h1>
        <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center">
          <Link
            className="text-neutral-700 text-sm"
            href={getSiteUrl(site.username)}
            target="_blank"
          >
            {getSiteHost(site.username)}
          </Link>
          <MainButton premiumDisabled={!limits.customDomain}>
            <ChainIcon /> Connect custom domain
          </MainButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 w-full max-w-5xl">
          <div className="flex flex-col gap-6">
            <h2 className="text-sm font-medium">General</h2>
            <div className="grid gap-4">
              <div className="flex flex-row gap-2 items-center">
                <span className="text-sm inline-flex items-center gap-3 text-neutral-700 w-[20px] pl-[0.5px]">
                  <ImagesIcon />
                </span>
                {images ? (
                  <MainButton
                    className={
                      images.length === 0 ? "!bg-blue-500 text-white" : ""
                    }
                    onClick={
                      images.length === 0 ? onImportImages : onManageImages
                    }
                  >
                    {images.length === 0 ? "Import images" : "Manage images"}
                  </MainButton>
                ) : null}
              </div>
              <div className="flex flex-row gap-2 items-center ">
                <span className="text-sm inline-flex items-center gap-3 text-neutral-700">
                  <AlbumIcon />
                </span>
                <MainButton
                  onClick={() => setShowAlbumsModal(true)}
                  premiumDisabled={limits.albumLimit === 1}
                >
                  Manage albums
                </MainButton>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <span className="text-sm inline-flex items-center gap-3 text-neutral-700 w-[20px] pl-[0.5px]">
                  <CodeIcon />
                </span>
                <MainButton onClick={() => setShowEmbedModal(true)}>
                  Embed gallery
                </MainButton>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <span className="text-sm inline-flex items-center gap-3 text-neutral-700 w-[20px] pl-[0.5px]">
                  <LockIcon className="w-4 h-4" />
                </span>
                <MainButton
                  onClick={() => {
                    updateConfig({
                      security: {
                        ...config.security,
                        password: {
                          enabled: !config.security?.password?.enabled,
                          value: config.security?.password?.value || "",
                        },
                      },
                    });
                  }}
                >
                  {config.security?.password?.enabled ? (
                    <>Password Protected</>
                  ) : (
                    <>Add Password Protection</>
                  )}
                </MainButton>
                {config.security?.password?.enabled && (
                  <EditButton
                    show={true}
                    field="password"
                    value={config.security?.password?.value}
                    type="text"
                    onSave={(value) =>
                      updateConfig({
                        security: {
                          ...config.security,
                          password: { enabled: true, value },
                        },
                      })
                    }
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h2 className="text-sm font-medium">Buttons</h2>
            <div className="grid grid-cols-[24px_40px_1fr_auto] gap-x-2 gap-y-2 items-center">
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
              <div />

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
                        value: config.buttons?.email?.value || defaultEmail,
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

          <div className="flex flex-col gap-6">
            <h2 className="text-sm font-medium">Display</h2>
            <div className="grid grid-cols-[24px_40px_1fr_auto] gap-x-2 gap-y-2 items-center">
              <HeadingIcon />
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
                      title: { show: true, value },
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
                      description: { show: true, value },
                    },
                  });
                }}
              />

              <SortIcon />
              <div className="col-span-2">
                <Label htmlFor="sort-button" className="text-sm font-normal">
                  Sort
                </Label>
              </div>
              <Select
                value={config.sort ?? "newest"}
                onValueChange={(value) => updateConfig({ sort: value as any })}
              >
                <SelectTrigger className="!w-[130px] !p-0 !px-3 !py-[3px] h-8">
                  <SelectValue />
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                </SelectContent>
              </Select>

              <ColumnsIcon />
              <div className="col-span-2">
                <Label htmlFor="columns-button" className="text-sm font-normal">
                  Max. Columns
                </Label>
              </div>
              <div className="flex flex-row gap-1">
                {[1, 2, 3].map((num) => (
                  <MainButton
                    key={num}
                    className={
                      currentMaxColumns === num ? "!bg-blue-500 text-white" : ""
                    }
                    onClick={() => updateConfig({ maxColumns: num as any })}
                  >
                    {num}
                  </MainButton>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 justify-center items-center">
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
            className="main-btn mx-auto"
            href={getSiteUrl(site.username)}
            target="_blank"
          >
            <EyeIcon className="w-4 h-4" /> View Gallery Website
          </a>
        </div>
      </div>

      <ManageAlbumsModal
        open={showAlbumsModal}
        onOpenChange={setShowAlbumsModal}
        images={images}
        userId={site.user_id}
        albums={albums}
        onAlbumsChange={onAlbumsChange}
        onOpenManageImages={() => {
          setShowAlbumsModal(false);
          onManageImages();
        }}
      />

      <ConnectDomainModal
        open={showDomainModal}
        onOpenChange={setShowDomainModal}
      />

      <EmbedModal
        open={showEmbedModal}
        onOpenChange={setShowEmbedModal}
        site={site}
        albums={albums}
      />
    </div>
  );
}
