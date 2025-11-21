'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { AuthError, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { useState } from 'react';

const signupSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  displayName: z.string().min(1, 'Display name is required.'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      displayName: '',
    },
  });

  const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
    setFirebaseError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Create user profile in Firestore
      const userRef = doc(firestore, 'users', user.uid);
      const userProfile = {
        email: user.email,
        displayName: data.displayName,
        createdAt: new Date().toISOString(),
      };
      setDocumentNonBlocking(userRef, userProfile, { merge: true });

      toast({
        title: 'Signup Successful',
        description: 'Your account has been created.',
      });
      router.push('/');
    } catch (error) {
       const authError = error as AuthError;
        let errorMessage = 'An unexpected error occurred.';
        switch (authError.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already in use. Please try another.';
                break;
            case 'auth/weak-password':
                errorMessage = 'The password is too weak.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            default:
                errorMessage = 'Signup failed. Please try again.';
                break;
        }
       setFirebaseError(errorMessage);
       toast({
        title: 'Signup Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-headline flex items-center justify-center">
                <UserPlus className="mr-2" /> Create an Account
              </CardTitle>
              <CardDescription>
                Join to start creating your own auctions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {firebaseError && (
                 <p className="text-center text-sm font-medium text-destructive">{firebaseError}</p>
              )}
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
               <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
               <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Log In
                </Link>
                </p>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}
