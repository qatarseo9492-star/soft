// Lightweight icon registry so we keep imports tidy
import {
  LayoutDashboard,
  Boxes,
  PlusSquare,
  Settings,
  UserCircle2,
  ImagePlus,
  ShieldHalf,
  Sparkles,
} from "lucide-react";

export const Icons = {
  logo: Sparkles,
  dashboard: LayoutDashboard,
  software: Boxes,
  create: PlusSquare,
  settings: Settings,
  profile: UserCircle2,
  upload: ImagePlus,
  secure: ShieldHalf,
};

export type IconName = keyof typeof Icons;
