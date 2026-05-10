import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TeamBalancerLogo } from "../components/team-balancer-logo";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from "../contexts/auth-context";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setApiError("");
    const IP = import.meta.env.VITE_SERVER_IP || "localhost";
    
    try {
      const res = await fetch(`http://${IP}:3000/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query { 
              login(email: "${data.email}", password: "${data.password}") { 
                id 
                email 
                role { 
                  name 
                  permissions { 
                    name 
                  } 
                } 
              } 
            }
          `
        })
      });
      
      const json = await res.json();
      
      if (json.errors) {
        throw new Error(json.errors[0].message);
      }
      
      // Save full user (with role/permissions) to the Auth Context
      login(json.data.login);
      navigate("/matches");
      
    } catch (err: any) {
      setApiError(err.message || "An unexpected error occurred during login.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 flex flex-col items-center pb-8">
          <TeamBalancerLogo iconSize={70} showTagline={false} layout="horizontal" />
          <div className="text-center space-y-2 pt-4">
            <CardTitle className="text-3xl text-[#006895]">Welcome Back</CardTitle>
            <CardDescription className="text-base">Sign in to your TeamBalancer account</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Display GraphQL Backend Errors Here */}
            {apiError && (
              <div className="p-3 text-sm text-red-600 bg-red-100 rounded-md border border-red-200">
                {apiError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={`bg-input-background border-border focus:ring-2 focus:ring-[#006895] ${errors.email ? "border-red-500" : ""}`}
                {...register("email")}
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-4">
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#006895] hover:bg-[#005177] text-white py-6 transition-all duration-300"
                size="lg"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
              <button
                type="button"
                className="text-sm text-[#0799ba] hover:text-[#006895] transition-colors w-full text-center"
                onClick={() => alert("Password reset functionality would be implemented here")}
              >
                Forgot your password?
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground mb-3">Don't have an account?</p>
            <Button
              variant="outline"
              className="w-full border-2 border-[#0799ba] text-[#0799ba] hover:bg-[#0799ba]/10 transition-all duration-300"
              onClick={() => navigate("/register")}
            >
              Create Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}