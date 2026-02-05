"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Camera, Save, User, Phone } from "lucide-react";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { user, isLoading: authLoading, refetch } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [initialized, setInitialized] = useState(false);

  if (authLoading) {
    return (
      <div className="container px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push("/login?redirect=/dashboard/settings");
    return null;
  }

  if (!initialized) {
    setName(user.name);
    setPhone(user.phone || "");
    setInitialized(true);
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select an image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image must be less than 5MB" });
      return;
    }

    setIsUploadingAvatar(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        await refetch();
        setMessage({ type: "success", text: "Avatar updated successfully" });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to upload avatar" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to upload avatar" });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.length < 2) {
      setMessage({ type: "error", text: "Name must be at least 2 characters" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await api("user/profile", {
        method: "PUT",
        body: { name, phone: phone || null } as { name?: string; phone?: string | null },
      });

      if (res.ok) {
        await refetch();
        setMessage({ type: "success", text: "Profile updated successfully" });
      } else {
        const data = await res.json() as { error?: string };
        setMessage({ type: "error", text: data.error || "Failed to update profile" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

      {message && (
        <div
          className={`p-4 rounded-md mb-6 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Click on the avatar to upload a new photo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar
                  className="h-24 w-24 cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-primary transition-all"
                  onClick={handleAvatarClick}
                >
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="text-2xl">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Recommended: Square image</p>
                <p>Max size: 5MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="pl-10"
                    required
                    minLength={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Visible to buyers on your listings
                </p>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Verification</p>
                <p className="text-sm text-muted-foreground">
                  {user.verified
                    ? "Your email has been verified"
                    : "Please verify your email to unlock all features"}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.verified
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {user.verified ? "Verified" : "Unverified"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
