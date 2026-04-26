import type { ConfidentialityLevel } from '../../../features/confidentiality/types/confidentiality.types';

const styles: Record<ConfidentialityLevel, string> = {
  public:       'bg-[#d4f0e8] text-[#237a63] border border-[#9fd8c8]',
  interne:      'bg-[#dbeaf3] text-[#234C6A] border border-[#a8c8de]',
  confidentiel: 'bg-[#fff0d4] text-[#8a5f1a] border border-[#f0c878]',
  secret:       'bg-[#fce8ef] text-[#BD114A] border border-[#f4a8bf]',
};

const icons: Record<ConfidentialityLevel, string> = {
  public:       '🌐',
  interne:      '🏢',
  confidentiel: '🔒',
  secret:       '🔴',
};

export const ConfidentialityTag = ({ level }: { level: ConfidentialityLevel }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[level]}`}>
    <span>{icons[level]}</span>
    {level}
  </span>
);
