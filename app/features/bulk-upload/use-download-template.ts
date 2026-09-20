export const useDownloadTemplate = () => {
  return {
    downloadTemplate: async (type: "students" | "programs" | "scholarships" | "funds") => {
      try {
        const response = await fetch(`/api/bulk-upload/template/${type}`);
        
        if (!response.ok) {
          throw new Error("Failed to download template");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${type}_template.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Template download error:", error);
        throw error;
      }
    }
  };
};
