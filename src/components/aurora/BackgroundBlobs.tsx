export function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-aurora-purple rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-aurora-yellow rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob-delay-2" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-aurora-pink rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob-delay-4" />
    </div>
  );
}
