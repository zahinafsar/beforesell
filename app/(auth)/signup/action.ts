/* eslint-disable prettier/prettier */
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';

export async function signup({ email, password }: { email: string; password: string }) {
    console.log(email, password)
    const supabase = createClient();

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: email,
        password: password,
    };

    const { error } = await supabase.auth.signUp(data);
    console.log(error?.message)

    if (error) {
        redirect('/');
    }

    revalidatePath('/login', 'layout');
    redirect('/login');
}
