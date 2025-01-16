import { IconName } from '../icons/icon.typings';

export type ActionButtonConfig = {
  iconName: IconName;
  label: string;
  clickCallback: () => void;
  resolveLinkDisabled: () => boolean;
};
