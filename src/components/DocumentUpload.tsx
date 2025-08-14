import { useState, useCallback } from "react";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  onFileUpload: (file: File, content?: string) => void;
  onRemoveFile: () => void;
  uploadedFile?: File | null;
}

export const DocumentUpload = ({ onFileUpload, onRemoveFile, uploadedFile }: DocumentUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file => 
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'text/plain'
    );
    
    if (validFile) {
      handleFileUpload(validFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (isUploading) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', 'anonymous'); // In real app, use actual user ID

      const { data, error } = await supabase.functions.invoke('upload-file', {
        body: formData
      });

      if (error) throw error;

      onFileUpload(file, data.textContent);
      toast({
        title: "File uploaded successfully!",
        description: `${file.name} is ready for explanation.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Please try again with a different file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.pdf')) return '📄';
    if (filename.endsWith('.docx')) return '📝';
    if (filename.endsWith('.txt')) return '📋';
    return '📄';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!uploadedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
            ${isDragging 
              ? 'border-primary bg-primary/5 scale-102' 
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
            }
          `}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-secondary flex items-center justify-center">
              <Upload className="w-8 h-8 text-secondary-foreground" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Upload a document to explain
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Drag & drop or click to upload PDF, DOCX, or TXT files
              </p>
            </div>
            
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload">
            <Button 
                type="button"
                variant="outline"
                className="cursor-pointer hover-lift"
                disabled={isUploading}
                asChild
              >
                <span>
                  <FileText className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Choose File'}
                </span>
              </Button>
            </label>
            
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">📄 PDF</span>
              <span className="flex items-center gap-1">📝 DOCX</span>
              <span className="flex items-center gap-1">📋 TXT</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-2xl p-6 shadow-elevated">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getFileIcon(uploadedFile.name)}</span>
              <div>
                <h4 className="font-semibold text-foreground">{uploadedFile.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {Math.round(uploadedFile.size / 1024)} KB
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRemoveFile}
              className="hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};