interface FileSystemFileHandle {
  createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>;
  getFile(): Promise<File>;
  queryPermission?(options: { mode: 'read' | 'readwrite' }): Promise<'granted' | 'denied' | 'prompt'>;
  requestPermission?(options: { mode: 'read' | 'readwrite' }): Promise<'granted' | 'denied' | 'prompt'>;
}

interface FileSystemCreateWritableOptions {
  keepExistingData?: boolean;
}

declare global {
  interface Window {
    showSaveFilePicker?(options: SaveFilePickerOptions): Promise<FileSystemFileHandle>;
  }
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: FilePickerAcceptType[];
}

interface FilePickerAcceptType {
  description?: string;
  accept: Record<string, string | string[]>;
}