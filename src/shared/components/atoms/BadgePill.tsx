type BadgeName = 'critique' | 'normal' | 'faible';

const colors: Record<BadgeName, string> = {
  critique: 'bg-red-100 text-red-700 border border-red-200',
  normal: 'bg-blue-100 text-blue-700 border border-blue-200',
  faible: 'bg-gray-100 text-gray-600 border border-gray-200',
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

