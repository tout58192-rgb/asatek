import {
  BatteryCharging,
  CircuitBoard,
  Component,
  Cpu,
  Fan,
  PlugZap,
  Sun,
  Zap,
} from 'lucide-react';

const ICON_MAP = {
  Zap,
  Sun,
  PlugZap,
  BatteryCharging,
  Component,
  Fan,
  Cpu,
  CircuitBoard,
};

export function CategoryIcon({
  name,
  className = 'w-6 h-6',
}: {
  name?: string | null;
  className?: string;
}) {
  const IconComp =
    (name && ICON_MAP[name as keyof typeof ICON_MAP]) || Component;
  return <IconComp className={className} strokeWidth={1.75} />;
}
