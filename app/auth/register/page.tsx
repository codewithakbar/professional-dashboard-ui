import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Register - CCTV Dashboard',
  description: 'Create a new account for CCTV monitoring dashboard'
};

export default function RegisterPage() {
  return <RegisterForm />;
}
