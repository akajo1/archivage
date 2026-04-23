import type { ConfidentialityLevel } from '../../../features/confidentiality/types/confidentiality.types';

const styles: Record<ConfidentialityLevel, string> = {
  public: 'bg-green-100 text-green-700 border border-green-200',
  interne: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  confidentiel: 'bg-orange-100 text-orange-700 border border-orange-200',
  secret: 'bg-red-100 text-red-800 border border-red-300',
};

const icons: Record<ConfidentialityLevel, string> = {
  public: '🌐',
  interne: '🏢',
  confidentiel: '🔒',
  secret: '🔴',
};

export const ConfidentialityTag = ({ level }: { level: ConfidentialityLevel }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[level]}`}>
    <span>{icons[level]}</span>
    {level}
  </span>
);

