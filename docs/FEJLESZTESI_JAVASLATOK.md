# Fejlesztési Javaslatok - AI Prompt Kiegészítő Rendszer

> **Strukturált technikai dokumentáció** a rendszer három fő komponensének fejlesztéséhez

---

## 1. Front-end Komponens (`PromptInput`)

**Célkitűzés:** Javítsa a React front-end komponens olvashatóságát, karbantarthatóságát, teljesítményét, hibakezelését, biztonságát és felhasználói élményét.

---

### 1.1. Olvashatóság és Karbantarthatóság

#### Komponens Bontás

**Leírás:** Válassza szét a fájlfeltöltési logikát (pl. `handleFileChange`, `readImageAsBase64`) egy dedikált `useFileUpload` egyéni hook-ba. Szervezze a kép előnézeteket (`ImagePreview`) és a fájl badge-et (`FileBadge`) külön React komponensekbe a modularitás érdekében.

**Példa (ImagePreview komponens):**
```tsx
interface ImagePreviewProps {
  image: { data: string; name: string };
  onRemove: () => void;
}

const ImagePreview = ({ image, onRemove }: ImagePreviewProps) => (
  <div className="relative group">
    <img 
      src={image.data} 
      alt={image.name} 
      className="h-20 w-20 rounded-xl object-contain border border-gray-700"
    />
    <button
      onClick={onRemove}
      className="absolute -top-1 -right-1 p-1 bg-red-500/90 rounded-full hover:bg-red-400 transition-colors opacity-0 group-hover:opacity-100"
      aria-label="Kép eltávolítása"
    >
      <X className="w-3 h-3 text-white" />
    </button>
    <span className="absolute bottom-0 left-0 right-0 text-[0.6rem] text-center bg-black/70 text-white truncate px-1 rounded-b-xl">
      {image.name}
    </span>
  </div>
);
```

**Példa (useFileUpload hook):**
```tsx
// hooks/useFileUpload.ts
interface UseFileUploadOptions {
  maxImages: number;
  acceptedExtensions: string[];
  imageExtensions: string[];
  onImageLoad?: (name: string) => void;
  onFileLoad?: (name: string) => void;
  onError?: (message: string) => void;
}

interface ImageState {
  data: string;
  name: string;
  size: number;
  file: File;
}

export function useFileUpload(options: UseFileUploadOptions) {
  const [images, setImages] = useState<ImageState[]>([]);
  const [textContent, setTextContent] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readImageAsBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    // ... implementáció
  }, [options, images.length]);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setImages([]);
    setTextContent("");
  }, []);

  return {
    images,
    textContent,
    fileInputRef,
    handleFileChange,
    removeImage,
    clearAll,
    openFilePicker: () => fileInputRef.current?.click(),
  };
}
```

#### Típusok és Interfészek Pontosítása

**Leírás:** Bővítse a `PromptInputProps` interfészt részletesebb dokumentációval (pl. `initialValue` alapértelmezett értéke). Definiáljon egy külön interfészt az `ImageState`-hez a kódstruktúra javítása érdekében.

**Példa (kibővített típusok):**
```typescript
// types/prompt.ts

/**
 * Egyetlen feltöltött kép állapota
 */
export interface ImageState {
  /** Base64 kódolt kép adat */
  data: string;
  /** Eredeti fájlnév */
  name: string;
  /** Fájlméret bájtokban */
  size: number;
  /** Eredeti File referencia (memória optimalizáláshoz) */
  file?: File;
}

/**
 * Fájltípus lehetséges értékei
 */
export type FileType = "image" | "text" | null;

/**
 * PromptInput komponens props interfész
 */
export interface PromptInputProps {
  /**
   * Callback függvény a prompt beküldésekor
   * @param content - A szöveges tartalom
   * @param fileType - A feltöltött fájl típusa (opcionális)
   * @param imageData - Base64 kódolt kép(ek) tömbje (opcionális)
   */
  onSubmit: (content: string, fileType?: FileType, imageData?: string[]) => void;
  
  /** Jelzi, hogy folyamatban van-e az API kérés */
  isLoading: boolean;
  
  /**
   * Kezdeti szöveges érték a textarea mezőben
   * @default ""
   */
  initialValue?: string;
  
  /**
   * Maximum feltölthető képek száma
   * @default 5
   */
  maxImages?: number;
  
  /**
   * Maximum karakterszám a szöveges bemenethez
   * @default 10000
   */
  maxCharacters?: number;
}
```

#### Kommentek és Dokumentáció

**Leírás:** Adjon hozzá JSDoc dokumentációt minden függvényhez.

**Példa (handleFileChange függvény):**
```typescript
/**
 * Kezeli a fájlbemenet változását szöveges/képi fájlok esetén.
 * 
 * A függvény feldolgozza a kiválasztott fájlokat és típus alapján:
 * - Képfájlok (.jpg, .jpeg, .png): Base64-re konvertálja és hozzáadja az images állapothoz
 * - Szöveges fájlok (.txt, .md): Tartalmát hozzáfűzi az input mezőhöz
 * 
 * @param e - A fájlbemeneti változási esemény
 * @throws {Error} Ha a fájl beolvasása sikertelen
 * 
 * @example
 * ```tsx
 * <input 
 *   type="file" 
 *   onChange={handleFileChange} 
 *   accept=".md,.txt,.jpg,.jpeg,.png"
 *   multiple
 * />
 * ```
 */
const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  // ... implementáció
};

/**
 * Beolvassa a képfájlt és Base64 formátumra konvertálja.
 * 
 * @param file - A beolvasandó File objektum
 * @returns Promise, amely a Base64 kódolt képadatot tartalmazza
 * @throws {DOMException} Ha a FileReader hibát dob
 */
const readImageAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Hiba a "${file.name}" fájl beolvasásakor`));
    reader.readAsDataURL(file);
  });
};
```

---

### 1.2. Teljesítmény Optimalizálás

#### Memoizálás

**Leírás:** Memoizálja az `images.map(...)` szűrő függvényt a `useCallback` hook segítségével a felesleges re-renderelések elkerülése érdekében.

**Példa (removeImage függvény):**
```tsx
const removeImage = useCallback((index: number) => {
  setImages(prev => prev.filter((_, i) => i !== index));
}, []);

