import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useSessionContext } from '@/components/providers/session-provider';
import { joinBill } from '@/lib/supabase/bills';
import { validateOTP } from '@/lib/utils/otp';

const formSchema = z.object({
  otp: z.string()
    .length(4, 'Code must be exactly 4 characters')
    .refine(validateOTP, 'Invalid code format'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
});

type FormData = z.infer<typeof formSchema>;

export function JoinBillForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { createSession } = useSessionContext();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: '',
      name: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const participant = {
        id: crypto.randomUUID(),
        name: data.name,
        tip_percentage: 10,
        subtotal: 0,
      };

      const bill = await joinBill(data.otp, participant);
      createSession(data.name, bill.id);
      router.push(`/bill/${bill.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid code or bill not found.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="otp">Enter 4-Character Code</Label>
        <Input
          id="otp"
          placeholder="ABCD"
          className="bg-white/10 text-center uppercase tracking-widest text-lg"
          maxLength={4}
          {...form.register('otp', {
            onChange: (e) => {
              e.target.value = e.target.value.toUpperCase();
            },
          })}
        />
        {form.formState.errors.otp && (
          <p className="text-sm text-red-500">
            {form.formState.errors.otp.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Your Name</Label>
        <Input
          id="name"
          placeholder="Enter your name"
          className="bg-white/10"
          {...form.register('name')}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? 'Joining...' : 'Join Bill'}
      </Button>
    </form>
  );
}