"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadFileDialog } from "./upload-file-dialog";
import { toast } from "@/hooks/use-toast";
import { Copy, ExternalLink, Trash2, Eye, HardDrive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CDNFile {
  key: string;
  displayKey: string;
  size: number;
  lastModified: string;
  url: string;
  contentType: string;
  views: number;
  bandwidth: number;
  extension: string;
  lastViewed?: string;
}

interface StorageStats {
  totalSize: number;
  totalBandwidth: number;
  fileCount: number;
}

export function CDNFileList() {
  const [files, setFiles] = useState<CDNFile[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const [filesResponse, statsResponse] = await Promise.all([
        fetch("/api/cdn/files"),
        fetch("/api/cdn/stats"),
      ]);

      if (!filesResponse.ok || !statsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const filesData = await filesResponse.json();
      const statsData = await statsResponse.json();

      setFiles(filesData);
      setStats(statsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast({
      title: "Copied",
      description: "File URL copied to clipboard",
    });
  };

  const deleteFile = async (key: string) => {
    try {
      const response = await fetch(
        `/api/cdn/files/${encodeURIComponent(key)}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete file");

      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      fetchFiles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (isLoading) {
    return <div className="text-center mt-8">Loading files...</div>;
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50">
            <div className="text-sm text-zinc-400">Total Storage Used</div>
            <div className="text-2xl font-bold text-white mt-1">
              {formatFileSize(stats.totalSize)}
            </div>
          </div>
          <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50">
            <div className="text-sm text-zinc-400">Total Bandwidth Used</div>
            <div className="text-2xl font-bold text-white mt-1">
              {formatFileSize(stats.totalBandwidth)}
            </div>
          </div>
          <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50">
            <div className="text-sm text-zinc-400">Total Files</div>
            <div className="text-2xl font-bold text-white mt-1">
              {stats.fileCount}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          Upload New File
        </Button>
      </div>

      <div className="space-y-4">
        {files.map((file) => (
          <div
            key={file.key}
            className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-zinc-100">
                  {file.displayKey}
                </div>
                <div className="text-sm text-zinc-500 mt-2 space-y-1">
                  <div>
                    {formatFileSize(file.size)} • {file.contentType} •{" "}
                    {file.extension?.toUpperCase() ||
                      file.contentType.split("/")[1]?.toUpperCase() ||
                      "FILE"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {file.views.toLocaleString()} views •{" "}
                    {formatFileSize(file.bandwidth)} transferred
                  </div>
                  <div>
                    Last viewed:{" "}
                    {file.lastViewed
                      ? new Date(file.lastViewed).toLocaleString()
                      : "Never"}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(file.url)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteFile(file.key)}
                  className="text-red-500 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <UploadFileDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onFileUploaded={fetchFiles}
      />
    </div>
  );
}