// Memoizált kép lista renderelés
const renderedImages = useMemo(() => 
  images.map((img, index) => (
    <ImagePreview 
      key={`${img.name}-${index}`}
      image={img}
      onRemove={() => removeImage(index)}
    />
  )),
  [images, removeImage]
);
```

#### Rendkívüli Állapotok Kezelése

**Leírás:** Jelentősen nagy fájlok feltöltése esetén jelenítsen meg felhasználói figyelmeztetést.

**Példa (fájlméret ellenőrzés):**
```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20 MB összesen

const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  // Teljes méret számítása
  const currentTotalSize = images.reduce((sum, img) => sum + (img.size || 0), 0);

  for (const file of Array.from(files)) {
    // Egyedi fájlméret ellenőrzés
    if (file.size > MAX_FILE_SIZE) {
      toast.warning(`A "${file.name}" fájl túl nagy (max. 5 MB)`);
      continue;
    }

    // Összes fájlméret ellenőrzés
    if (currentTotalSize + file.size > MAX_TOTAL_SIZE) {
      toast.warning("Elérted a maximális feltöltési limitet (20 MB)");
      break;
    }

    // ... további feldolgozás
  }
};
```

#### Képállapot Optimalizálás

**Leírás:** Tároljon `File` típusú referenciát az állapotban `base64` képek helyett, és csak a megjelenítéskor konvertálja `base64`-re a memóriahasználat csökkentése érdekében.

**Példa (optimalizált képkezelés):**
```typescript
interface OptimizedImageState {
  file: File;
  name: string;
  size: number;
  objectUrl: string; // URL.createObjectURL eredménye
}

// Hook inicializálás
const [images, setImages] = useState<OptimizedImageState[]>([]);

// Kép hozzáadása (memóriahatékony)
const addImage = useCallback((file: File) => {
  const objectUrl = URL.createObjectURL(file);
  setImages(prev => [...prev, {
    file,
    name: file.name,
    size: file.size,
    objectUrl,
  }]);
}, []);

// Kép eltávolítása (memória felszabadítás)
const removeImage = useCallback((index: number) => {
  setImages(prev => {
    const removed = prev[index];
    if (removed?.objectUrl) {
      URL.revokeObjectURL(removed.objectUrl);
    }
    return prev.filter((_, i) => i !== index);
  });
}, []);

// Base64 konverzió csak beküldéskor
const getBase64Images = useCallback(async (): Promise<string[]> => {
  return Promise.all(
    images.map(img => readImageAsBase64(img.file))
  );
}, [images]);

// Cleanup effect
useEffect(() => {
  return () => {
    images.forEach(img => {
      if (img.objectUrl) URL.revokeObjectURL(img.objectUrl);
    });
  };
}, []);
```

---

### 1.3. Hibakezelés és Biztonság

#### Fájl Tartalom Tisztítása

**Leírás:** Használjon biztonsági könyvtárat (pl. `DOMPurify`) a `.txt` fájlok tartalmának tisztítására az XSS támadások megelőzése érdekében.

**Példa (DOMPurify használat):**
```typescript
import DOMPurify from "dompurify";

const handleTextFile = async (file: File): Promise<string> => {
  const rawText = await file.text();
  
  // XSS védelem: tisztítjuk a szöveget
  const sanitizedText = DOMPurify.sanitize(rawText, {
    ALLOWED_TAGS: [], // Csak szöveges tartalom
    ALLOWED_ATTR: [],
  });
  
  // Ellenőrzés: figyelmeztetés, ha volt eltávolított tartalom
  if (rawText !== sanitizedText) {
    console.warn(`Potenciálisan veszélyes tartalom eltávolítva: ${file.name}`);
  }
  
  return sanitizedText;
};
```

#### Részletesebb Hibakezelés

**Leírás:** A `try-catch` blokkokban biztosítson pontosabb, felhasználóbarát hibaüzeneteket.

**Példa (strukturált hibakezelés):**
```typescript
// types/errors.ts
export class FileReadError extends Error {
  constructor(fileName: string, cause?: Error) {
    super(`Hiba a "${fileName}" fájl beolvasásakor`);
    this.name = "FileReadError";
    this.cause = cause;
  }
}

export class FileSizeError extends Error {
  constructor(fileName: string, size: number, maxSize: number) {
    super(`A "${fileName}" fájl túl nagy (${formatBytes(size)} / max. ${formatBytes(maxSize)})`);
    this.name = "FileSizeError";
  }
}

export class UnsupportedFileTypeError extends Error {
  constructor(fileName: string, extension: string) {
    super(`A "${extension}" kiterjesztés nem támogatott`);
    this.name = "UnsupportedFileTypeError";
  }
}

// Használat a komponensben
const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
  try {
    // ... feldolgozás
  } catch (error) {
    if (error instanceof FileReadError) {
      toast.error(error.message);
    } else if (error instanceof FileSizeError) {
      toast.warning(error.message);
    } else if (error instanceof UnsupportedFileTypeError) {
      toast.error(error.message);
    } else if (error instanceof DOMException && error.name === "AbortError") {
      toast.info("Fájlművelet megszakítva");
    } else {
      console.error("Váratlan hiba:", error);
      toast.error("Ismeretlen hiba történt a fájl feldolgozása során");
    }
  }
};
```

---

### 1.4. Felhasználói Élmény (UX)

#### Drag & Drop Támogatás

**Leírás:** Implementálja az `onDragOver` és `onDrop` eseménykezelőket a fájlfeltöltési területhez.

**Példa (drop-zone implementáció):**
```tsx
const [isDragging, setIsDragging] = useState(false);

const handleDragOver = useCallback((e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(true);
}, []);

