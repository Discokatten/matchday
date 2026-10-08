import type { ReactNode } from 'react';

type WrapperProps = {
  children: ReactNode;
  footer?: ReactNode;
};

export default function Wrapper({ children, footer }: WrapperProps) {
  return (
    <div className='m-4 grid w-full max-w-sm gap-4 rounded-2xl border border-primary-dark/15 bg-surface p-4 shadow-md shadow-primary-dark/10'>
      {children}
      {footer && (
        <div className='border-t border-muted/30 pt-4 text-center text-sm text-muted'>
          {footer}
        </div>
      )}
    </div>
  );
}
