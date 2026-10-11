import LoginForm from '@/app/components/LoginForm';

export default async function LogInPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; expired?: string }>;
}) {
  const { registered, expired } = await searchParams;
  const notice = registered
    ? 'Kontot har skapats. Logga in för att fortsätta.'
    : expired
      ? 'Din session har gått ut. Logga in igen.'
      : undefined;

  return (
    <div className='flex flex-1 justify-center max-h-150 bg-background p-4'>
      <LoginForm notice={notice} />
    </div>
  );
}