const handleDragLeave = useCallback((e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(false);
}, []);

const handleDrop = useCallback((e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(false);

  const files = Array.from(e.dataTransfer.files);
  if (files.length > 0) {
    // Újrahasználjuk a meglévő handleFileChange logikát
    const mockEvent = {
      target: { files: e.dataTransfer.files }
    } as React.ChangeEvent<HTMLInputElement>;
    handleFileChange(mockEvent);
  }
}, [handleFileChange]);

// JSX
<div
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
  className={cn(
    "relative rounded-2xl transition-all duration-200",
    isDragging && "ring-2 ring-aurora-purple bg-aurora-purple/10"
  )}
>
  {isDragging && (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-10">
      <div className="text-white text-lg font-medium flex items-center gap-2">
        <Upload className="w-6 h-6" />
        Húzd ide a fájlokat
      </div>
    </div>
  )}
  {/* ... többi tartalom */}
</div>
```

#### Karakterlimit Figyelmeztetés

**Leírás:** Dinamikusan változtassa meg a karakterszámláló színét (pl. pirosra), ha a karakterlimit túllépésre kerül.

**Példa (karakterszámláló implementáció):**
```tsx
const MAX_CHARACTERS = 10000;
const WARNING_THRESHOLD = 0.9; // 90%

const charCount = input.length;
const charPercentage = charCount / MAX_CHARACTERS;
const isNearLimit = charPercentage >= WARNING_THRESHOLD;
const isOverLimit = charCount > MAX_CHARACTERS;

// JSX
<div className="flex items-center justify-between px-4 py-2 text-sm">
  <span className="text-muted-foreground">
    {t.characterCount}
  </span>
  <span 
    className={cn(
      "font-mono transition-colors",
      isOverLimit && "text-red-500 font-bold animate-pulse",
      isNearLimit && !isOverLimit && "text-yellow-500",
      !isNearLimit && "text-muted-foreground"
    )}
  >
    {charCount.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()}
    {isOverLimit && (
      <span className="ml-2 text-xs">
        ({(charCount - MAX_CHARACTERS).toLocaleString()} túl)
      </span>
    )}
  </span>
</div>

{/* Beküldés gomb letiltása limit túllépése esetén */}
<Button 
  onClick={handleSubmit}
  disabled={isLoading || isOverLimit || (!input.trim() && images.length === 0)}
>
  {isOverLimit ? "Túl hosszú szöveg" : t.enhance}
</Button>
```

#### Kép Előnézet Miniatűr Javítása

**Leírás:** A képek miniatűrjének megjelenítéséhez használja az `object-fit: contain` CSS tulajdonságot torzításmentes megjelenítés érdekében.

**Példa (javított kép megjelenítés):**
```tsx
<img 
  src={img.data} 
  alt={img.name}
  loading="lazy"
  className={cn(
    "h-20 w-20 rounded-xl border border-gray-700",
    "object-contain bg-black/30", // Torzításmentes, háttérrel
    "transition-transform hover:scale-105"
  )}
  onError={(e) => {
    // Hibás kép esetén placeholder
    e.currentTarget.src = "/placeholder-image.svg";
    e.currentTarget.alt = "Kép betöltése sikertelen";
  }}
/>
```

---

### 1.5. Tesztelés

#### Egységtesztek (Jest + React Testing Library)

**Leírás:** Fejlesszen egységteszteket a következő forgatókönyvekre:
- `handleSubmit` hívása üres bemenet esetén
- Fájlfeltöltés nem támogatott kiterjesztéssel
- Több kép feltöltése, mint a maximálisan engedélyezett szám

**Példa (tesztesetek):**
```typescript
// __tests__/PromptInput.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PromptInput } from "../PromptInput";

const mockOnSubmit = jest.fn();

describe("PromptInput", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("üres bemenet esetén nem hívja meg onSubmit-ot", () => {
    render(<PromptInput onSubmit={mockOnSubmit} isLoading={false} />);
    
    const submitButton = screen.getByRole("button", { name: /enhance/i });
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test("nem támogatott fájlkiterjesztés esetén hibaüzenetet jelenít meg", async () => {
    render(<PromptInput onSubmit={mockOnSubmit} isLoading={false} />);
    
    const file = new File(["content"], "test.exe", { type: "application/octet-stream" });
    const input = screen.getByLabelText(/fájl feltöltése/i);
    
    await userEvent.upload(input, file);
    
    expect(screen.getByText(/nem támogatott formátum/i)).toBeInTheDocument();
  });

  test("maximum képszám túllépése esetén figyelmeztetést ad", async () => {
    render(<PromptInput onSubmit={mockOnSubmit} isLoading={false} maxImages={2} />);
    
    const files = [
      new File(["img1"], "1.png", { type: "image/png" }),
      new File(["img2"], "2.png", { type: "image/png" }),
      new File(["img3"], "3.png", { type: "image/png" }),
    ];
    
    const input = screen.getByLabelText(/fájl feltöltése/i);
    await userEvent.upload(input, files);
    
    expect(screen.getByText(/maximum 2 kép/i)).toBeInTheDocument();
  });

  test("Ctrl+Enter lenyomásával beküldi az űrlapot", async () => {
    render(<PromptInput onSubmit={mockOnSubmit} isLoading={false} />);
    
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "Test prompt");
    fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });
    
    expect(mockOnSubmit).toHaveBeenCalledWith("Test prompt", undefined, undefined);
  });
});
```

#### E2E Tesztek (Cypress)

**Leírás:** Implementáljon végpontok közötti teszteket a teljes felhasználói folyamat ellenőrzésére.

**Példa (Cypress teszt):**
```typescript
// cypress/e2e/prompt-input.cy.ts
describe("PromptInput E2E", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("teljes fájlfeltöltési folyamat", () => {
    // Kép feltöltése
    cy.get('input[type="file"]').selectFile("cypress/fixtures/test-image.png", { force: true });
    
    // Előnézet megjelenése
    cy.get('[data-testid="image-preview"]').should("be.visible");
    
    // Szöveg hozzáadása
    cy.get("textarea").type("Elemezd ezt a képet");
    
    // Beküldés
    cy.get('button[type="submit"]').click();
    
    // Eredmény megjelenése
    cy.get('[data-testid="enhanced-result"]', { timeout: 30000 }).should("be.visible");
  });

  it("drag & drop fájlfeltöltés", () => {
    cy.get('[data-testid="drop-zone"]').selectFile("cypress/fixtures/test.txt", {
      action: "drag-drop",
    });
    
    cy.get("textarea").should("contain.value", "test.txt tartalma");
  });
});
```

---

### 1.6. További Javaslatok

#### Többnyelvűség (i18n)

**Leírás:** Ellenőrizze, hogy a lokalizációs objektum tartalmazza-e az összes szükséges kulcsot.

**Példa (hiányzó fordítás kezelése):**
```typescript
// contexts/LanguageContext.tsx
const getTranslation = (key: string, fallback: string): string => {
  const value = t[key as keyof typeof t];
  
  if (!value) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`Hiányzó fordítás: "${key}" (nyelv: ${language})`);
    }
    return fallback;
  }
  
  return value;
};

