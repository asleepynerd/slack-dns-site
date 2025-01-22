const handleUpload = async () => {
  if (!selectedFile) return;

  setUploading(true);
  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("/api/cdn/files/upload/proxy", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 409) {
        // File already exists
        toast({
          title: "File already exists",
          description: data.message,
          variant: "warning",
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

      throw new Error(data.message || "Upload failed");
    }

    onSuccess?.(data);
    onClose();
  } catch (error) {
    console.error("Upload error:", error);
    toast({
      title: "Upload failed",
      description: error instanceof Error ? error.message : "Please try again",
      variant: "destructive",
    });
  } finally {
    setUploading(false);
  }
};
