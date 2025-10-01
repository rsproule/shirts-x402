import { CreateShirtForm } from "./_components/create-shirt-form";

export default async function Home() {
  return (
    <div className="relative">
      {/* Wallet Connect - Fixed top right */}
      <CreateShirtForm />
    </div>
  );
}