// Használat komponensben
const message = getTranslation("imageLoaded", "Kép betöltve");
```

#### Teljesítmény Mérés

**Leírás:** Használja a React Profilert a komponens re-rendering időinek mérésére.

**Példa (Profiler használat):**
```tsx
import { Profiler, ProfilerOnRenderCallback } from "react";

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  if (actualDuration > 16) { // 60fps = 16ms/frame
    console.warn(`Lassú renderelés: ${id} - ${actualDuration.toFixed(2)}ms`);
  }
};

// Használat
<Profiler id="PromptInput" onRender={onRenderCallback}>
  <PromptInput {...props} />
</Profiler>
```

---

### 1.7. Szabványosítás

#### Kódformázás

**Leírás:** Konfigurálja a Prettier-t a kódstílus egységességének biztosítására.

**Példa (.prettierrc):**
```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

#### TypeScript Finomhangolás

**Leírás:** Pontosítsa a `fileType` típusát a nem várt értékek elkerülése érdekében.

**Példa (strict típusok):**
```typescript
// types/file.ts
export const FILE_TYPES = ["image", "text"] as const;
export type FileType = typeof FILE_TYPES[number] | null;

// Típusbiztos setter
const setFileTypeStrict = (value: FileType) => {
  if (value !== null && !FILE_TYPES.includes(value)) {
    console.error(`Érvénytelen fileType: ${value}`);
    return;
  }
  setFileType(value);
};
```

---

## 2. `useEnhancePrompt` Hook

**Célkitűzés:** Javítsa a hook karbantarthatóságát, teljesítményét, hibakezelését és felhasználói élményét.

---

### 2.1. Olvashatóság és Karbantarthatóság

#### Custom Hookokra Bontás

**Leírás:** Helyezze át a hálózati kérés logikáját egy külön `useApiCall` hookba.

**Példa (useApiCall hook):**
```typescript
// hooks/useApiCall.ts
interface UseApiCallOptions<T> {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
}

interface UseApiCallResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  execute: () => Promise<T | null>;
  abort: () => void;
  retryCount: number;
}

export function useApiCall<T>({
  url,
  method = "POST",
  body,
  headers = {},
  retries = 3,
  retryDelay = 1000,
  onRetry,
}: UseApiCallOptions<T>): UseApiCallResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (): Promise<T | null> => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new ApiError(response.status, await response.text());
        }

        const result = await response.json();
        setData(result);
        return result;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          throw err;
        }

        if (attempt < retries) {
          setRetryCount(attempt + 1);
          onRetry?.(attempt + 1);
          await delay(retryDelay * Math.pow(2, attempt));
          continue;
        }

        setError(err as Error);
        throw err;
      }
    }

    return null;
  }, [url, method, body, headers, retries, retryDelay, onRetry]);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return { data, error, isLoading, execute, abort, retryCount };
}
```

#### Kisebb Függvényekre Szétválasztás

**Leírás:** Bontsa szét az `enhancePrompt` függvényt kisebb részekre.

**Példa (strukturált függvények):**
```typescript
// hooks/useEnhancePrompt/handlers.ts

/**
 * Streamelt válasz feldolgozása
 */
export async function handleStreamingResponse(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onChunk: (content: string) => void,
  onStageChange: (stage: LoadingStage) => void
): Promise<string> {
  const decoder = new TextDecoder();
  let buffer = "";
  let result = "";
  let tokenCount = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);

      const content = parseSSELine(line);
      if (content === "[DONE]") {
        onStageChange("finalizing");
        break;
      }
      if (content) {
        result += content;
        tokenCount++;
        if (tokenCount > 10) onStageChange("enhancing");
        onChunk(result);
      }
    }
  }

  return result;
}

/**
 * SSE sor elemzése
 */
function parseSSELine(line: string): string | null {
  if (line.endsWith("\r")) line = line.slice(0, -1);
  if (line.startsWith(":") || line.trim() === "") return null;
  if (!line.startsWith("data: ")) return null;

  const jsonStr = line.slice(6).trim();
  if (jsonStr === "[DONE]") return "[DONE]";

  try {
    const parsed = JSON.parse(jsonStr);
    return parsed.choices?.[0]?.delta?.content ?? null;
  } catch {
    return null;
  }
}

/**
 * Hiba osztályozása HTTP státuszkód alapján
 */
export function classifyError(status: number, message: string): ErrorType {
  if (status === 429) return "rate-limit";
  if (status === 402) return "payment";
  if (status === 400) return "invalid-content";
  if (status === 408 || status === 504) return "timeout";
  if (status >= 500 || message.includes("network") || message.includes("fetch")) {
    return "network";
  }
  return "generic";
}
```

#### TypeScript Finomhangolás

**Leírás:** Pontosítsa a típusokat és használjon enumokat.

