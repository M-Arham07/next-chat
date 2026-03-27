import { cn } from '@/lib/utils';
import type { LucideIcon, LucideProps } from 'lucide-react-native';
import { withUniwind } from 'uniwind';
import {
  Check,
  CheckCheck,
  Play,
  Pause,
  FileText,
  Download,
  Trash2,
  Send,
  Paperclip,
  Camera,
  Mic,
} from 'lucide-react-native';

type IconProps = LucideProps & {
  as: LucideIcon;
};

function IconImpl({ as: IconComponent, ...props }: IconProps) {
  return <IconComponent {...props} />;
}

const StyledIcon = withUniwind(IconImpl, {
  size: {
    fromClassName: 'className',
    styleProperty: 'width',
  },
  color: {
    fromClassName: 'className',
    styleProperty: 'color',
  },
});

/**
 * A wrapper component for Lucide icons with Uniwind `className` support via `withUniwind`.
 *
 * This component allows you to render any Lucide icon while applying utility classes
 * using `uniwind`. It avoids the need to wrap or configure each icon individually.
 *
 * @component
 * @example
 * ```tsx
 * import { ArrowRight } from 'lucide-react-native';
 * import { Icon } from '@/registry/components/ui/icon';
 *
 * <Icon as={ArrowRight} className="text-red-500 size-4" />
 * ```
 *
 * @param {LucideIcon} as - The Lucide icon component to render.
 * @param {string} className - Utility classes to style the icon using Uniwind.
 * @param {number} size - Icon size (overrides the size class).
 * @param {...LucideProps} ...props - Additional Lucide icon props passed to the "as" icon.
 */
function Icon({ as: IconComponent, className, ...props }: IconProps) {
  return (
    <StyledIcon as={IconComponent} className={cn('text-foreground size-5', className)} {...props} />
  );
}

// Convenience icon exports
export const CheckIcon = (props: LucideProps) => (
  <Icon as={Check} {...props} />
);

export const CheckCheckIcon = (props: LucideProps) => (
  <Icon as={CheckCheck} {...props} />
);

export const PlayIcon = (props: LucideProps) => (
  <Icon as={Play} {...props} />
);

export const PauseIcon = (props: LucideProps) => (
  <Icon as={Pause} {...props} />
);

export const FileIcon = (props: LucideProps) => (
  <Icon as={FileText} {...props} />
);

export const DownloadIcon = (props: LucideProps) => (
  <Icon as={Download} {...props} />
);

export const TrashIcon = (props: LucideProps) => (
  <Icon as={Trash2} {...props} />
);

export const SendIcon = (props: LucideProps) => (
  <Icon as={Send} {...props} />
);

export const PaperclipIcon = (props: LucideProps) => (
  <Icon as={Paperclip} {...props} />
);

export const CameraIcon = (props: LucideProps) => (
  <Icon as={Camera} {...props} />
);

export const MicIcon = (props: LucideProps) => (
  <Icon as={Mic} {...props} />
);

export { Icon };
