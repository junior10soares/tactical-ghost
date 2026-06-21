import TacticalBoard from '@/components/TacticalBoard';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Tactical Ghost ⚽</h1>
      <TacticalBoard initialTeam="brasil" />
    </main>
  );
}
