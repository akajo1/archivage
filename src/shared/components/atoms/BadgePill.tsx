type BadgeName = 'critique' | 'normal' | 'faible';

const colors: Record<BadgeName, string> = {
  critique: 'bg-[#fce8ef] text-[#BD114A] border border-[#f4a8bf]',
  normal:   'bg-[#d4f0e8] text-[#237a63] border border-[#9fd8c8]',
  faible:   'bg-[#dbeaf3] text-[#456882] border border-[#a8c8de]',
};

interface BadgePillProps { name: BadgeName; color?: string; }

export const BadgePill = ({ name }: BadgePillProps) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[name]}`}>
    {name}
  </span>
);
