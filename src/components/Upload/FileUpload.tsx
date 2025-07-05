import React, { useState, useRef, useCallback } from "react";
import {
  HiMiniArrowUpTray as Upload,
  HiMiniXMark as X,
  HiMiniPhoto as Image,
  HiMiniDocumentText as FileText,
  HiMiniVideoCamera as Video,
  HiMiniExclamationCircle as AlertCircle,
  HiMiniCheckCircle as CheckCircle,
  HiMiniArrowPath as Loader,
  HiMiniCamera as Camera,
  HiMiniMusicalNote as Music
} from "react-icons/hi2";

interface FileUploadProps {
  type?: "image" | "document" | "media";
  accept?: string;
  maxSize?: number; // en MB
  multiple?: boolean;
  onFileUploaded?: (urls: string[]) => void;
  onError?: (error: string) => void;
  className?: string;
  placeholder?: string;
  preview?: boolean;
}

interface UploadedFile {
  file: File;
  url?: string;
  status: "uploading" | "success" | "error";
  error?: string;
  progress?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  type = "image",
  accept,
  maxSize = 5,
  multiple = false,
  onFileUploaded,
  onError,
  className = "",
  placeholder,
  preview = true,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuration par type avec palette patrimoine
  const getConfig = () => {
    switch (type) {
      case "image":
        return {
          endpoint: "/api/upload/image",
          accept: accept || "image/*",
          icon: Image,
          placeholder: placeholder || "Glissez vos images ici ou cliquez pour sélectionner",
          allowedTypes: [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp"
          ],
          color: "patrimoine-emeraude",
          bgColor: "bg-patrimoine-emeraude/10"
        };
      case "document":
        return {
          endpoint: "/api/upload/document",
          accept: accept || ".pdf,.doc,.docx,.txt",
          icon: FileText,
          placeholder: placeholder || "Glissez vos documents ici ou cliquez pour sélectionner",
          allowedTypes: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
          ],
          color: "patrimoine-or",
          bgColor: "bg-patrimoine-or/10"
        };
      case "media":
        return {
          endpoint: "/api/upload/media",
          accept: accept || "image/*,video/*,audio/*",
          icon: Video,
          placeholder: placeholder || "Glissez vos fichiers média ici ou cliquez pour sélectionner",
          allowedTypes: ["image/*", "video/*", "audio/*"],
          color: "patrimoine-canard",
          bgColor: "bg-patrimoine-canard/10"
        };
      default:
        return {
          endpoint: "/api/upload/image",
          accept: "image/*",
          icon: Image,
          placeholder: "Glissez vos fichiers ici ou cliquez pour sélectionner",
          allowedTypes: ["image/*"],
          color: "patrimoine-emeraude",
          bgColor: "bg-patrimoine-emeraude/10"
        };
    }
  };

  const config = getConfig();

  // Validation du fichier
  const validateFile = (file: File): string | null => {
    // Vérifier la taille
    if (file.size > maxSize * 1024 * 1024) {
      return `Le fichier "${file.name}" est trop volumineux (max: ${maxSize}MB)`;
    }

    // Vérifier le type
    const isAllowed = config.allowedTypes.some((allowedType) => {
      if (allowedType.endsWith("/*")) {
        return file.type.startsWith(allowedType.replace("/*", ""));
      }
      return file.type === allowedType;
    });

    if (!isAllowed) {
      return `Type de fichier non autorisé pour "${file.name}"`;
    }

    return null;
  };

  // Simulation d'upload (remplacez par votre vraie API)
  const uploadFile = async (file: File): Promise<string> => {
    // Simulation d'un délai d'upload
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulation d'une chance d'erreur (pour les tests)
    if (Math.random() < 0.1) {
      throw new Error('Erreur simulée d\'upload');
    }
    
    // Retourner une URL simulée (remplacez par votre vraie logique)
    return URL.createObjectURL(file);
  };

  // Traitement des fichiers sélectionnés
  const handleFiles = useCallback(
    async (selectedFiles: FileList) => {
      const newFiles: UploadedFile[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const validationError = validateFile(file);

        if (validationError) {
          newFiles.push({
            file,
            status: "error",
            error: validationError
          });
          onError?.(validationError);
          continue;
        }

        newFiles.push({
          file,
          status: "uploading",
          progress: 0
        });
      }

      // Si pas multiple, remplacer les fichiers existants
      if (!multiple) {
        setFiles(newFiles);
      } else {
        setFiles((prev) => [...prev, ...newFiles]);
      }

      // Upload des fichiers valides
      const uploadPromises = newFiles
        .filter((f) => f.status === "uploading")
        .map(async (fileObj) => {
          try {
            // Simulation de progression
            const progressInterval = setInterval(() => {
              setFiles((prev) =>
                prev.map((f) =>
                  f.file === fileObj.file
                    ? { ...f, progress: Math.min((f.progress || 0) + 10, 90) }
                    : f
                )
              );
            }, 200);

            const url = await uploadFile(fileObj.file);
            
            clearInterval(progressInterval);

            setFiles((prev) =>
              prev.map((f) =>
                f.file === fileObj.file
                  ? { ...f, status: "success" as const, url, progress: 100 }
                  : f
              )
            );

            return url;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Erreur d'upload";

            setFiles((prev) =>
              prev.map((f) =>
                f.file === fileObj.file
                  ? { ...f, status: "error" as const, error: errorMessage }
                  : f
              )
            );

            onError?.(errorMessage);
            return null;
          }
        });

      try {
        const urls = await Promise.all(uploadPromises);
        const successUrls = urls.filter(Boolean) as string[];

        if (successUrls.length > 0 && onFileUploaded) {
          onFileUploaded(successUrls);
        }
      } catch (error) {
        console.error("Erreur lors de l'upload:", error);
      }
    },
    [multiple, maxSize, onFileUploaded, onError, config.allowedTypes]
  );

  // Gestionnaires d'événements
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Supprimer un fichier
  const removeFile = (fileToRemove: UploadedFile) => {
    setFiles((prev) => prev.filter((f) => f.file !== fileToRemove.file));
  };

  // Obtenir l'icône pour un type de fichier
  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return Image;
    if (file.type.startsWith("video/")) return Video;
    if (file.type.startsWith("audio/")) return Music;
    return FileText;
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const IconComponent = config.icon;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zone de drop avec palette patrimoine */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
          ${
            isDragOver
              ? `border-${config.color} ${config.bgColor} scale-105`
              : `border-patrimoine-canard/30 bg-patrimoine-creme/30 hover:border-${config.color} hover:${config.bgColor}`
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={config.accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 flex items-center justify-center">
            <IconComponent
              size={40}
              className={isDragOver ? `text-${config.color}` : "text-patrimoine-canard/60"}
            />
          </div>

          <div>
            <p className="text-lg font-medium text-patrimoine-canard mb-1">
              {config.placeholder}
            </p>
            <p className="text-sm text-patrimoine-sombre/60">
              Formats acceptés • Max {maxSize}MB{multiple ? " • Plusieurs fichiers" : ""}
            </p>
          </div>

          {isDragOver && (
            <div className="absolute inset-0 bg-patrimoine-emeraude/10 border-2 border-patrimoine-emeraude border-dashed rounded-lg flex items-center justify-center">
              <p className="text-patrimoine-emeraude font-medium">
                Relâchez pour ajouter vos fichiers
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-patrimoine-canard">
            Fichiers ({files.length})
          </h4>

          <div className="space-y-2">
            {files.map((fileObj, index) => {
              const FileIcon = getFileIcon(fileObj.file);

              return (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-white border border-patrimoine-canard/10 rounded-lg shadow-sm"
                >
                  {/* Aperçu/Icône */}
                  <div className="flex-shrink-0">
                    {preview &&
                    fileObj.file.type.startsWith("image/") &&
                    (fileObj.status === "success" || fileObj.status === "uploading") ? (
                      <div className="relative">
                        <img
                          src={fileObj.url || URL.createObjectURL(fileObj.file)}
                          alt={fileObj.file.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        {fileObj.status === "uploading" && (
                          <div className="absolute inset-0 bg-patrimoine-sombre/50 rounded-lg flex items-center justify-center">
                            <Loader size={16} className="text-white animate-spin" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`w-12 h-12 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                        <FileIcon size={24} className={`text-${config.color}`} />
                      </div>
                    )}
                  </div>

                  {/* Info fichier */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-patrimoine-canard truncate">
                      {fileObj.file.name}
                    </p>
                    <p className="text-xs text-patrimoine-sombre/60">
                      {formatFileSize(fileObj.file.size)}
                    </p>
                    
                    {/* Barre de progression */}
                    {fileObj.status === "uploading" && (
                      <div className="mt-2">
                        <div className="w-full bg-patrimoine-creme rounded-full h-1.5">
                          <div
                            className={`bg-${config.color} h-1.5 rounded-full transition-all duration-300`}
                            style={{ width: `${fileObj.progress || 0}%` }}
                          />
                        </div>
                        <p className="text-xs text-patrimoine-sombre/60 mt-1">
                          {fileObj.progress || 0}% uploadé
                        </p>
                      </div>
                    )}
                    
                    {/* Message d'erreur */}
                    {fileObj.status === "error" && fileObj.error && (
                      <p className="text-xs text-patrimoine-datte mt-1" title={fileObj.error}>
                        {fileObj.error}
                      </p>
                    )}
                  </div>

                  {/* Statut */}
                  <div className="flex items-center space-x-2">
                    {fileObj.status === "uploading" && (
                      <Loader size={20} className={`text-${config.color} animate-spin`} />
                    )}

                    {fileObj.status === "success" && (
                      <CheckCircle size={20} className="text-patrimoine-emeraude" />
                    )}

                    {fileObj.status === "error" && (
                      <AlertCircle size={20} className="text-patrimoine-datte" />
                    )}

                    {/* Bouton supprimer */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(fileObj);
                      }}
                      className="p-1.5 rounded-full text-patrimoine-sombre/40 hover:text-patrimoine-datte hover:bg-patrimoine-datte/10 transition-colors"
                      title="Supprimer le fichier"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Résumé des erreurs */}
      {files.some((f) => f.status === "error") && (
        <div className="p-4 bg-patrimoine-datte/10 border border-patrimoine-datte/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle size={20} className="text-patrimoine-datte flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-patrimoine-datte">
                Certains fichiers n'ont pas pu être uploadés
              </p>
              <p className="text-xs text-patrimoine-datte/80 mt-1">
                Vérifiez les types de fichiers et la taille maximale autorisée.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Résumé des succès */}
      {files.filter(f => f.status === "success").length > 0 && (
        <div className="p-4 bg-patrimoine-emeraude/10 border border-patrimoine-emeraude/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle size={20} className="text-patrimoine-emeraude" />
            <p className="text-sm font-medium text-patrimoine-emeraude">
              {files.filter(f => f.status === "success").length} fichier(s) uploadé(s) avec succès !
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;