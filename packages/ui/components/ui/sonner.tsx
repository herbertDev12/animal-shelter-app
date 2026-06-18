"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  FileCheckIcon,
  InfoIcon,
  TriangleIcon,
  OctagonIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      richColors
      className="toaster group"
      icons={{
        success: <FileCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleIcon className="size-4" />,
        error: <OctagonIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "#161a21",
          "--normal-text": "#ffffff",
          "--normal-border": "rgba(255,255,255,0.08)",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
