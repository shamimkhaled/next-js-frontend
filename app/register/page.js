// app/register/page.js
import { Suspense } from 'react';
import SignUpForm from './SignUpForm';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900/20">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-lg">
          <Suspense fallback={
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8">
              <div className="animate-pulse">
                <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg w-3/4 mx-auto mb-8"></div>
                <div className="space-y-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                      <div className="h-12 bg-gray-200 dark:bg-gray-600 rounded-xl"></div>
                    </div>
                  ))}
                  <div className="h-14 bg-gradient-to-r from-orange-200 to-orange-300 dark:from-orange-700 dark:to-orange-800 rounded-xl"></div>
                </div>
              </div>
            </div>
          }>
            <SignUpForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}