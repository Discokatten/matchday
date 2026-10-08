import Link from 'next/link';
import LogoutButton from './LogoutButton';
import Wrapper from './Wrapper';

const brandLinkClass =
  'border-b border-primary-dark/20 px-6 py-6 transition-opacity hover:opacity-90';

export default function Header({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  return (
    <header className='mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5'>
      <Link href='/' className={brandLinkClass}>
        <h1 className='text-center text-4xl font-bold tracking-tight text-primary-dark sm:text-5xl'>
          Matchday
        </h1>
      </Link>

      <div className='w-full max-w-[12rem] text-center opacity-80'>
        <Wrapper>
          {isAuthenticated ? (
            <div className='flex flex-col items-center gap-2'>
              <Link href='/dashboard' className='hover:text-primary'>Matcher</Link>
              <LogoutButton />
            </div>
          ) : (
            <Link href='/login' className='hover:text-primary'>
              Logga in
            </Link>
          )}
        </Wrapper>
      </div>
    </header>
  );
}
