import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/auth-context.ts';
import { Button } from '../../components/common/Button.tsx';
import { Input } from '../../components/common/Input.tsx';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import type { ApiError } from '../../types/api.types.ts';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.code === 'INVALID_CREDENTIALS') {
        setError('Invalid email or password. Please verify your credentials.');
      } else if (apiErr.code === 'ACCOUNT_DEACTIVATED') {
        setError('This administrative account has been deactivated.');
      } else if (apiErr.code === 'TOO_MANY_REQUESTS') {
        setError('Too many failed login attempts. Please wait 15 minutes.');
      } else {
        setError(apiErr.message || 'An error occurred during authentication.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#F8F6F0]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Heritage Emblem */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#315B3B] flex items-center justify-center font-serif text-white font-bold text-xl shadow-md border-2 border-[#D9C6A5]">
            ED
          </div>
        </div>

        <h1 className="mt-4 text-center text-2xl font-bold font-serif text-[#24231F] tracking-tight">
          Explore Dhandusar
        </h1>
        <p className="mt-1 text-center text-xs text-[#5C5850] tracking-wide uppercase">
          Administrative Publishing Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl shadow-sm border border-[#D9C6A5]/50">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@dhandhusar.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer text-[#5C5850] hover:text-[#24231F]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-semibold"
              isLoading={isSubmitting}
            >
              Sign In to Dashboard
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#D9C6A5]/30 text-center">
            <p className="text-[11px] text-[#5C5850] leading-relaxed">
              Authorized personnel only. Public registration is strictly disabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
