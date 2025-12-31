export function FloatingSphere() {
  return (
    <div className="mb-8 relative group cursor-pointer animate-float">
      <div className="absolute inset-0 bg-aurora-purple/30 blur-3xl rounded-full scale-75 translate-y-4" />
      <img 
        src="https://brainwave2-app.vercel.app/_next/image?url=%2Fimages%2Fmaterials%2F10.png&w=256&q=75" 
        alt="Aurora AI Sphere"
        width={100}
        height={100}
        className="w-24 h-24 md:w-28 md:h-28 object-contain relative z-10 drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
      />
    </div>
  );
}
