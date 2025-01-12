import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { options } from '../api/auth/[...nextauth]/options';
import { DomainList } from '@/components/domains/domain-list';

export default async function DashboardPage() {
  const session = await getServerSession(options);

  if (!session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Your Domains</h1>
          <p className="text-zinc-600">Manage your subdomains and DNS records</p>
        </div>
        <DomainList />
      </div>
    </div>
  );
}