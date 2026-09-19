import React from 'react';

interface FooterProps {
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
  extraLink?: React.ReactNode;
}

export const Footer: React.FC<FooterProps> = ({
  className = '',
  theme = 'auto',
  extraLink,
}) => {
  const isLight = theme === 'light';

  const containerClasses = isLight
    ? 'border-t border-slate-200 bg-white/80 text-slate-600 backdrop-blur-xs'
    : theme === 'dark'
    ? 'border-t border-slate-800/80 bg-slate-900/90 text-slate-400 backdrop-blur-xs'
    : 'border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 backdrop-blur-xs';

  const titleClasses = isLight
    ? 'text-slate-800 font-semibold'
    : theme === 'dark'
    ? 'text-slate-200 font-semibold'
    : 'text-slate-700 dark:text-slate-200 font-semibold';

  const linkPhoneClasses = isLight
    ? 'text-slate-700 hover:text-blue-600 font-medium transition-colors'
    : theme === 'dark'
    ? 'text-slate-300 hover:text-blue-400 font-medium transition-colors'
    : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors';

  const subClasses = isLight
    ? 'text-slate-500 text-[11px]'
    : theme === 'dark'
    ? 'text-slate-500 text-[11px]'
    : 'text-slate-500 dark:text-slate-500 text-[11px]';

  return (
    <footer
      id="system-footer"
      className={`w-full py-4 px-4 sm:px-6 transition-colors ${containerClasses} ${className}`}
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center gap-1.5 text-xs">
        {/* Main Copyright & Author Info */}
        <div className="leading-relaxed">
          <p className="tracking-tight">
            © 2026{' '}
            <span className={titleClasses}>Nguyễn Trường Giang</span>
            {' — '}
            <span className="font-medium">ThS. Toán giải tích</span>
          </p>
          <p className="mt-0.5 text-[11px] opacity-90">
            Lập trình viên · Giáo viên Tin học · Nhóm trưởng chuyên môn Tin học
          </p>
          <p className="mt-0.5 text-[11px] opacity-90">
            Liên hệ:{' '}
            <a
              href="tel:0962576712"
              className={linkPhoneClasses}
              title="Gọi hotline hỗ trợ"
            >
              0962 576 712
            </a>
            {' · '}All rights reserved.
          </p>
        </div>

        {/* Secondary Subtitle */}
        <p className={`${subClasses} italic mt-0.5`}>
          Hệ thống học tập Python &amp; luyện tư duy lập trình phục vụ mục đích giáo dục.
        </p>

        {/* Optional Extra Action/Link (e.g., Teacher Portal link) */}
        {extraLink && <div className="mt-1">{extraLink}</div>}
      </div>
    </footer>
  );
};
