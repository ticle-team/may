import { createClient, User } from '@shaple/shaple';

export const shaple = createClient(
  process.env.NEXT_PUBLIC_SHAPLE_URL!,
  process.env.NEXT_PUBLIC_SHAPLE_ANON_KEY!,
);

export async function createUser() {
  await shaple.auth.signUp({
    email: 'test@test.com',
    password: 'qwer1234',
  });
  const {
    data: { user, session },
    error,
  } = await shaple.auth.signInWithPassword({
    email: 'test@test.com',
    password: 'qwer1234',
  });
  expect(error).toBeNull();
  expect(user).not.toBeNull();
  expect(session).not.toBeNull();

  return user!;
}

export async function deleteUser(user: User) {
  const { error } = await shaple.auth.signOut();
  expect(error).toBeNull();
  {
    const shaple = createClient(
      process.env.NEXT_PUBLIC_SHAPLE_URL!,
      process.env.SHAPLE_ADMIN_KEY!,
    );

    const { error } = await shaple.auth.admin.deleteUser(user.id, false);
    expect(error).toBeNull();
  }
}
