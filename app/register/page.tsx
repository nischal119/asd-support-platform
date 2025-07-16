"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Heart, User, Stethoscope } from "lucide-react";
import { api } from "@/lib/api";
import { setStoredUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const role = searchParams.get("role");
    if (role === "doctor" || role === "user") {
      setActiveTab(role);
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    specialization: "",
    license_number: "",
    phone: "",
  });

  const validateForm = (role: "user" | "doctor") => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    if (role === "doctor") {
      if (!formData.specialization.trim()) {
        newErrors.specialization = "Specialization is required";
      }
      if (!formData.license_number.trim()) {
        newErrors.license_number = "License number is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, role: "user" | "doctor") => {
    e.preventDefault();

    if (!validateForm(role)) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await api.register(formData, role);
      console.log("Register API response:", response);
      if ((response as any)?.token && (response as any)?.role) {
        const { token, role: userRole } = response as {
          token: string;
          role: string;
        };
        const userObj = {
          id: "",
          name: formData.name,
          email: formData.email,
          role: userRole as "user" | "doctor" | "admin",
        };
        setStoredUser(userObj, token);
        console.log("Stored user:", userObj);
        console.log("Stored token:", token);
        toast({
          title: "Registration successful!",
          description: `Welcome to ASD Support Platform, ${formData.name}! Please log in to continue.`,
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        console.log("No token/role in register response:", response);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description:
          error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join ASD Support
            </h1>
            <p className="text-gray-600">Create your account to get started</p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Register</CardTitle>
              <CardDescription className="text-center">
                Choose your account type to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="user" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Patient
                  </TabsTrigger>
                  <TabsTrigger
                    value="doctor"
                    className="flex items-center gap-2"
                  >
                    <Stethoscope className="h-4 w-4" />
                    Doctor
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="user">
                  <form
                    onSubmit={(e) => handleSubmit(e, "user")}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="user-name">Full Name</Label>
                      <Input
                        id="user-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className={errors.name ? "border-red-500" : ""}
                        aria-describedby={
                          errors.name ? "name-error" : undefined
                        }
                      />
                      {errors.name && (
                        <p
                          id="name-error"
                          className="text-sm text-red-600"
                          role="alert"
                        >
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="user-email">Email Address</Label>
                      <Input
                        id="user-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={errors.email ? "border-red-500" : ""}
                        aria-describedby={
                          errors.email ? "email-error" : undefined
                        }
                      />
                      {errors.email && (
                        <p
                          id="email-error"
                          className="text-sm text-red-600"
                          role="alert"
                        >
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="user-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="user-password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          className={
                            errors.password ? "border-red-500 pr-10" : "pr-10"
                          }
                          aria-describedby={
                            errors.password ? "password-error" : undefined
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p
                          id="password-error"
                          className="text-sm text-red-600"
                          role="alert"
                        >
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="user-confirm-password">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="user-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.password_confirmation}
                          onChange={(e) =>
                            handleInputChange(
                              "password_confirmation",
                              e.target.value
                            )
                          }
                          className={
                            errors.password_confirmation
                              ? "border-red-500 pr-10"
                              : "pr-10"
                          }
                          aria-describedby={
                            errors.password_confirmation
                              ? "confirm-password-error"
                              : undefined
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.password_confirmation && (
                        <p
                          id="confirm-password-error"
                          className="text-sm text-red-600"
                          role="alert"
                        >
                          {errors.password_confirmation}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? "Creating Account..."
                        : "Create Patient Account"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="doctor">
                  <form
                    onSubmit={(e) => handleSubmit(e, "doctor")}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="doctor-name">Full Name</Label>
                      <Input
                        id="doctor-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className={errors.name ? "border-red-500" : ""}
                        aria-describedby={
                          errors.name ? "name-error" : undefined
                        }
                      />
                      {errors.name && (
                        <p
                          id="name-error"
                          className="text-sm text-red-600"
                          role="alert"
                        >
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doctor-email">Email Address</Label>
                      <Input
                        id="doctor-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={errors.email ? "border-red-500" : ""}
                        aria-describedby={
                          errors.email ? "email-error" : undefined
                        }
                      />
                      {errors.email && (
                        <p
                          id="email-error"
                          className="text-sm text-red-600"
                          role="alert"
                        >
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        type="text"
                        placeholder="e.g., Autism Spectrum Disorders, Developmental Pediatrics"
                        value={formData.specialization}
                        onChange={(e) =>
                          handleInputChange("specialization", e.target.value)
                        }
                        className={
                          errors.specialization ? "border-red-500" : ""
                        }
                        aria-describedby={
                          errors.specialization
                            ? "specialization-error"
                            : undefined
                        }
                      />
                      {errors.specialization && (
                        <p
                          id="specialization-error"
                          className="text-sm text-red-600"
                          role="alert"
                        >
                          {errors.specialization}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="license-number">
                        Medical License Number
                      </Label>
                      <Input
                        id="license-number"
                        type="text"
                        value={formData.license_number}
                        onChange={(e) =>
                          handleInputChange("license_number", e.target.value)
                        }
                        className={
                          errors.license_number ? "border-red-500" : ""
                        }
                        aria-describedby={
                          errors.license_number ? "license-error" : undefined
                        }
                      />
                      {errors.license_number && (
                        <p
                          id="license-error"
                          className="text-sm text-red-600"
                          role="alert"
                        >
                          {errors.license_number}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doctor-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="doctor-password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          className={
                            errors.password ? "border-red-500 pr-10" : "pr-10"
                          }
                          aria-describedby={
                            errors.password ? "password-error" : undefined
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p
                          id="password-error"
                          className="text-sm text-red-600"
                          role="alert"
                        >
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doctor-confirm-password">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="doctor-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.password_confirmation}
                          onChange={(e) =>
                            handleInputChange(
                              "password_confirmation",
                              e.target.value
                            )
                          }
                          className={
                            errors.password_confirmation
                              ? "border-red-500 pr-10"
                              : "pr-10"
                          }
                          aria-describedby={
                            errors.password_confirmation
                              ? "confirm-password-error"
                              : undefined
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.password_confirmation && (
                        <p
                          id="confirm-password-error"
                          className="text-sm text-red-600"
                          role="alert"
                        >
                          {errors.password_confirmation}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? "Creating Account..."
                        : "Create Doctor Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