**Példa (típusdefiníciók):**
```typescript
// types/enhance.ts

export enum EnhanceMode {
  Formal = "formal",
  Creative = "creative",
  Technical = "technical",
  Marketing = "marketing",
}

export const ENHANCE_MODE_LABELS: Record<EnhanceMode, string> = {
  [EnhanceMode.Formal]: "Formális",
  [EnhanceMode.Creative]: "Kreatív",
  [EnhanceMode.Technical]: "Technikai",
  [EnhanceMode.Marketing]: "Marketing",
};

export type LoadingStage = "connecting" | "analyzing" | "enhancing" | "finalizing";

export type ErrorType = 
  | "network" 
  | "rate-limit" 
  | "payment" 
  | "invalid-content" 
  | "timeout" 
  | "generic";

export interface EnhanceResult {
  result: string;
  mode: EnhanceMode;
  fileType?: string;
  originalContent: string;
  tokenCount?: number;
  processingTime?: number;
}

export interface EnhanceState {
  enhancedPrompt: string;
  isEnhancing: boolean;
  loadingStage: LoadingStage;
  error: string | null;
  errorType: ErrorType | null;
  retryCount: number;
}
```

---

### 2.2. Teljesítmény Optimalizálás

#### Memoizálás

**Leírás:** Memoizálja az `enhancePrompt` és `regenerate` függvényeket.

**Példa (optimalizált hook):**
```typescript
const enhancePrompt = useCallback(
  async (
    content: string,
    mode: EnhanceMode = EnhanceMode.Formal,
    fileType?: string,
    imageData?: string | string[]
  ): Promise<EnhanceResult | null> => {
    // ... implementáció
  },
  [] // Üres függőség tömb - a függvény stabil
);

const regenerate = useCallback(async () => {
  if (!lastOriginalContent && !lastImageData) {
    toast.error(t.noPreviousPrompt);
    return null;
  }
  return enhancePrompt(
    lastOriginalContent,
    lastMode,
    lastFileType,
    lastImageData
  );
}, [lastOriginalContent, lastMode, lastFileType, lastImageData, enhancePrompt, t]);
```

#### Exponenciális Visszakapcsolási Idő

**Leírás:** Implementáljon exponenciális visszakapcsolási stratégiát.

**Példa (exponenciális késleltetés):**
```typescript
const RETRY_DELAYS = [1000, 2000, 4000, 8000]; // Max 4 retry

const getRetryDelay = (retryCount: number): number => {
  const baseDelay = RETRY_DELAYS[Math.min(retryCount, RETRY_DELAYS.length - 1)];
  // Jitter hozzáadása (±20%) a thundering herd elkerülésére
  const jitter = baseDelay * 0.2 * (Math.random() - 0.5);
  return Math.round(baseDelay + jitter);
};

// Használat
if (errType === "network" && retryCount < MAX_RETRIES) {
  const delayMs = getRetryDelay(retryCount);
  setRetryCount(prev => prev + 1);
  toast.info(`Újracsatlakozás ${Math.round(delayMs / 1000)} másodperc múlva...`);
  await delay(delayMs);
  return enhancePrompt(content, mode, fileType, imageData, true);
}
```

---

### 2.3. Hibakezelés és Biztonság

#### További Hibaosztályok

**Leírás:** Adjon hozzá további `ErrorType` értékeket.

**Példa (kibővített hibakezelés):**
```typescript
type ErrorType = 
  | "network" 
  | "rate-limit" 
  | "payment" 
  | "invalid-content"
  | "content-too-long"
  | "timeout"
  | "server-error"
  | "generic";

const ERROR_MESSAGES: Record<ErrorType, { hu: string; en: string }> = {
  "network": {
    hu: "Hálózati hiba. Ellenőrizd az internetkapcsolatod.",
    en: "Network error. Please check your connection.",
  },
  "rate-limit": {
    hu: "Túl sok kérés. Kérlek várj egy percet.",
    en: "Too many requests. Please wait a moment.",
  },
  "payment": {
    hu: "Elérted a használati limitet. Kérlek adj hozzá krediteket.",
    en: "Usage limit reached. Please add credits.",
  },
  "invalid-content": {
    hu: "Érvénytelen tartalom. Kérlek módosítsd a promptot.",
    en: "Invalid content. Please modify your prompt.",
  },
  "content-too-long": {
    hu: "A tartalom túl hosszú. Maximum 10,000 karakter engedélyezett.",
    en: "Content too long. Maximum 10,000 characters allowed.",
  },
  "timeout": {
    hu: "A kérés időtúllépés miatt megszakadt. Próbáld újra.",
    en: "Request timed out. Please try again.",
  },
  "server-error": {
    hu: "Szerverhiba. Kérlek próbáld újra később.",
    en: "Server error. Please try again later.",
  },
  "generic": {
    hu: "Ismeretlen hiba történt.",
    en: "An unknown error occurred.",
  },
};

const classifyError = (status: number, message: string): ErrorType => {
  if (status === 429) return "rate-limit";
  if (status === 402) return "payment";
  if (status === 400) {
    if (message.includes("too long") || message.includes("content length")) {
      return "content-too-long";
    }
    return "invalid-content";
  }
  if (status === 408 || status === 504) return "timeout";
  if (status >= 500) return "server-error";
  if (message.includes("network") || message.includes("fetch") || message.includes("Failed to fetch")) {
    return "network";
  }
  return "generic";
};
```

#### Hibaüzenetek Lokalizálása

**Leírás:** Dinamikusan generálja a toast üzeneteket a nyelvi kontextusból.

**Példa (lokalizált hibaüzenetek):**
```typescript
const { t, language } = useLanguage();

const showLocalizedError = useCallback((errorType: ErrorType) => {
  const messages = ERROR_MESSAGES[errorType];
  const message = language === "hu" ? messages.hu : messages.en;
  
  // Speciális kezelés bizonyos hibatípusokhoz
  if (errorType === "network") {
    toast.error(message, {
      action: {
        label: t.retry,
        onClick: () => regenerate(),
      },
    });
  } else if (errorType === "rate-limit") {
    toast.warning(message, {
      duration: 10000,
    });
  } else {
    toast.error(message);
  }
}, [language, t, regenerate]);
```

