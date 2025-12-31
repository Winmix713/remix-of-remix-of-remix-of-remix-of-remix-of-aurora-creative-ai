/**
 * Egyetlen feltöltött kép állapota
 */
export interface ImageState {
  /** Base64 kódolt kép adat (beküldéskor töltődik fel) */
  data: string;
  /** Eredeti fájlnév */
  name: string;
  /** Fájlméret bájtokban */
  size: number;
  /** Eredeti File referencia (memória optimalizáláshoz) */
  file: File;
  /** Ideiglenes Object URL a preview-hoz (memória felszabadítás szükséges) */
  objectUrl: string;
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

  /**
   * Maximum fájlméret MB-ban
   * @default 5 MB
   */
  maxFileSizeMB?: number;

  /**
   * Maximum összes fájlméret MB-ban
   * @default 20 MB
   */
  maxTotalSizeMB?: number;
}
