import { Auth } from '@/components/Auth';

async function CreateAccount({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo: string | undefined }>;
}) {
  const { redirectTo } = await searchParams;

  return <Auth createAccount redirectTo={redirectTo || ''} />;
}

export default CreateAccount;
