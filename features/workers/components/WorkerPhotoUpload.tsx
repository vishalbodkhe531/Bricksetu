"use client";

import React, { useState, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkerPhotoUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
}

export function WorkerPhotoUpload({ value, onChange }: WorkerPhotoUploadProps) {
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Photo file size must be less than 5MB");
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      setPreviewPhoto(objectUrl);
      onChange(objectUrl);

      // NOTE: Cloudinary upload hook will be invoked here upon Cloudinary setup:
      // const uploadedUrl = await uploadToCloudinary(file);
      // onChange(uploadedUrl);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewPhoto(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5 md:col-span-1">
      <label className="text-xs font-semibold text-foreground flex items-center gap-1">
        <Camera className="h-3 w-3 text-muted-foreground" /> Worker Photo
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoSelect}
        className="hidden"
      />

      {previewPhoto ? (
        <div className="relative flex items-center gap-3 p-2.5 rounded-lg border border-border bg-muted/20">
          <div className="relative h-12 w-12 rounded-full overflow-hidden border border-border shrink-0">
            <img
              src={previewPhoto}
              alt="Worker Preview"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              Profile Photo Selected
            </p>
            <p className="text-[11px] text-muted-foreground">Ready for save</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemovePhoto}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-3 rounded-lg border border-dashed border-border hover:border-primary bg-muted/10 hover:bg-primary/5 transition-colors cursor-pointer text-center group"
        >
          <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mb-1" />
          <span className="text-xs font-semibold text-foreground">Upload Photo</span>
          <span className="text-[10px] text-muted-foreground">
            Click to select image file (Max 5MB)
          </span>
        </div>
      )}
    </div>
  );
}
