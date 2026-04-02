import ImageUploader from "@/components/ImageUploader";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cozy-beige p-6 font-sans">
      <div className="w-full max-w-md rounded-3xl border-4 border-lofi-charcoal bg-panda-white p-8 shadow-[8px_8px_0px_0px_rgba(61,61,61,1)]">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-lofi-charcoal">Studio Companion</h1>
          <p className="text-sm text-lofi-charcoal/60 italic">Your lofi study buddy awaits</p>
        </header>

        {/* Modular Component */}
        <ImageUploader />

        <div className="mt-8 flex flex-col gap-4">
          <button className="w-full rounded-xl bg-study-pink py-4 font-bold text-lofi-charcoal border-2 border-lofi-charcoal shadow-[4px_4px_0px_0px_rgba(61,61,61,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all">
            Enter Study Room
          </button>
          
          <p className="text-center text-[10px] uppercase tracking-widest text-lofi-charcoal/40 font-semibold">
            Status: Offline
          </p>
        </div>
      </div>
    </main>
  );
}