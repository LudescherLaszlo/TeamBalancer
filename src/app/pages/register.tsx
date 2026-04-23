import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TeamBalancerLogo } from "../components/team-balancer-logo";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

// 1. Define the validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // Puts the error message on the confirm field
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  
  // 2. Initialize React Hook Form with the Zod resolver
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange", // Validates as the user types!
  });

  // 3. The submit handler (only runs if validation passes)
  const onSubmit = (data: RegisterFormValues) => {
    console.log("Valid data ready to send:", data);
    // Here is where you would normally call your auth context/API
    navigate("/matches");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-8 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 flex flex-col items-center pb-8">
          <div className="scale-75 sm:scale-100">
            <TeamBalancerLogo iconSize={70} showTagline={false} layout="horizontal" />
          </div>
          
          <div className="text-center space-y-2 pt-4">
            <CardTitle className="text-2xl sm:text-3xl text-[#006895]">Join TeamBalancer</CardTitle>
            <CardDescription className="text-sm sm:text-base">Create your account to start balancing teams</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                className={`bg-input-background border-border focus:ring-2 focus:ring-[#006895] ${errors.name ? "border-red-500" : ""}`}
                {...register("name")}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={`bg-input-background border-border focus:ring-2 focus:ring-[#006895] ${errors.email ? "border-red-500" : ""}`}
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`bg-input-background border-border focus:ring-2 focus:ring-[#006895] ${errors.password ? "border-red-500" : ""}`}
                {...register("password")}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className={`bg-input-background border-border focus:ring-2 focus:ring-[#006895] ${errors.confirmPassword ? "border-red-500" : ""}`}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#006895] hover:bg-[#005177] text-white py-6 mt-6 transition-all duration-300"
              size="lg"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground mb-3">Already have an account?</p>
            <Button
              variant="outline"
              className="w-full border-2 border-[#0799ba] text-[#0799ba] hover:bg-[#0799ba]/10 transition-all duration-300"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}