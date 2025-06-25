
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuthForm } from '@/hooks/useAuthForm';
import { AuthFormFields } from './auth/AuthFormFields';
import { AuthModeSelector } from './auth/AuthModeSelector';
import { getTitle, getDescription, getSubmitText } from './auth/authUtils';

export const AuthForm = () => {
  const {
    mode,
    setMode,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    fullName,
    setFullName,
    loading,
    handleSubmit,
  } = useAuthForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            {mode === 'reset' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('login')}
                className="absolute left-4 top-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {getTitle(mode)}
          </CardTitle>
          <CardDescription>
            {getDescription(mode)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthFormFields
              mode={mode}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              fullName={fullName}
              setFullName={setFullName}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {getSubmitText(mode)}
            </Button>
          </form>
          
          <AuthModeSelector mode={mode} setMode={setMode} />
        </CardContent>
      </Card>
    </div>
  );
};
