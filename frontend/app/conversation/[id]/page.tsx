import CircleConversation from '@/app/components/CircleConversation';

export default async function Conversation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className='flex flex-col items-center px-4'>
      <h1 className='mt-6 text-2xl font-semibold'>Grupp-konversation</h1>
      <p className='mt-2 text-sm text-muted'>Match-ID: {id}</p>
      <CircleConversation matchId={id} />
    </main>
  );
}
