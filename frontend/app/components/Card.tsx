import Link from 'next/link';
import Wrapper from '@/app/components/Wrapper';

interface CardProps {
  round: number;
  team1: string;
  team2: string;
  id: string;
  date: string;
  isAuthenticated?: boolean;
  hasConversation?: boolean;
}
export default function Card({
  round,
  team1,
  team2,
  id,
  date,
  isAuthenticated = false,
  hasConversation = false,
}: CardProps) {
  return (
    <div className='flex flex-row'>
      <Wrapper>
        <div className='text-sm flex flex-row justify-between'>
          <p>Omgång {round}</p>
          <p>{date}</p>
        </div>
        <p>
          {team1} vs {team2}
        </p>
      </Wrapper>
    </div>
  );
}
