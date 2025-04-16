
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Users, Check, RefreshCw, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { registerTeacher } from '@/utils/web3Utils';
import { BlockchainModeContext } from './Header';

const formSchema = z.object({
  walletAddress: z.string()
    .min(42, { message: "Wallet address is required and must be valid" })
    .regex(/^0x[a-fA-F0-9]{40}$/, { message: "Must be a valid Ethereum address" }),
  teacherName: z.string().min(2, { message: "Teacher name is required" }),
  department: z.string().optional(),
  email: z.string().email({ message: "Must be a valid email" }).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

const TeacherRegistration: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const { isRealBlockchainMode } = React.useContext(BlockchainModeContext);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      walletAddress: '',
      teacherName: '',
      department: '',
      email: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsRegistering(true);
    setSuccessMessage(null);

    try {
      const result = await registerTeacher(data.walletAddress, data.teacherName);

      if (result.success) {
        setSuccessMessage(`Teacher ${data.teacherName} registered successfully`);
        toast({
          title: "Teacher Registered",
          description: isRealBlockchainMode 
            ? "Teacher has been registered on the blockchain" 
            : "Teacher has been registered in testing mode",
          variant: "default",
        });
        form.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: result.message || "Failed to register teacher",
        });
      }
    } catch (error) {
      console.error("Error registering teacher:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5 text-primary" />
            Register New Teacher
          </CardTitle>
          <CardDescription>
            Register a teacher to allow them to upload student results to the {isRealBlockchainMode ? 'blockchain' : 'testing environment'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="walletAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wallet Address</FormLabel>
                    <FormControl>
                      <Input placeholder="0x..." {...field} />
                    </FormControl>
                    <FormDescription>
                      The Ethereum wallet address of the teacher
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="teacherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Computer Science" {...field} />
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
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="teacher@school.edu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button
                type="submit"
                disabled={isRegistering}
                className="w-full md:w-auto"
              >
                {isRegistering ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Register Teacher
                  </>
                )}
              </Button>
            </form>
          </Form>
          
          {successMessage && (
            <div className="mt-6 p-4 bg-green-50 text-green-800 rounded-md flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-600" />
              <p>{successMessage}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/20 border-t text-xs text-muted-foreground">
          <p>
            {isRealBlockchainMode 
              ? 'Teachers will be registered on the Sepolia testnet blockchain' 
              : 'This is running in test mode. No actual blockchain transactions will occur.'}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TeacherRegistration;