---

### 2.4. Felhasználói Élmény (UX)

#### Progresszív Indikátorok

**Leírás:** Jelenítsen meg dinamikus folyamatjelző üzeneteket.

**Példa (loadingStage üzenetek):**
```typescript
const STAGE_MESSAGES: Record<LoadingStage, { hu: string; en: string; icon: string }> = {
  connecting: {
    hu: "Csatlakozás...",
    en: "Connecting...",
    icon: "🔗",
  },
  analyzing: {
    hu: "Tartalom elemzése...",
    en: "Analyzing content...",
    icon: "🔍",
  },
  enhancing: {
    hu: "Prompt javítása...",
    en: "Enhancing prompt...",
    icon: "✨",
  },
  finalizing: {
    hu: "Befejezés...",
    en: "Finalizing...",
    icon: "✅",
  },
};

// Komponens
const LoadingIndicator = ({ stage, language }: { stage: LoadingStage; language: string }) => {
  const message = STAGE_MESSAGES[stage];
  const displayText = language === "hu" ? message.hu : message.en;
  
  return (
    <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
      <span>{message.icon}</span>
      <span>{displayText}</span>
      <span className="loading-dots">...</span>
    </div>
  );
};
```

#### Aborting Indikátor

**Leírás:** Jelenítsen meg visszajelzést a kérés megszakításakor.

**Példa (abort kezelés):**
```typescript
const [isAborting, setIsAborting] = useState(false);

const abort = useCallback(() => {
  if (abortControllerRef.current) {
    setIsAborting(true);
    abortControllerRef.current.abort();
    toast.info(t.requestCancelled);
    
    // Állapot visszaállítása rövid késleltetéssel
    setTimeout(() => {
      setIsAborting(false);
      setIsEnhancing(false);
      setLoadingStage("connecting");
    }, 300);
  }
}, [t]);

// JSX - Megszakítás gomb
{isEnhancing && (
  <Button
    variant="ghost"
    size="sm"
    onClick={abort}
    disabled={isAborting}
    className="text-muted-foreground hover:text-destructive"
  >
    {isAborting ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <X className="w-4 h-4" />
    )}
    {isAborting ? t.cancelling : t.cancel}
  </Button>
)}
```

---

### 2.5. Tesztelés

#### Egységtesztek

**Példa (hook tesztek):**
```typescript
// __tests__/useEnhancePrompt.test.ts
import { renderHook, act, waitFor } from "@testing-library/react";
import { useEnhancePrompt } from "../useEnhancePrompt";

// Mock fetch
global.fetch = jest.fn();

describe("useEnhancePrompt", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("sikeres prompt kiegészítés", async () => {
    const mockResponse = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Enhanced"}}]}\n'));
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n'));
        controller.close();
      },
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      body: mockResponse,
    });

    const { result } = renderHook(() => useEnhancePrompt());

    await act(async () => {
      await result.current.enhancePrompt("Test prompt", "formal");
    });

    expect(result.current.enhancedPrompt).toBe("Enhanced");
    expect(result.current.error).toBeNull();
  });

  test("hálózati hiba és újrapróbálkozás", async () => {
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValue({
        ok: true,
        body: createMockStream("Success"),
      });

    const { result } = renderHook(() => useEnhancePrompt());

    await act(async () => {
      await result.current.enhancePrompt("Test", "formal");
    });

    expect(result.current.retryCount).toBe(2);
    expect(result.current.enhancedPrompt).toBe("Success");
  });

  test("regenerate használja a korábbi állapotot", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      body: createMockStream("Result"),
    });

    const { result } = renderHook(() => useEnhancePrompt());

    // Első kiegészítés
    await act(async () => {
      await result.current.enhancePrompt("Original", "creative");
    });

    // Regenerálás
    await act(async () => {
      await result.current.regenerate();
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect((global.fetch as jest.Mock).mock.calls[1][1].body).toContain("Original");
  });
});

// Segédfüggvény
function createMockStream(content: string): ReadableStream {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(`data: {"choices":[{"delta":{"content":"${content}"}}]}\n`));
      controller.enqueue(new TextEncoder().encode('data: [DONE]\n'));
      controller.close();
    },
  });
}
```

---

### 2.6. Szabványosítás

#### EnhanceMode Enum

**Példa:**
```typescript
// types/enhance.ts
export enum EnhanceMode {
  Formal = "formal",
  Creative = "creative",
  Technical = "technical",
  Marketing = "marketing",
}

// Típusbiztos használat
const mode: EnhanceMode = EnhanceMode.Formal;

// IDE autocomplete és típusellenőrzés
function setMode(newMode: EnhanceMode) {
  // ...
}
```

---

## 3. Deno Szerver (`enhance-prompt`)

**Célkitűzés:** Javítsa a Deno alapú szerver biztonságát, hibakezelését, teljesítményét és karbantarthatóságát.

---

### 3.1. Biztonság és Hibakezelés

#### Bemeneti Validáció

**Leírás:** Validálja a bemeneti értékeket a káros tartalmak ellen.

