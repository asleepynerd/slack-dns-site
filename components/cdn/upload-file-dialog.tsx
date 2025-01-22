"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

interface UploadFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUploaded: () => void;
}

export function UploadFileDialog({
  open,
  onOpenChange,
  onFileUploaded,
}: UploadFileDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customPath, setCustomPath] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCustomPath(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // First get a presigned URL
      const response = await fetch("/api/cdn/files/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: customPath || selectedFile.name,
          contentType: selectedFile.type,
          size: selectedFile.size,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast({
            title: "File already exists",
            description: data.message,
            variant: "default",
          });
          return;
        }

        if (response.status === 413) {
          toast({
            title: "File too large",
            description: data.message,
            variant: "destructive",
          });
          return;
        }

        if (response.status === 415) {
          toast({
            title: "Invalid file type",
            description: data.message,
            variant: "destructive",
          });
          return;
        }

        throw new Error(data.message || "Failed to get upload URL");
      }

      // Upload directly to R2 using the presigned URL
      const uploadResponse = await fetch(data.uploadUrl, {
        method: "PUT",
        body: selectedFile,
        headers: {
          "Content-Type": selectedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      onFileUploaded();
      onOpenChange(false);
      setSelectedFile(null);
      setCustomPath("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>Upload a file to cdn.hack.pet</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="path">Custom Path (optional)</Label>
            <Input
              id="path"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
              placeholder="folder/filename.ext"
            />
            <p className="text-sm text-zinc-400">
              Leave empty to use original filename
            </p>
          </div>

          <Button
            type="submit"
            disabled={isUploading || !selectedFile}
            className="w-full"
          >
            {isUploading ? (
              "Uploading..."
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
