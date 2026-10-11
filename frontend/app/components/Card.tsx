import Wrapper from '@/app/components/Wrapper';

interface CardProps {
  round: number;
  homeTeamName: string;
  awayTeamName: string;
  date: string;
}

export default function Card({
  round,
  homeTeamName,
  awayTeamName,
  date,
}: CardProps) {
  return (
    <div className='flex flex-row'>
      <Wrapper>
        <div className='flex flex-row justify-between gap-3 text-sm'>
          <p>Omgång {round}</p>
          <time>{date}</time>
        </div>
        <p>
          {homeTeamName} vs {awayTeamName}
        </p>
      </Wrapper>
    </div>
  );
}