**Példa (validációs függvények):**
```typescript
// utils/validation.ts

const MAX_CONTENT_LENGTH = 10000;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_IMAGES = 5;
const VALID_MODES = ["formal", "creative", "technical", "marketing"];

interface ValidationResult {
  valid: boolean;
  error?: string;
  status?: number;
}

export function validateRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Érvénytelen kérés formátum", status: 400 };
  }

  const { content, mode, imageData } = body as Record<string, unknown>;

  // Content validáció
  if (content !== undefined) {
    if (typeof content !== "string") {
      return { valid: false, error: "A content mezőnek szövegnek kell lennie", status: 400 };
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      return { 
        valid: false, 
        error: `A tartalom túl hosszú (max. ${MAX_CONTENT_LENGTH} karakter)`, 
        status: 400 
      };
    }
  }

  // Mode validáció
  if (mode !== undefined && !VALID_MODES.includes(mode as string)) {
    return { 
      valid: false, 
      error: `Érvénytelen mód. Engedélyezett: ${VALID_MODES.join(", ")}`, 
      status: 400 
    };
  }

  // Image validáció
  if (imageData !== undefined) {
    const images = Array.isArray(imageData) ? imageData : [imageData];
    
    if (images.length > MAX_IMAGES) {
      return { 
        valid: false, 
        error: `Maximum ${MAX_IMAGES} kép engedélyezett`, 
        status: 400 
      };
    }

    for (const img of images) {
      if (typeof img !== "string") {
        return { valid: false, error: "Érvénytelen képformátum", status: 400 };
      }
      
      // Base64 méret becslése
      const estimatedSize = (img.length * 3) / 4;
      if (estimatedSize > MAX_IMAGE_SIZE) {
        return { 
          valid: false, 
          error: "Egy vagy több kép túl nagy (max. 5 MB)", 
          status: 413 
        };
      }

      // Data URL formátum ellenőrzése
      if (!img.startsWith("data:image/")) {
        return { valid: false, error: "Érvénytelen kép data URL", status: 400 };
      }
    }
  }

  // Legalább content vagy imageData szükséges
  if (!content?.trim() && !imageData) {
    return { valid: false, error: "Tartalom vagy kép szükséges", status: 400 };
  }

  return { valid: true };
}
```

#### Rate Limiting

**Leírás:** Implementáljon IP-cím alapú rate limiting-et.

**Példa (egyszerű rate limiter):**
```typescript
// utils/rateLimiter.ts

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const RATE_LIMIT = 100; // kérések száma
const WINDOW_MS = 60 * 1000; // 1 perc

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Lejárt bejegyzés törlése
  if (entry && entry.resetAt < now) {
    rateLimitMap.delete(ip);
  }

  const current = rateLimitMap.get(ip);

  if (!current) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: WINDOW_MS };
  }

  if (current.count >= RATE_LIMIT) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetIn: current.resetAt - now 
    };
  }

  current.count++;
  return { 
    allowed: true, 
    remaining: RATE_LIMIT - current.count, 
    resetIn: current.resetAt - now 
  };
}

// Használat a serve függvényben
serve(async (req) => {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ 
        error: "Túl sok kérés. Kérlek várj.",
        retryAfter: Math.ceil(rateLimit.resetIn / 1000)
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(rateLimit.resetIn / 1000)),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  }

  // ... többi logika
});
```

---

### 3.2. Hibakeresés és Naplózás

#### Strukturált Naplózás

**Leírás:** Naplózza a hibákat JSON formátumban.

**Példa (strukturált logger):**
```typescript
// utils/logger.ts

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  duration?: number;
  status?: number;
  ip?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, unknown>;
}

function log(entry: LogEntry): void {
  const output = JSON.stringify(entry);
  
  switch (entry.level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

export const logger = {
  debug: (message: string, metadata?: Record<string, unknown>) =>
    log({ level: "debug", message, timestamp: new Date().toISOString(), metadata }),
    
  info: (message: string, metadata?: Record<string, unknown>) =>
    log({ level: "info", message, timestamp: new Date().toISOString(), metadata }),
    
  warn: (message: string, metadata?: Record<string, unknown>) =>
    log({ level: "warn", message, timestamp: new Date().toISOString(), metadata }),
    
  error: (message: string, error?: Error, metadata?: Record<string, unknown>) =>
    log({
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      metadata,
    }),
    
  request: (req: Request, status: number, duration: number, requestId: string) =>
    log({
      level: "info",
      message: `${req.method} ${new URL(req.url).pathname}`,
      timestamp: new Date().toISOString(),
      requestId,
      duration,
      status,
      ip: req.headers.get("x-forwarded-for") || undefined,
    }),
};

// Használat
serve(async (req) => {
  const requestId = crypto.randomUUID();
  const startTime = performance.now();
  
  try {
    logger.info("Request received", { 
      requestId,
      contentLength: req.headers.get("content-length"),
    });
    
    // ... feldolgozás
    
    const duration = performance.now() - startTime;
    logger.request(req, 200, duration, requestId);
    
    return response;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error("Request failed", error as Error, { requestId, duration });
    // ... hiba válasz
  }
});
```

#### Automatikus Újrapróbálkozás

**Leírás:** Implementáljon exponenciális visszakapcsolást az AI gateway hívásokhoz.

**Példa (retry wrapper):**
```typescript
// utils/retry.ts

interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableStatuses: number[];
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryableStatuses: [500, 502, 503, 504],
};

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryOptions: Partial<RetryOptions> = {}
): Promise<Response> {
  const opts = { ...DEFAULT_OPTIONS, ...retryOptions };
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok || !opts.retryableStatuses.includes(response.status)) {
        return response;
      }
      
      if (attempt === opts.maxRetries) {
        return response;
      }
      
      const delay = Math.min(
        opts.baseDelay * Math.pow(2, attempt),
        opts.maxDelay
      );
      
      logger.warn(`Retry attempt ${attempt + 1}/${opts.maxRetries}`, {
        status: response.status,
        delay,
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error) {
      if (attempt === opts.maxRetries) {
        throw error;
      }
      
      const delay = Math.min(
        opts.baseDelay * Math.pow(2, attempt),
        opts.maxDelay
      );
      
      logger.warn(`Network error, retry attempt ${attempt + 1}/${opts.maxRetries}`, {
        error: (error as Error).message,
        delay,
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error("Max retries exceeded");
}

// Használat
const response = await fetchWithRetry(
  "https://ai.gateway.lovable.dev/v1/chat/completions",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  }
);
```

---

### 3.3. Teljesítmény Optimalizálás

#### Kép Előfeldolgozás

**Leírás:** Ellenőrizze a képméretet a feldolgozás előtt.

