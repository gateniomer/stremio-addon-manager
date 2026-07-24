/*
 * Icon wrappers — primarily from lucide-react (consistent 24x24 viewBox).
 * Custom GitHub icon kept inline since Lucide doesn't ship it.
 */
import {
  X,
  Search,
  RefreshCw,
  Download,
  Upload,
  Star,
  Trash2,
  Check,
  Power,
  Mail,
  Lock,
  AlertTriangle,
  CloudUpload,
  CheckSquare,
  Package,
  Copy,
  Info,
  MoreVertical,
} from "lucide-react";

const iconProps = { size: 20, strokeWidth: 2 };

export const IconPlus = ({ size = 22, strokeWidth = 2.5, ...p }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <line x1="12" y1="3" x2="12" y2="21" />
    <line x1="3" y1="12" x2="21" y2="12" />
  </svg>
);
export const IconX = (p) => <X {...iconProps} {...p} />;
export const IconSearch = (p) => <Search {...iconProps} {...p} />;
export const IconRefresh = (p) => <RefreshCw {...iconProps} {...p} />;
export const IconDownload = (p) => <Download {...iconProps} {...p} />;
export const IconUpload = (p) => <Upload {...iconProps} {...p} />;
export const IconStar = ({ filled, ...p }) => (
  <Star {...iconProps} fill={filled ? "currentColor" : "none"} {...p} />
);
export const IconTrash = (p) => <Trash2 {...iconProps} {...p} />;
export const IconCheck = (p) => <Check {...iconProps} {...p} />;
export const IconGrip = ({ size = 20, ...p }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...p}
  >
    <circle cx="9" cy="6" r="1.5" />
    <circle cx="15" cy="6" r="1.5" />
    <circle cx="9" cy="12" r="1.5" />
    <circle cx="15" cy="12" r="1.5" />
    <circle cx="9" cy="18" r="1.5" />
    <circle cx="15" cy="18" r="1.5" />
  </svg>
);
export const IconMore = (p) => <MoreVertical size={22} strokeWidth={2} {...p} />;
export const IconPower = (p) => <Power {...iconProps} {...p} />;
export const IconMail = (p) => <Mail {...iconProps} {...p} />;
export const IconLock = (p) => <Lock {...iconProps} {...p} />;
export const IconAlertTriangle = (p) => <AlertTriangle {...iconProps} {...p} />;
export const IconCloudUpload = ({ size = 22, strokeWidth = 2.2, ...p }) => (
  <CloudUpload size={size} strokeWidth={strokeWidth} {...p} />
);
export const IconCheckSquare = (p) => <CheckSquare {...iconProps} {...p} />;
export const IconPackage = (p) => <Package {...iconProps} {...p} />;
export const IconCopy = (p) => <Copy {...iconProps} {...p} />;
export const IconInfo = (p) => <Info {...iconProps} {...p} />;

/* GitHub — custom */
export const IconGitHub = ({ size = 20, strokeWidth = 2, ...p }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
  </svg>
);
