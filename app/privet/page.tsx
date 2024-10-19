import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { ReactNode } from 'react';

export default async function PrivatePage({ children }: { children: ReactNode }) {
  const supabase = createClient();

  const { data: { user } = {}, error } = await supabase.auth.getUser();

  if (!user || error) {
    redirect('/login');
  }
  return <main className="flex-grow">{children}</main>;
}
