interface MessageProps {
  username: string;
  date: string;
  message: string;
}

export default function DisplayMessage({
  username,
  date,
  message,
}: MessageProps) {
  return (
    <div className='mt-3 border-b border-muted/30 p-2 text-sm'>
      <div className='mb-1 flex justify-between'>
        <span>{username}</span>
        <time className='text-muted'>{date}</time>
      </div>
      <p>{message}</p>
    </div>
  );
}
