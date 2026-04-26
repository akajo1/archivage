import type { ConfidentialityLevel } from '../../../features/confidentiality/types/confidentiality.types';

const styles: Record<ConfidentialityLevel, string> = {
  public: 'bg-[#dce8e2] text-[#355246] border border-[#b5cabf]',
  interne: 'bg-[#efe2cb] text-[#775f3f] border border-[#d8c39d]',
  confidentiel: 'bg-[#ecd8c8] text-[#8a5f3c] border border-[#d3b392]',
  secret: 'bg-[#f0d3cf] text-[#8b3e34] border border-[#d7a59c]',
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