**Példa:**
```typescript
// utils/imageProcessor.ts

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DIMENSION = 4096;

interface ProcessedImage {
  url: string;
  estimatedSize: number;
}

export function validateImages(images: string[]): { valid: ProcessedImage[]; errors: string[] } {
  const valid: ProcessedImage[] = [];
  const errors: string[] = [];

  for (const img of images) {
    // Base64 méret becslése
    const base64Data = img.split(",")[1] || img;
    const estimatedSize = (base64Data.length * 3) / 4;

    if (estimatedSize > MAX_IMAGE_SIZE) {
      errors.push(`Kép túl nagy: ${(estimatedSize / 1024 / 1024).toFixed(1)} MB (max. 5 MB)`);
      continue;
    }

    // MIME type ellenőrzése
    const mimeMatch = img.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,/);
    if (!mimeMatch) {
      errors.push("Nem támogatott képformátum (engedélyezett: PNG, JPEG, GIF, WebP)");
      continue;
    }

    valid.push({ url: img, estimatedSize });
  }

  return { valid, errors };
}
```

---

### 3.4. Kódstruktúra

#### Modularizáció

**Leírás:** Szervezze a kódot külön modulokba.

**Példa (fájlstruktúra):**
```
supabase/functions/enhance-prompt/
├── index.ts              # Fő belépési pont
├── handlers/
│   └── enhance.ts        # Enhance logika
├── utils/
│   ├── validation.ts     # Bemeneti validáció
│   ├── rateLimiter.ts    # Rate limiting
│   ├── logger.ts         # Strukturált naplózás
│   ├── retry.ts          # Újrapróbálkozási logika
│   └── imageProcessor.ts # Képfeldolgozás
├── prompts/
│   └── modes.ts          # MODE_PROMPTS definíciók
└── types/
    └── index.ts          # TypeScript típusok
```

**Példa (refaktorált index.ts):**
```typescript
// supabase/functions/enhance-prompt/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleEnhanceRequest } from "./handlers/enhance.ts";
import { validateRequest } from "./utils/validation.ts";
import { checkRateLimit } from "./utils/rateLimiter.ts";
import { logger } from "./utils/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  const requestId = crypto.randomUUID();
  const startTime = performance.now();

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rateLimit = checkRateLimit(ip);
    
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: "Túl sok kérés" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Request parsing és validáció
    const body = await req.json();
    const validation = validateRequest(body);
    
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: validation.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Főlogika
    const response = await handleEnhanceRequest(body, requestId);
    
    const duration = performance.now() - startTime;
    logger.request(req, response.status, duration, requestId);
    
    return response;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error("Request failed", error as Error, { requestId, duration });
    
    return new Response(
      JSON.stringify({ error: "Szerverhiba történt" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

### 3.5. Tesztelés

#### Deno Tesztek

**Példa (teszt specifikációk):**
```typescript
// supabase/functions/enhance-prompt/__tests__/enhance.test.ts
import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { validateRequest } from "../utils/validation.ts";

Deno.test("validateRequest - érvényes szöveges bemenet", () => {
  const result = validateRequest({
    content: "Test prompt",
    mode: "formal",
  });
  
  assertEquals(result.valid, true);
});

Deno.test("validateRequest - túl hosszú tartalom", () => {
  const result = validateRequest({
    content: "a".repeat(15000),
    mode: "formal",
  });
  
  assertEquals(result.valid, false);
  assertEquals(result.status, 400);
  assertExists(result.error);
});

Deno.test("validateRequest - érvénytelen mód", () => {
  const result = validateRequest({
    content: "Test",
    mode: "invalid-mode",
  });
  
  assertEquals(result.valid, false);
});

Deno.test("validateRequest - képes bemenet", () => {
  const result = validateRequest({
    imageData: "data:image/png;base64,iVBORw0KGgo=",
  });
  
  assertEquals(result.valid, true);
});

Deno.test("validateRequest - üres bemenet", () => {
  const result = validateRequest({});
  
  assertEquals(result.valid, false);
  assertEquals(result.status, 400);
});
```

---

### 3.6. API Dokumentáció

**Példa (OpenAPI spec):**
```typescript
// supabase/functions/enhance-prompt/docs/openapi.ts

export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "AI Prompt Enhance API",
    version: "1.0.0",
    description: "API a promptok AI-alapú kiegészítéséhez",
  },
  paths: {
    "/enhance-prompt": {
      post: {
        summary: "Prompt kiegészítése",
        description: "Átalakítja a bemeneti szöveget/képet professzionális prompttá",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  content: {
                    type: "string",
                    description: "Szöveges tartalom",
                    maxLength: 10000,
                  },
                  mode: {
                    type: "string",
                    enum: ["formal", "creative", "technical", "marketing"],
                    default: "formal",
                  },
                  imageData: {
                    oneOf: [
                      { type: "string" },
                      { type: "array", items: { type: "string" } },
                    ],
                    description: "Base64 kódolt kép(ek)",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Sikeres válasz (SSE stream)",
            content: {
              "text/event-stream": {},
            },
          },
          "400": { description: "Érvénytelen bemenet" },
          "429": { description: "Túl sok kérés" },
          "500": { description: "Szerverhiba" },
        },
      },
    },
  },
};

// /docs végpont
if (req.url.endsWith("/docs")) {
  return new Response(JSON.stringify(openApiSpec, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

---

## Összefoglalás

Ez a dokumentum átfogó fejlesztési javaslatokat tartalmaz az AI Prompt Kiegészítő Rendszer három fő komponenséhez:

1. **Front-end (`PromptInput`)**: Komponens bontás, teljesítmény optimalizálás, drag & drop, hibakezelés
2. **Hook (`useEnhancePrompt`)**: Custom hookok, memoizálás, strukturált hibakezelés, UX fejlesztések
3. **Deno Szerver**: Validáció, rate limiting, strukturált naplózás, modularizáció

A javaslatok megvalósítása javítja a kód karbantarthatóságát, biztonságát és a felhasználói élményt.
