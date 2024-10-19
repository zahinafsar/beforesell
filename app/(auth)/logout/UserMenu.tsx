import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

function UserMenu() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('currentUser'); // Clear user data from local storage
    router.push('/login'); // Redirect to login page
  };

  return (
    <div className="flex items-center gap-2">
      <p>Customer</p>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
}

export default UserMenu;
