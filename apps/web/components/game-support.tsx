import { cn } from "@/lib/utils";

// Game logos shipped in /public — SVG wordmarks where available, PNG for BGMI.
// PUBG / Fortnite / Free Fire read larger; BGMI and Apex share a smaller size.
const SUPPORTED_GAMES = [
  { name: "PUBG Battlegrounds", src: "/pubg.svg", size: "h-12 sm:h-20" },
  { name: "Fortnite", src: "/Fortnite.svg", size: "h-12 sm:h-24" },
  { name: "Battlegrounds Mobile India", src: "/BGMI.png", size: "h-10 sm:h-12" },
  { name: "Free Fire", src: "/freefire.svg", size: "h-20 sm:h-30" },
  { name: "Apex Legends", src: "/apex-legends.svg", size: "h-10 sm:h-12" },
] as const;

// Horizontal logo strip of the games the platform supports. Built for dark
// surfaces (the auth shell): white wordmarks over a transparent background.
export function GameSupport({ className }: { className?: string }) {
  return (
    <section className={cn("w-full", className)}>
      <h2 className="text-center text-xl font-bold font-primary uppercase tracking-[0.4em] text-white/80 sm:text-2xl md:text-4xl">
        Game Support
      </h2>
      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-16 lg:gap-x-24">
        {SUPPORTED_GAMES.map((game) => (
          <li key={game.name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={game.src}
              alt={game.name}
              title={game.name}
              loading="lazy"
              // The /public logos ship as black artwork — force them to white
              // wordmarks so they read on the dark surface.
              className={cn(
                "w-auto object-contain opacity-80 brightness-0 invert transition-opacity hover:opacity-100",
                game.size,
              )}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
