/* eslint-disable prettier/prettier */
'use server';

import { createClient } from '@/utils/supabase/server';

export async function login({ email, password }: { email: string; password: string }) {
    const supabase = createClient();

    const { error, data: { user, session } } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return { success: false, error: error.message };
    }

    if (session) {
        return { success: true, user };
    }
}
