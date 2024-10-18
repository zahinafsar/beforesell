import { db } from '@/db';
import { usersTable } from '@/db/schema';
import React from 'react';

export default async function page() {
  //   const user = {
  //     name: 'John Doe',
  //     age: 30,
  //     email: 'john.doe@example.com',
  //   };
  //   const result = await db.insert(usersTable).values(user);

  const getData = await db.select().from(usersTable);
  return <pre>{JSON.stringify(getData, null, 2)}</pre>;
}
