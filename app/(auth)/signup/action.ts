/* eslint-disable prettier/prettier */
'use server';

import { PrismaClient, User } from "@prisma/client";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';

export async function signup({ email, password, username }: { email: string; password: string, username: string }) {
    const prisma = new PrismaClient()
    const supabase = createClient();

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: email,
        password: password,
    };

    const { error, data: userData } = await supabase.auth.signUp(data);


    if (error) {
        redirect('/');
    }
    if (userData.user?.email) {
        const user = {
            email: userData.user.email,
            password: data.password,
            username: username
        }
        const UserCreate = async (userData: {
            email: string;
            password: string;
            username: string;
        }) => {
            console.log(userData)
            const create = await prisma.user.create({
                data: {
                    email: userData.email,
                    username: userData.username,
                    password: userData.password,
                }
            })
            return create
        }
        UserCreate(user)
    }

    revalidatePath('/login', 'layout');
    redirect('/login');
}
