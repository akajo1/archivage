type BadgeName = 'critique' | 'normal' | 'faible';

const colors: Record<BadgeName, string> = {
  critique: 'bg-[#f3d8d2] text-[#8b3e34] border border-[#d9a79e]',
  normal: 'bg-[#d9e6de] text-[#355246] border border-[#aec6ba]',
  faible: 'bg-[#eadfcd] text-[#6f5839] border border-[#d2bf9f]',
};

interface BadgePillProps {
  name: BadgeName;
  color?: string;
}

export const BadgePill = ({ name }: BadgePillProps) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[name]}`}>
    {name}
  </span>
);
