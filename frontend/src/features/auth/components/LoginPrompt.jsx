import { useNavigate } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { cardClass, btnPrimary } from '@/utils/theme';

export default function LoginPrompt({ title = 'Login Required', message = 'You need to login to view this page.' }) {
  const navigate = useNavigate();

  return (
    <div className="flex h-[60vh] items-center justify-center px-4">
      <div className={`${cardClass} flex max-w-sm w-full flex-col items-center gap-5 p-10 text-center`}>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
          <LockKeyhole className="h-8 w-8 text-brand-400" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">{message}</p>
        </div>

        <div className="flex w-full flex-col gap-2.5 pt-1">
          <button
            onClick={() => navigate('/login')}
            className={`${btnPrimary} w-full`}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
