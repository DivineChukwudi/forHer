import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import pandaHug from "@/assets/panda-hug.png";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight, Download, Film, Heart, Maximize2, Music2, Pause, Play, SkipBack, SkipForward, Sparkles, Trash2, Volume2, VolumeX, X } from "lucide-react";
import { cn } from "@/lib/utils";
// @ts-ignore — html2canvas is typed loosely but works perfectly at runtime
import html2canvas from "html2canvas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "For Reabetsoe ❤️ · A Little Care Package" },
      {
        name: "description",
        content:
          "A quiet little corner of the internet made just for you, Reabetsoe. Press, open, and remember how loved and capable you are.",
      },
      { property: "og:title", content: "For Reabetsoe ❤️" },
      {
        property: "og:description",
        content:
          "A quiet little corner of the internet made just for you, Reabetsoe. Press, open, and remember how loved you are.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STARS = [
  { top: "12%", left: "8%", size: 3, delay: "0s" },
  { top: "22%", left: "82%", size: 2, delay: "0.6s" },
  { top: "34%", left: "18%", size: 4, delay: "1.2s" },
  { top: "16%", left: "55%", size: 2, delay: "0.3s" },
  { top: "48%", left: "70%", size: 3, delay: "1.8s" },
  { top: "60%", left: "12%", size: 2, delay: "0.9s" },
  { top: "72%", left: "88%", size: 3, delay: "1.5s" },
  { top: "80%", left: "40%", size: 2, delay: "0.4s" },
  { top: "8%", left: "38%", size: 2, delay: "2s" },
  { top: "55%", left: "48%", size: 2, delay: "1s" },
  { top: "90%", left: "65%", size: 3, delay: "2.4s" },
  { top: "42%", left: "90%", size: 2, delay: "0.8s" },
];

const COMPLIMENTS = [
  "You are braver than you know, and you have already survived every hard day so far, mabhabha.",
  "You don't have to have it all figured out to be doing amazing, minxi.",
  "The fact that you care this much already says everything about who you're becoming, sthandwa sam.",
  "You make ordinary days feel lighter just by being in them.",
  "Nobody smiles like you. Nobody, my pookie.",
  "Progress isn't a straight line, and yours is still beautifully upward.",
  "You are allowed to rest. Resting is not falling behind, minxi.",
  "The world is genuinely better with your exact energy in it, mabhabha.",
  "Whatever the future holds, it's lucky to have you in it, my pookie.",
  "You are more capable than your loudest doubt, sthandwa sam.",
  "Today doesn't need you to be perfect. Just you. That's always enough.",
  "You've outgrown every version of yourself that doubted you. Keep going, minxi.",
];

const PET_NAMES = ["mabhabha", "sthandwa sam", "minxi", "my pookie"];

const NOTES = [
  "The future you're worried about is being built by the you who is already showing up today.",
  "Successful people aren't a different species. They're just people who kept going. And you keep going.",
  "Compare yourself to who you were last year. She would be so proud of you.",
  "Your worth isn't a to-do list. It was never up for debate.",
  "Some seasons are for planting, not harvesting. Be patient with this one. It's yours, mabhabha.",
  "You've solved every 'impossible' thing so far. Statistically, that trend continues.",
  "The people who love you aren't waiting for you to achieve something. They just want you, sthandwa sam.",
  "Doubt is loud, but it has never once been right about you.",
  "One small step today counts. That's literally how every big future is made, minxi.",
  "You are becoming someone your younger self would look up to, my pookie.",
];

/* ---------- Her Journey: picture carousel ---------- */

const youngMedia = import.meta.glob(
  "@/assets/her-pictures/young-her/*.{jpg,jpeg,png,gif,webp,mp4,webm,mov,m4v,JPG,JPEG,PNG,GIF,WEBP,MP4,WEBM,MOV,M4V}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

const oldMedia = import.meta.glob(
  "@/assets/her-pictures/old-her/*.{jpg,jpeg,png,gif,webp,mp4,webm,mov,m4v,JPG,JPEG,PNG,GIF,WEBP,MP4,WEBM,MOV,M4V}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

const VIDEO_EXT_RE = /\.(mp4|webm|mov|m4v)$/i;
const LAST_NAME_RE = /(^|[\\/])(last)(?=\.[^.]+$)/i;

type MediaKind = "image" | "video";

const kindOf = (path: string): MediaKind =>
  VIDEO_EXT_RE.test(path) ? "video" : "image";

const basenameOf = (path: string): string => {
  const sep = path.lastIndexOf("/") >= 0 ? "/" : "\\";
  const idx = path.lastIndexOf(sep);
  return idx >= 0 ? path.slice(idx + 1) : path;
};

const isLastName = (path: string): boolean => {
  const name = basenameOf(path).toLowerCase();
  if (name.includes("last")) return true;
  return LAST_NAME_RE.test(path);
};

const toSortedEntries = (
  obj: Record<string, string>,
  opts?: { forceLast?: boolean },
) => {
  const forceLast = opts?.forceLast ?? false;
  return Object.entries(obj)
    .sort(([a], [b]) => {
      const aIsLast = forceLast && isLastName(a);
      const bIsLast = forceLast && isLastName(b);
      if (aIsLast && !bIsLast) return 1;
      if (!aIsLast && bIsLast) return -1;
      return a.localeCompare(b);
    })
    .map(([path, url]) => ({ url, kind: kindOf(path) } as const));
};

type MediaSrc = { url: string; kind: MediaKind };

const PLACEHOLDER_COUNT = 3;
const YOUNG_PROMPTS = [
  "vintage polaroid photo of a little girl smiling in a sunflower field, soft golden hour light, nostalgic dreamy aesthetic, warm film grain",
  "old photograph of a young girl holding a pink balloon at a fair, vintage 90s aesthetic, soft focus edges, warm faded tones",
  "candid childhood memory photo of a girl reading a book under a big tree, dappled sunlight, soft pastel tones, gentle nostalgic mood",
];
const OLD_PROMPTS = [
  "portrait of a confident young black woman standing tall in a sunlit office, warm professional lighting, strong gentle smile, empowerment aesthetic",
  "photograph of a beautiful black woman in a flowy linen dress walking on a beach at golden hour, wind in hair, serene peaceful expression, warm glow",
  "candid portrait of a successful black woman laughing while holding a warm coffee mug in a cozy modern cafe, soft natural light, joy and warmth",
];
const FALLBACK_YOUNG: MediaSrc[] = Array.from(
  { length: PLACEHOLDER_COUNT },
  (_, i) => {
    const prompt = (YOUNG_PROMPTS[i] ?? YOUNG_PROMPTS[0]) as string;
    return {
      url: `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=portrait_4_3`,
      kind: "image" as MediaKind,
    };
  },
);
const FALLBACK_OLD: MediaSrc[] = Array.from(
  { length: PLACEHOLDER_COUNT },
  (_, i) => {
    const prompt = (OLD_PROMPTS[i] ?? OLD_PROMPTS[0]) as string;
    return {
      url: `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=portrait_4_3`,
      kind: "image" as MediaKind,
    };
  },
);

type Era = "young" | "old";
type Slide = {
  src: string;
  kind: MediaKind;
  era: Era;
  message: string;
  label: string;
  isPlaceholder: boolean;
};

const YOUNG_HER_MESSAGES: string[] = [
  "Do it for her.",
  "Look at that little girl — she's counting on you.",
  "She had no idea how far she would go. Now you get to show her.",
  "For the little one who used to dream of being you.",
  "Every hard thing you survive, she survives too — and she's so proud.",
  "She's still in there, and she still believes in magic. Don't let her down.",
  "You were already brave back then. You're braver now, because of her.",
  "Everything she hoped for — you're living it, one step at a time.",
  "She didn't know she was becoming a whole person. You get to be her.",
  "For every scared, hopeful version of her that lived inside you.",
  "Look how soft her smile was. Keep it for her.",
  "Everything she ever wanted to become — that's you, still becoming.",
  "That little spark in her eye? You carry it. Don't let it go out.",
  "For every promise she made to herself: keep them, one by one.",
  "She never asked for perfect. She asked for you to try. And you are.",
  "Protect that little girl by protecting the woman she's become.",
  "She used to stare at the sky and wonder. Now you get to live in it.",
  "Every brave choice she would have been proud of — you're making them.",
  "For the little voice inside that still says, 'what if?' — find out for her.",
  "She trusted the future. Be the future she trusted.",
  "Every dream she whispered to herself — you get to keep them alive.",
  "For every birthday wish she ever blew out — make one of yours come true today.",
  "She carried you through childhood. Now you carry her through life.",
  "Tell her: we made it, minxi. And we're still going.",
  "That shy little smile of hers — it's still yours, and it's still so beautiful.",
  "For the little girl who deserved the world — go get it for both of you.",
];

const OLD_HER_MESSAGES: string[] = [
  "Do it for the inner you that believes you can.",
  "Look at you — the woman she grew into. She'd be speechless.",
  "This is what it looks like when the little girl doesn't give up.",
  "Every scar, every win, every tired morning — you wore it all, and you're still here.",
  "You are exactly the woman she used to pray she'd become.",
  "For the version of you right now that's trying, even on the quiet hard days.",
  "Your younger self is cheering. Please don't stop.",
  "All the dreams she had? You're the proof she didn't dream too big.",
  "Be gentle with the woman you are — she's carrying the girl you were, beautifully.",
  "You didn't come this far just to stop now. Keep going for her, keep going for you.",
  "Look at how much you survived — with grace, with heart, with that little Reabetsoe spark.",
  "For every 'I can't' you ever felt — say it back: 'Watch me.'",
  "The woman in this picture — nobody knows how much she's carried. But I know. And I'm proud.",
  "She became someone her younger self can look up to. That's you.",
  "Do it because the current you deserves it — not just the future you.",
  "All those days you felt invisible? Look at you now, shining anyway.",
  "For the videos, the laughter, the quiet tired evenings — this is your life, and you're living it well.",
  "Everything that broke you also shaped you into her — and she's incredible.",
  "Every time you choose to keep going, you're choosing her. Don't ever stop.",
  "You don't have to have it all figured out to be doing it right. You're already doing it right.",
  "For every clip that captures her laughing — may there be a thousand more.",
  "You are not the same girl, and that's the best news ever. You're stronger. You're wiser. You're you.",
  "Look at yourself, Reabetsoe — really look. You are amazing.",
  "For the woman you're becoming right now, in this very moment — I believe in her.",
  "Every time you love, every time you try, every time you get back up — that's her magic, still going.",
  "This is your life. Live it for the girl you were, the woman you are, and the future that's waiting for both of you.",
];

function buildSlides(): Slide[] {
  const userYoung = toSortedEntries(youngMedia);
  const userOld = toSortedEntries(oldMedia, { forceLast: true });

  const youngSrcs: MediaSrc[] =
    userYoung.length > 0 ? userYoung : FALLBACK_YOUNG;
  const oldSrcs: MediaSrc[] = userOld.length > 0 ? userOld : FALLBACK_OLD;
  const hasUserMedia = userYoung.length > 0 || userOld.length > 0;

  const slides: Slide[] = [];
  const maxLen = Math.max(youngSrcs.length, oldSrcs.length);

  const fallbackYoung = FALLBACK_YOUNG[0] as MediaSrc;
  const fallbackOld = FALLBACK_OLD[0] as MediaSrc;

  for (let i = 0; i < maxLen; i++) {
    const young: MediaSrc =
      youngSrcs[i] ??
      youngSrcs[youngSrcs.length - 1] ??
      fallbackYoung;
    const old: MediaSrc =
      oldSrcs[i] ?? oldSrcs[oldSrcs.length - 1] ?? fallbackOld;

    const youngMsg =
      YOUNG_HER_MESSAGES[i % YOUNG_HER_MESSAGES.length] ??
      YOUNG_HER_MESSAGES[0] ??
      "Do it for her.";
    const oldMsg =
      OLD_HER_MESSAGES[i % OLD_HER_MESSAGES.length] ??
      OLD_HER_MESSAGES[0] ??
      "Do it for the inner you that believes you can.";

    slides.push({
      src: young.url,
      kind: young.kind,
      era: "young",
      message: youngMsg,
      label: "Younger you",
      isPlaceholder: !hasUserMedia,
    });
    slides.push({
      src: old.url,
      kind: old.kind,
      era: "old",
      message: oldMsg,
      label: old.kind === "video" ? "The woman you are now" : "The woman you are now",
      isPlaceholder: !hasUserMedia,
    });
  }

  if (slides.length === 0) return slides;
  const lastSlide = slides[slides.length - 1] as Slide;
  if (lastSlide.era !== "old") {
    const lastOld = [...slides].reverse().find((s) => s.era === "old");
    if (lastOld) slides.push({ ...lastOld });
  }

  return slides;
}

/* ---------- Background songs ---------- */

const songFiles = import.meta.glob(
  "@/assets/songs/*.{mp3,m4a,wav,ogg,flac,aac,MP3,M4A,WAV,OGG,FLAC,AAC}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

const SONG_NAME_RE =
  /[\\/]([^\\/]+?)(?:\.(?:mp3|m4a|wav|ogg|flac|aac|MP3|M4A|WAV|OGG|FLAC|AAC))?$/;

const prettySongName = (path: string): string => {
  const m = path.match(SONG_NAME_RE);
  const group1 = m ? m[1] : undefined;
  const raw = (group1 ?? path)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return raw.length > 0 ? raw : "A song for you";
};

const songs = Object.entries(songFiles)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([p, url]) => ({ url, name: prettySongName(p) }));

type Heart = { id: number; x: number; emoji: string };

const HEART_EMOJIS = ["❤️", "💖", "💗", "💕", "❤️"];

function Index() {
  const [complimentIndex, setComplimentIndex] = useState(0);
  const [presses, setPresses] = useState(0);
  const [noteIndex, setNoteIndex] = useState<number | null>(null);
  const [customNotes, setCustomNotes] = useState<string[]>([]);
  const [customNoteDraft, setCustomNoteDraft] = useState("");
  const [showCustomNoteForm, setShowCustomNoteForm] = useState(false);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const heartId = useRef(0);
  const downloadCardRef = useRef<HTMLDivElement | null>(null);

  const slides = useMemo(buildSlides, []);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [mediaError, setMediaError] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // ----- Focus / enlarge mode -----
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const focusedVideoRef = useRef<HTMLVideoElement | null>(null);
  const focusedSlide =
    focusedIndex === null ? undefined : (slides[focusedIndex] as Slide | undefined);
  const openFocus = useCallback((i: number) => {
    if (i < 0 || i >= slides.length) return;
    setFocusedIndex(i);
  }, [slides.length]);
  const closeFocus = useCallback(() => {
    const fv = focusedVideoRef.current;
    if (fv) {
      fv.pause();
      try { fv.currentTime = 0; } catch {}
      focusedVideoRef.current = null;
    }
    setFocusedIndex(null);
  }, []);

  // Close focus view on Escape key.
  useEffect(() => {
    if (focusedIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFocus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusedIndex, closeFocus]);

  // When focus opens on a video, play it muted/looped. When it closes (focusedIndex
  // changes), stop it. Songs keep playing completely untouched.
  useEffect(() => {
    const fv = focusedVideoRef.current;
    if (focusedIndex === null) {
      if (fv) {
        fv.pause();
        try { fv.currentTime = 0; } catch {}
      }
      return;
    }
    const s = slides[focusedIndex];
    if (!s || s.kind !== "video" || !fv) return;
    fv.muted = true;
    fv.loop = true;
    fv.playsInline = true;
    fv.currentTime = 0;
    void fv.play().catch(() => {
      /* autoplay may still need a gesture — safe to ignore */
    });
  }, [focusedIndex, slides]);

  // Background music player state
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const [songIndex, setSongIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [needsMusicKickoff, setNeedsMusicKickoff] = useState(false);
  const MUSIC_VOLUME = 0.6;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCarouselIndex(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    onSelect();
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  // Ensure only the active slide's video plays (muted, looped, inline).
  useEffect(() => {
    if (!mounted) return;
    const currentSlide = slides[carouselIndex];
    const activeSrc = currentSlide
      ? carouselIndex + "-" + currentSlide.src
      : "";
    const entries = Object.entries(videoRefs.current);
    for (let k = 0; k < entries.length; k++) {
      const entry = entries[k] as [string, HTMLVideoElement | null];
      const key = entry[0];
      const v = entry[1];
      if (!v) continue;
      const isActive = key === activeSrc;
      if (isActive) {
        v.currentTime = 0;
        void v.play().catch(() => {
          /* autoplay may be blocked until user interacts */
        });
      } else {
        v.pause();
      }
    }
  }, [carouselIndex, slides, mounted]);

  useEffect(() => {
    if (!carouselApi || slides.length <= 1) return;
    const id = window.setInterval(() => {
      if (carouselApi.canScrollNext()) {
        carouselApi.scrollNext();
      } else {
        carouselApi.scrollTo(0);
      }
    }, 5200);
    return () => window.clearInterval(id);
  }, [carouselApi, slides.length]);

  // ---------- Background music behavior
  const currentSong = songs[songIndex % Math.max(songs.length, 1)];

  const handleSongEnded = useCallback(() => {
    setSongIndex((i) => (songs.length === 0 ? 0 : (i + 1) % songs.length));
  }, []);

  const playMusic = useCallback(() => {
    const a = musicAudioRef.current;
    if (!a || songs.length === 0) return;
    a.volume = MUSIC_VOLUME;
    a.muted = isMusicMuted;
    const promise = a.play();
    if (promise && typeof promise.then === "function") {
      promise.then(
        () => {
          setIsMusicPlaying(true);
          setNeedsMusicKickoff(false);
        },
        () => {
          setIsMusicPlaying(false);
          setNeedsMusicKickoff(true);
        },
      );
    }
  }, [isMusicMuted, MUSIC_VOLUME]);

  const togglePlayMusic = useCallback(() => {
    const a = musicAudioRef.current;
    if (!a || songs.length === 0) return;
    if (a.paused) {
      playMusic();
    } else {
      a.pause();
      setIsMusicPlaying(false);
    }
  }, [playMusic]);

  const nextSong = useCallback(() => {
    if (songs.length === 0) return;
    setSongIndex((i) => (i + 1) % songs.length);
  }, []);

  const prevSong = useCallback(() => {
    if (songs.length === 0) return;
    setSongIndex((i) => (i - 1 + songs.length) % songs.length);
  }, []);

  const toggleMusicMute = useCallback(() => {
    setIsMusicMuted((m) => {
      const a = musicAudioRef.current;
      const next = !m;
      if (a) a.muted = next;
      return next;
    });
  }, []);

  // When songIndex changes (next), load+play if we were already playing, or just load.
  useEffect(() => {
    const a = musicAudioRef.current;
    if (!a) return;
    if (!currentSong) {
      setIsMusicPlaying(false);
      return;
    }
    a.src = currentSong.url;
    a.load();
    a.volume = MUSIC_VOLUME;
    a.muted = isMusicMuted;
    if (mounted && isMusicPlaying) {
      void a.play().catch(() => {
      setIsMusicPlaying(false);
      setNeedsMusicKickoff(true);
    });
    }
  }, [songIndex, mounted, currentSong, MUSIC_VOLUME, isMusicMuted]);

  // Attempt autoplay on mount, but record the fact that user may need to tap if it fails.
  useEffect(() => {
    if (!mounted || songs.length === 0) return;
    const a = musicAudioRef.current;
    if (!a || !currentSong) return;
    a.src = currentSong.url;
    a.load();
    a.volume = MUSIC_VOLUME;
    a.muted = isMusicMuted;
    a.loop = false;
    void a.play().then(
      () => {
        setIsMusicPlaying(true);
        setNeedsMusicKickoff(false);
      },
      () => {
        setIsMusicPlaying(false);
        setNeedsMusicKickoff(true);
      },
    );
    return () => {
      a.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Try "kickoff" music on the first meaningful user interaction anywhere
  // (browsers block autoplay until the user interacts with the page at least once).
  useEffect(() => {
    if (!mounted || !needsMusicKickoff || songs.length === 0) return;
    let fired = false;
    const handler = (ev: Event) => {
      if (fired) return;
      fired = true;
      ev.currentTarget?.removeEventListener("pointerdown", handler as EventListener);
      playMusic();
    };
    const opts: AddEventListenerOptions = { passive: true };
    window.addEventListener("pointerdown", handler as EventListener, opts);
    return () => {
      if (!fired) window.removeEventListener("pointerdown", handler as EventListener);
    };
  }, [mounted, needsMusicKickoff, playMusic]);

  useEffect(() => {
    if (hearts.length === 0) return;
    const timer = window.setTimeout(() => setHearts([]), 2800);
    return () => window.clearTimeout(timer);
  }, [hearts]);

  const handlePress = useCallback(() => {
    setComplimentIndex((i) => (i + 1) % COMPLIMENTS.length);
    setPresses((p) => p + 1);
    const newHearts: Heart[] = Array.from({ length: 3 }, () => ({
      id: heartId.current++,
      x: 10 + Math.random() * 80,
      emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)] ?? "❤️",
    }));
    setHearts((h) => {
      return [...h.slice(-9), ...newHearts];
    });
  }, []);

  const handleJar = useCallback(() => {
    const total = NOTES.length + customNotes.length;
    if (total === 0) return;
    setNoteIndex((i) => (i === null ? 0 : (i + 1) % total));
  }, [customNotes.length]);

  const ALL_NOTES = useMemo(() => [...NOTES, ...customNotes], [customNotes]);
  const displayedNote =
    noteIndex === null ? null : (ALL_NOTES[noteIndex % ALL_NOTES.length] ?? null);
  const isDisplayedCustom =
    noteIndex === null
      ? false
      : noteIndex % ALL_NOTES.length >= NOTES.length;
  const displayedCustomIdx =
    noteIndex === null || !isDisplayedCustom
      ? -1
      : noteIndex % ALL_NOTES.length - NOTES.length;

  // Load custom notes from localStorage on mount
  useEffect(() => {
    if (!mounted) return;
    try {
      const raw = localStorage.getItem("reabetsoe_custom_notes");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCustomNotes(
            parsed.filter((x) => typeof x === "string" && x.trim().length > 0),
          );
        }
      }
    } catch {
      /* ignore storage errors */
    }
  }, [mounted]);

  // Persist custom notes whenever they change
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("reabetsoe_custom_notes", JSON.stringify(customNotes));
    } catch {
      /* ignore storage errors */
    }
  }, [customNotes, mounted]);

  const addCustomNote = useCallback(() => {
    const text = customNoteDraft.trim();
    if (text.length === 0) return;
    setCustomNotes((prev) => [...prev, text]);
    setCustomNoteDraft("");
    setShowCustomNoteForm(false);
  }, [customNoteDraft]);

  const deleteCustomNote = useCallback(
    (idx: number) => {
      setCustomNotes((prev) => prev.filter((_, i) => i !== idx));
      if (displayedCustomIdx === idx) {
        setNoteIndex(null);
      }
    },
    [displayedCustomIdx],
  );

  // ---------- Download (Focus mode) ----------
  const triggerDownload = useCallback((href: string, filename: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const downloadClipOnly = useCallback(async () => {
    if (!focusedSlide || focusedSlide.kind !== "video") return;
    try {
      const resp = await fetch(focusedSlide.src);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `reabetsoe-clip-${focusedIndex ?? 0}.mp4`);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch {
      triggerDownload(focusedSlide.src, `reabetsoe-clip-${focusedIndex ?? 0}.mp4`);
    }
  }, [focusedSlide, focusedIndex, triggerDownload]);

  const downloadCard = useCallback(async () => {
    if (!focusedSlide) return;
    const cardEl = downloadCardRef.current;
    if (!cardEl) return;

    // Screenshot the actual rendered glass card — so the PNG is pixel-perfect
    // identical to what she sees on screen (same rounded corners, glass ring,
    // lavender/rose tints, wrapped message, badges, etc.)
    // Works for both photos AND videos: html2canvas will paint the video's
    // current frame onto the canvas, so the message card gets appended to
    // video clips the exact same way it does for photos.
    try {
      const scale = 2; // crisp 2x retina PNG
      const canvas = (await html2canvas(cardEl, {
        backgroundColor: null, // keep the card's own bg + transparency around it
        scale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        ignoreElements: (el: Element) => {
          // Skip the 3 header action pills (Download / Film / Close) so the
          // keepsake doesn't have UI buttons baked in. Keep the era-counter pill.
          if (!(el instanceof HTMLElement)) return false;
          const aria = el.getAttribute("aria-label") ?? "";
          if (
            aria === "Download this card as a keepsake PNG (matches what you see)" ||
            aria === "Download just the video clip (MP4, no message card)" ||
            aria === "Close"
          ) {
            return true;
          }
          return false;
        },
      })) as HTMLCanvasElement;

      // If she opened this on a video, paint a subtle "· clip" badge under
      // the photo area (matching the DOM label) so the PNG clearly conveys
      // "this was a video, with the message card."
      const png = canvas.toDataURL("image/png");
      triggerDownload(png, `for-reabetsoe-${focusedIndex ?? 0}-${focusedSlide.era}.png`);
    } catch (err) {
      // html2canvas can fail on some video CORS setups. Fallback: if it's an
      // image, at least download the raw photo. If it's a video, fall back to
      // the MP4. The user primarily wants "the card + message", and only in
      // extreme browser CORS cases does this gracefully degrade.
      console.warn("Card PNG capture failed, using fallback", err);
      if (focusedSlide.kind === "video") {
        void downloadClipOnly();
      } else {
        triggerDownload(focusedSlide.src, `for-reabetsoe-${focusedIndex ?? 0}-${focusedSlide.era}.png`);
      }
    }
  }, [focusedSlide, focusedIndex, triggerDownload, downloadClipOnly]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-night-1 via-night-2 to-night-3 font-body text-foreground">
      {/* starfield */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {STARS.map((star, i) => (
          <span
            key={i}
            className="star"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      {/* soft glowing orbs */}
      <div
        className="drift pointer-events-none absolute -top-24 right-10 size-72 rounded-full bg-lav/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="drift pointer-events-none absolute top-1/3 -left-20 size-80 rounded-full bg-rose/20 blur-3xl"
        style={{ animationDelay: "2s" }}
        aria-hidden="true"
      />
      <div
        className="drift pointer-events-none absolute bottom-0 right-1/4 size-96 rounded-full bg-gold/15 blur-3xl"
        style={{ animationDelay: "4s" }}
        aria-hidden="true"
      />

      {/* HERO */}
      <section className="relative px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-glass px-4 py-1.5 ring-1 ring-glass-ring backdrop-blur-md">
            <span className="text-sm text-rose">✦</span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              A little care package
            </span>
          </div>
          <h1 className="font-display text-5xl font-medium leading-tight text-balance sm:text-6xl">
            Hi{" "}
            <span className="font-hand text-6xl text-rose sm:text-7xl">
              Reabetsoe
            </span>
            ,
          </h1>
          <p className="mt-6 max-w-[40ch] text-lg text-pretty text-foreground/80">
            I made this just for you. Just a quiet place to remember how loved
            and capable you are.
          </p>
          <p className="mt-4 font-hand text-2xl text-gold">
            mabhabha, sthandwa sam, my minxi, my pookie ❤️
          </p>
        </div>
      </section>

      {/* COMPLIMENT BUTTON */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-xl">
          <div className="relative rounded-[28px] bg-glass p-8 ring-1 ring-glass-ring backdrop-blur-xl sm:p-10">
            {/* floating hearts */}
            <div className="pointer-events-none absolute inset-x-8 bottom-16 h-40" aria-hidden="true">
              {hearts.map((heart) => (
                <span
                  key={heart.id}
                  className="heart-float"
                  style={{ left: `${heart.x}%`, bottom: "0" }}
                >
                  {heart.emoji}
                </span>
              ))}
            </div>

            <p className="text-center text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Press whenever you need it
            </p>
            <div className="mt-6 flex flex-col items-center">
              <button
                onClick={handlePress}
                className="rounded-full bg-gradient-to-r from-rose to-rose-deep px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-rose/30 ring-1 ring-rose/40 transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              >
                Give me a reason to smile
              </button>
              <div className="mt-8 min-h-[92px] w-full rounded-2xl bg-glass p-6 text-center ring-1 ring-glass-ring backdrop-blur-md" suppressHydrationWarning>
                <p key={complimentIndex} className="note-in font-hand text-2xl leading-snug text-gold">
                  {COMPLIMENTS[complimentIndex]}
                </p>
              </div>
              {presses > 0 && (
                <div className="mt-4 text-center" suppressHydrationWarning>
                  <p className="note-in font-hand text-xl text-rose">
                    love you, {PET_NAMES[(presses - 1) % PET_NAMES.length]}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                    {presses} {presses === 1 ? "little hug" : "little hugs"} collected
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PANDA HUG */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-xl text-center">
          <div className="rounded-[28px] bg-glass p-8 ring-1 ring-glass-ring backdrop-blur-xl sm:p-10">
            <img
              src={pandaHug}
              alt="A sleepy panda getting the warmest hug from a little bunny"
              width={1024}
              height={1024}
              loading="lazy"
              className="panda-bob mx-auto w-52 sm:w-64"
            />
            <p className="mt-4 font-hand text-2xl leading-snug text-rose">
              Squeeze. This is a hug from me, mabhabha.
            </p>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">
              Whenever you need one and I'm not around, come right here.
            </p>
          </div>
        </div>
      </section>

      {/* HER JOURNEY — alternating picture carousel */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-3xl font-medium text-balance text-foreground/90">
                Her journey
              </h2>
              <p className="mt-2 max-w-[40ch] text-pretty text-muted-foreground">
                The little girl you were, and the woman she became. Every slide
                for her, and for you.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-glass px-4 py-1.5 ring-1 ring-glass-ring backdrop-blur-md">
              <Sparkles className="size-4 text-gold" />
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                auto-play · tap arrows to move
              </span>
            </div>
          </div>

          <div className="relative rounded-[28px] bg-glass p-5 ring-1 ring-glass-ring backdrop-blur-xl sm:p-7">
            {!mounted ? (
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 sm:items-center">
                <div className="aspect-[4/3] w-full animate-pulse rounded-[22px] bg-glass-strong ring-1 ring-glass-ring" />
                <div className="flex flex-col gap-4">
                  <div className="h-32 animate-pulse rounded-2xl bg-glass-strong ring-1 ring-glass-ring" />
                  <div className="h-8 w-2/3 animate-pulse rounded-lg bg-glass-strong" />
                </div>
              </div>
            ) : (
            <Carousel
              setApi={setCarouselApi}
              opts={{ loop: false, align: "start" }}
              className="w-full"
            >
              <CarouselContent className="-ml-0">
                {slides.map((slide, i) => (
                  <CarouselItem
                    key={`${slide.era}-${i}-${slide.src}`}
                    className="pl-0"
                  >
                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 sm:items-center">
                      <div className="relative overflow-hidden rounded-[22px] ring-1 ring-glass-ring shadow-2xl shadow-black/30">
                        <div
                          className={cn(
                            "absolute inset-0 -z-10 blur-3xl opacity-60",
                            slide.era === "young"
                              ? "bg-lav/50"
                              : "bg-rose/40",
                          )}
                        />
                        {mediaError[slide.src] ? (
                          <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-glass-strong text-center p-6">
                            <Heart
                              className={cn(
                                "size-10",
                                slide.era === "young"
                                  ? "text-lav"
                                  : "text-rose",
                              )}
                              fill="currentColor"
                            />
                            <p className="font-hand text-xl text-foreground/70">
                              Drop your {slide.kind === "video" ? "clip" : "photo"} here, minxi ❤️
                            </p>
                          </div>
                        ) : slide.kind === "video" ? (
                          <div className="relative aspect-[4/3] w-full bg-black/40 group">
                            <button
                              type="button"
                              onClick={() => openFocus(i)}
                              className="block w-full h-full text-left cursor-zoom-in"
                              aria-label={`Enlarge ${slide.label} — Reabetsoe`}
                            >
                              <video
                                key={`${i}-${slide.src}`}
                                ref={(el) => {
                                  videoRefs.current[`${i}-${slide.src}`] = el;
                                }}
                                src={slide.src}
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                onError={() =>
                                  setMediaError((m) => ({
                                    ...m,
                                    [slide.src]: true,
                                  }))
                                }
                                poster=""
                                className="aspect-[4/3] w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                aria-label={`${slide.label} — Reabetsoe`}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => openFocus(i)}
                              className="absolute bottom-3 right-3 grid size-8 place-items-center rounded-full bg-black/55 text-white/90 ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-rose/80 hover:text-white active:scale-95"
                              aria-label={`Enlarge ${slide.label}`}
                            >
                              <Maximize2 className="size-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative aspect-[4/3] w-full group">
                            <button
                              type="button"
                              onClick={() => openFocus(i)}
                              className="block w-full h-full text-left cursor-zoom-in"
                              aria-label={`Enlarge ${slide.label} — Reabetsoe`}
                            >
                              <img
                                src={slide.src}
                                alt={`${slide.label} — Reabetsoe`}
                                loading="lazy"
                                onError={() =>
                                  setMediaError((m) => ({
                                    ...m,
                                    [slide.src]: true,
                                  }))
                                }
                                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => openFocus(i)}
                              className="absolute bottom-3 right-3 grid size-8 place-items-center rounded-full bg-black/55 text-white/90 ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-rose/80 hover:text-white active:scale-95"
                              aria-label={`Enlarge ${slide.label}`}
                            >
                              <Maximize2 className="size-3.5" />
                            </button>
                          </div>
                        )}
                        <span
                          className={cn(
                            "absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] backdrop-blur-md",
                            slide.era === "young"
                              ? "bg-lav/30 text-lav ring-1 ring-lav/40"
                              : "bg-rose/30 text-rose ring-1 ring-rose/40",
                          )}
                        >
                          {slide.era === "young" ? (
                            <>
                              <span>✦</span> younger you
                            </>
                          ) : (
                            <>
                              <Heart
                                className="size-3"
                                fill="currentColor"
                              />
                              you, now
                            </>
                          )}
                        </span>
                        {slide.isPlaceholder && (
                          <span className="absolute bottom-3 right-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white/90 backdrop-blur-sm ring-1 ring-white/10">
                            placeholder · replace with yours
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col justify-center gap-4">
                        <div
                          className={cn(
                            "rounded-2xl p-5 ring-1 ring-glass-ring backdrop-blur-md",
                            slide.era === "young"
                              ? "bg-lav/10"
                              : "bg-rose/10",
                          )}
                        >
                          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            Slide {i + 1} of {slides.length}
                          </p>
                          <p
                            className={cn(
                              "mt-3 font-hand text-3xl leading-tight sm:text-4xl",
                              slide.era === "young"
                                ? "text-lav"
                                : "text-rose",
                            )}
                          >
                            "{slide.message}"
                          </p>
                        </div>
                        <p className="font-hand text-xl text-gold">
                          — for {slide.label.toLowerCase()}, always
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <button
                onClick={() => carouselApi?.scrollPrev()}
                className="group absolute -left-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-glass-strong text-foreground ring-1 ring-glass-ring backdrop-blur-xl transition-all hover:scale-105 hover:bg-rose/30 hover:text-white active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-glass-strong disabled:hover:text-foreground sm:-left-5"
                aria-label="Previous slide"
                disabled={carouselIndex === 0}
              >
                <ChevronLeft className="size-5 transition-transform group-hover:-translate-x-0.5" />
              </button>
              <button
                onClick={() => carouselApi?.scrollNext()}
                className="group absolute -right-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-glass-strong text-foreground ring-1 ring-glass-ring backdrop-blur-xl transition-all hover:scale-105 hover:bg-rose/30 hover:text-white active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-glass-strong disabled:hover:text-foreground sm:-right-5"
                aria-label="Next slide"
                disabled={carouselIndex === slides.length - 1}
              >
                <ChevronRight className="size-5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </Carousel>
            )}

            {/* progress dots */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {slides.map((slide, i) => (
                <button
                  key={i}
                  onClick={() => carouselApi?.scrollTo(i)}
                  aria-label={`Go to slide ${i + 1}: ${slide.label}`}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    carouselIndex === i
                      ? slide.era === "young"
                        ? "w-8 bg-lav"
                        : "w-8 bg-rose"
                      : "w-2 bg-white/25 hover:bg-white/45",
                  )}
                />
              ))}
            </div>


          </div>
        </div>
      </section>

      {/* ENCOURAGEMENT NOTES */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl font-medium text-balance text-foreground/90">
                A jar of little notes
              </h2>
              <p className="mt-2 max-w-[40ch] text-pretty text-muted-foreground">
                Tap the jar to pull out one at a time. Drop your own little
                love-notes in whenever you want — they stay with you.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCustomNoteForm((v) => !v)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ring-1 backdrop-blur-md transition",
                showCustomNoteForm
                  ? "bg-mint/25 text-mint ring-mint/40 hover:bg-mint/30"
                  : "bg-glass text-foreground/85 ring-glass-ring hover:bg-glass-strong",
              )}
            >
              <Sparkles className="size-3.5" />
              {showCustomNoteForm ? "Hide the note-pad" : "Drop your own note 💕"}
            </button>
          </div>

          {showCustomNoteForm && (
            <div className="mt-6 rounded-[24px] bg-glass p-5 ring-1 ring-glass-ring backdrop-blur-xl sm:p-6 note-in" suppressHydrationWarning>
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Write a little note for future-you to find 🌱
              </label>
              <textarea
                value={customNoteDraft}
                onChange={(e) => setCustomNoteDraft(e.target.value)}
                rows={3}
                placeholder="e.g. You did so much better than you think today. I'm proud of you, minxi."
                className="mt-3 w-full resize-none rounded-2xl bg-glass-strong p-4 text-base leading-relaxed text-foreground/90 ring-1 ring-glass-ring placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-rose/40"
              />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  💾 Saved to this browser. It'll still be here tomorrow.
                </p>
                <button
                  type="button"
                  onClick={addCustomNote}
                  disabled={customNoteDraft.trim().length === 0}
                  className="rounded-full bg-gradient-to-r from-rose to-rose-deep px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-lg shadow-rose/30 ring-1 ring-rose/40 transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0 disabled:shadow-none"
                >
                  Tuck it into the jar ✦
                </button>
              </div>

              {customNotes.length > 0 && (
                <div className="mt-6 border-t border-glass-ring pt-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      Your notes · {customNotes.length} tucked in
                    </p>
                  </div>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {customNotes.map((note, i) => (
                      <li
                        key={`cn-${i}-${note.length}`}
                        className="group flex items-start gap-2 rounded-2xl bg-glass-strong p-3 ring-1 ring-glass-ring"
                      >
                        <p className="flex-1 pt-1 text-sm leading-relaxed text-foreground/85 line-clamp-4 font-hand text-lg">
                          "{note}"
                        </p>
                        <button
                          type="button"
                          onClick={() => deleteCustomNote(i)}
                          className="shrink-0 grid size-8 place-items-center rounded-full text-foreground/35 ring-1 ring-transparent transition hover:bg-rose/15 hover:text-rose hover:ring-rose/30"
                          aria-label={`Delete note ${i + 1}`}
                          title="Remove this note from the jar"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:items-start">
            {/* the jar */}
            <div className="shrink-0">
              <button
                onClick={handleJar}
                className="group relative grid size-40 place-items-center rounded-[32px] bg-glass ring-1 ring-glass-ring backdrop-blur-xl transition-transform duration-200 hover:-translate-y-1 active:scale-95"
                aria-label="Pull a note from the jar"
              >
                <span
                  className="relative block size-20 transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                >
                  {/* lid */}
                  <span className="absolute inset-x-3 top-0 h-3 rounded-md bg-lav/70 shadow-sm" />
                  {/* body */}
                  <span className="absolute inset-x-1 top-4 bottom-0 rounded-b-2xl rounded-t-lg bg-white/15 ring-1 ring-white/25" />
                  {/* paper slips inside */}
                  <span className="absolute bottom-2 left-3 h-7 w-3 rotate-[-14deg] rounded-sm bg-rose/80" />
                  <span className="absolute bottom-2 left-6 h-8 w-3 rotate-[10deg] rounded-sm bg-gold/80" />
                  <span className="absolute bottom-2 left-9 h-7 w-3 rotate-[-6deg] rounded-sm bg-mint/80" />
                  <span className="absolute bottom-2 left-12 h-6 w-2.5 rotate-[18deg] rounded-sm bg-lav/80" />
                </span>
                <span className="absolute -bottom-2 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-accent-foreground shadow-md">
                  {noteIndex === null ? "Tap me" : "Another one"}
                </span>
              </button>
            </div>
            {/* revealed note */}
            <div className="w-full max-w-xs">
              <div className="min-h-[132px] rounded-[20px] bg-glass-strong p-6 ring-1 ring-glass-ring backdrop-blur-xl" suppressHydrationWarning>
                {noteIndex === null || displayedNote === null ? (
                  <p className="pt-4 text-center font-hand text-2xl leading-snug text-foreground/50">
                    {ALL_NOTES.length > 0
                      ? `${ALL_NOTES.length} little notes are waiting for you…`
                      : "tuck a note in above, and it'll live here forever 🌱"}
                  </p>
                ) : (
                  <div key={noteIndex} className="note-in relative">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "text-xs font-medium uppercase tracking-[0.15em]",
                          isDisplayedCustom ? "text-rose" : "text-mint",
                        )}
                      >
                        {isDisplayedCustom
                          ? `Your note · ${displayedCustomIdx + 1} of ${customNotes.length}`
                          : `Note ${(noteIndex % ALL_NOTES.length) + 1} of ${ALL_NOTES.length}`}
                      </span>
                      {isDisplayedCustom && displayedCustomIdx >= 0 && (
                        <button
                          type="button"
                          onClick={() => deleteCustomNote(displayedCustomIdx)}
                          className="grid size-7 place-items-center rounded-full text-foreground/35 ring-1 ring-transparent transition hover:bg-rose/15 hover:text-rose hover:ring-rose/30"
                          aria-label="Delete this note"
                          title="Remove this note from the jar"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="mt-3 font-hand text-2xl leading-snug text-foreground/90">
                      "{displayedNote}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LETTER */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-xl">
          <div className="rounded-[28px] bg-glass p-8 ring-1 ring-glass-ring backdrop-blur-xl sm:p-10">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-rose/30 text-lg ring-1 ring-rose/40">
                💌
              </span>
              <span className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                A letter, sealed for you
              </span>
            </div>
            <p className="font-hand text-2xl leading-relaxed text-foreground/90">
              My dearest Reabetsoe, sthandwa sam,
            </p>
            <p className="mt-4 text-base leading-relaxed text-pretty text-foreground/75">
              I know the future can feel like a big, uncertain thing right now.
              But I've watched you work, laugh, and care for people in ways
              that still stop me mid-sentence. Success isn't a single finish
              line you have to reach on schedule. It's the person you're
              becoming, and that person is already someone I'm proud of.
            </p>
            <p className="mt-4 text-base leading-relaxed text-pretty text-foreground/75">
              Whatever comes, you don't have to carry it alone. I'm right here,
              and I believe in you more than you'll ever know.
            </p>
            <p className="mt-8 font-hand text-3xl text-rose">
              Always yours,
              <br />
              Divine ❤️
            </p>
          </div>
        </div>
      </section>

      {/* FUTURE IS BRIGHT */}
      <section className="relative px-6 pb-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-gold/20 text-3xl ring-1 ring-gold/40">
            🌅
          </div>
          <h2 className="font-display text-4xl font-medium leading-tight text-balance text-foreground sm:text-5xl">
            Your future is bright, mabhabha.
          </h2>
          <p className="mx-auto mt-6 max-w-[40ch] text-lg text-pretty text-foreground/75" suppressHydrationWarning>
            Not because it's guaranteed, but because you are the kind of
            person who makes good things happen. And you are not alone in it,
            minxi.
          </p>
        </div>
      </section>

      {/* floating music player pill */}
      {mounted ? (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0">
          <div className="flex w-[min(92vw,22rem)] items-center gap-3 rounded-full bg-glass-strong px-3 py-2.5 ring-1 ring-glass-ring backdrop-blur-2xl shadow-2xl shadow-black/40">
            <div
              className={cn(
                "relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full ring-1",
                isMusicPlaying
                  ? "bg-rose/30 text-white ring-rose/50"
                  : "bg-night-2 text-foreground ring-glass-ring",
              )}
            >
              <Music2
                className={cn(
                  "size-4.5",
                  isMusicPlaying ? "animate-pulse text-rose" : "",
                )}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                {songs.length > 0 ? (
                  <>
                    {songIndex + 1} / {songs.length} · now playing
                  </>
                ) : (
                  "drop songs into the folder below"
                )}
              </p>
              <p className="truncate text-sm font-semibold text-foreground/90">
                {songs.length > 0
                  ? currentSong?.name ?? "A song for you"
                  : "Add your favorite songs ❤️"}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={prevSong}
                disabled={songs.length === 0}
                className="grid size-9 place-items-center rounded-full text-foreground/80 transition hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent"
                aria-label="Previous song"
              >
                <SkipBack className="size-4" />
              </button>
              <button
                type="button"
                onClick={togglePlayMusic}
                disabled={songs.length === 0}
                className="grid size-9 place-items-center rounded-full bg-rose text-white shadow-lg shadow-rose/30 transition hover:scale-105 hover:bg-rose/90 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                aria-label={
                  isMusicPlaying ? "Pause music" : "Play music"
                }
                title={
                  needsMusicKickoff
                    ? "Tap here to start the music"
                    : undefined
                }
              >
                {isMusicPlaying ? (
                  <Pause className="size-4" fill="currentColor" />
                ) : (
                  <Play className="size-4 translate-x-[1px]" fill="currentColor" />
                )}
              </button>
              <button
                type="button"
                onClick={nextSong}
                disabled={songs.length === 0}
                className="grid size-9 place-items-center rounded-full text-foreground/80 transition hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent"
                aria-label="Next song"
              >
                <SkipForward className="size-4" />
              </button>
              <button
                type="button"
                onClick={toggleMusicMute}
                className="grid size-9 place-items-center rounded-full text-foreground/80 transition hover:bg-white/10 hover:text-white active:scale-95"
                aria-label={
                  isMusicMuted ? "Unmute music" : "Mute music"
                }
              >
                {isMusicMuted ? (
                  <VolumeX className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </button>
            </div>
          </div>

          {needsMusicKickoff && songs.length > 0 ? (
            <p className="mx-auto mt-2 max-w-[22rem] rounded-full bg-gold/15 px-3 py-1.5 text-center text-[11px] font-semibold text-gold ring-1 ring-gold/30 backdrop-blur-xl">
              ✦ Tap anywhere (or the play button) to start the soundtrack for your journey
            </p>
          ) : null}
        </div>
      ) : null}

      {/* hidden background music audio — purely client-side, no SSR */}
      {mounted ? (
        <audio
          ref={musicAudioRef}
          onEnded={handleSongEnded}
          onPlay={() => setIsMusicPlaying(true)}
          onPause={() => setIsMusicPlaying((p) => (musicAudioRef.current?.ended ? p : false))}
          preload="metadata"
          crossOrigin="anonymous"
          suppressHydrationWarning
        />
      ) : null}

      {/* ---------- Focus / Enlarge view ---------- */}
      {mounted && focusedSlide && focusedIndex !== null ? (
        <div
          className="fixed inset-0 z-[100] isolate overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={`Enlarged ${focusedSlide.label}`}
        >
          <button
            type="button"
            onClick={closeFocus}
            aria-label="Close enlarged view"
            className="fixed inset-0 z-0 bg-black/75 backdrop-blur-xl"
          >
            <span
              className={cn(
                "pointer-events-none absolute -z-10 block blur-[120px] opacity-70",
                focusedSlide.era === "young" ? "bg-lav/70" : "bg-rose/70",
              )}
              aria-hidden="true"
              style={{
                top: "18%",
                left: "12%",
                width: "40vw",
                height: "40vw",
                borderRadius: "9999px",
              }}
            />
            <span
              className={cn(
                "pointer-events-none absolute -z-10 block blur-[120px] opacity-60",
                focusedSlide.era === "young" ? "bg-rose/50" : "bg-gold/50",
              )}
              aria-hidden="true"
              style={{
                bottom: "10%",
                right: "8%",
                width: "36vw",
                height: "36vw",
                borderRadius: "9999px",
              }}
            />
          </button>

          <div className="relative z-10 min-h-full w-full px-4 py-8 sm:px-8 sm:py-12 flex items-center justify-center">
            <div
              ref={downloadCardRef}
              className={cn(
                "relative mx-auto w-full max-w-5xl rounded-[32px] border border-white/10 bg-glass/95 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.65)] ring-1 backdrop-blur-2xl",
                focusedSlide.era === "young" ? "ring-lav/30" : "ring-rose/30",
              )}
            >
              <div className="flex items-center justify-between px-5 pt-5 sm:px-7 sm:pt-7">
                <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10 backdrop-blur-md">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]",
                      focusedSlide.era === "young" ? "text-lav" : "text-rose",
                    )}
                  >
                    {focusedSlide.era === "young" ? (
                      <>
                        <span>✦</span> younger you
                      </>
                    ) : (
                      <>
                        <Heart className="size-3" fill="currentColor" />
                        you, now
                      </>
                    )}
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
                    · {focusedIndex + 1} of {slides.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={downloadCard}
                    className="grid size-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-gold/70 hover:text-accent-foreground active:scale-95"
                    aria-label="Download this card as a keepsake PNG (matches what you see)"
                    title="Download card · PNG keepsake (exactly as shown)"
                  >
                    <Download className="size-4.5" />
                  </button>
                  {focusedSlide?.kind === "video" ? (
                    <button
                      type="button"
                      onClick={downloadClipOnly}
                      className="grid size-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-mint/70 hover:text-accent-foreground active:scale-95"
                      aria-label="Download just the video clip (MP4, no message card)"
                      title="Download the clip · MP4"
                    >
                      <Film className="size-4.5" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={closeFocus}
                    className="grid size-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-rose/80 hover:text-white active:scale-95"
                    aria-label="Close"
                    title="Close (Esc)"
                  >
                    <X className="size-4.5" />
                  </button>
                </div>
              </div>

              <div className="grid gap-6 px-5 pb-7 pt-6 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] sm:gap-8 sm:px-7 sm:pb-9 sm:pt-6 sm:items-center">
                <div
                  className={cn(
                    "relative mx-auto w-full overflow-hidden rounded-[26px] ring-1 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.6)]",
                    focusedSlide.era === "young" ? "ring-lav/40" : "ring-rose/40",
                  )}
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 -z-10 blur-3xl opacity-70",
                      focusedSlide.era === "young" ? "bg-lav/50" : "bg-rose/50",
                    )}
                    aria-hidden="true"
                  />
                  {mediaError[focusedSlide.src] ? (
                    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-glass-strong text-center p-10">
                      <Heart
                        className={cn(
                          "size-12",
                          focusedSlide.era === "young" ? "text-lav" : "text-rose",
                        )}
                        fill="currentColor"
                      />
                      <p className="font-hand text-2xl text-white/80">
                        Drop your {focusedSlide.kind === "video" ? "clip" : "photo"} here, minxi ❤️
                      </p>
                    </div>
                  ) : focusedSlide.kind === "video" ? (
                    <div className="relative aspect-[4/3] w-full bg-black/50">
                      <video
                        ref={focusedVideoRef}
                        src={focusedSlide.src}
                        muted
                        loop
                        playsInline
                        preload="auto"
                        poster=""
                        onError={() =>
                          setMediaError((m) => ({
                            ...m,
                            [focusedSlide.src]: true,
                          }))
                        }
                        className="aspect-[4/3] w-full h-full object-cover"
                        aria-label={`${focusedSlide.label} — Reabetsoe (enlarged)`}
                      />
                    </div>
                  ) : (
                    <img
                      src={focusedSlide.src}
                      alt={`${focusedSlide.label} — Reabetsoe (enlarged)`}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  )}
                </div>

                <div className="flex flex-col gap-5">
                  <div
                    className={cn(
                      "relative rounded-[24px] p-6 ring-1 backdrop-blur-xl sm:p-8",
                      focusedSlide.era === "young"
                        ? "bg-lav/15 ring-lav/30"
                        : "bg-rose/15 ring-rose/30",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute -top-3.5 left-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md ring-1",
                        focusedSlide.era === "young"
                          ? "bg-lav/35 text-lav ring-lav/50"
                          : "bg-rose/35 text-rose ring-rose/50",
                      )}
                    >
                      {focusedSlide.era === "young" ? (
                        <>
                          <span>✦</span> just for her
                        </>
                      ) : (
                        <>
                          <Heart className="size-3" fill="currentColor" />
                          just for you
                        </>
                      )}
                    </span>
                    <p className="pt-4 text-xs font-medium uppercase tracking-[0.22em] text-white/55">
                      {focusedSlide.kind === "video"
                        ? `${focusedSlide.label.toLowerCase()} · clip`
                        : focusedSlide.label.toLowerCase()}
                    </p>
                    <p
                      className={cn(
                        "mt-4 font-hand leading-[1.05] text-balance",
                        focusedSlide.era === "young"
                          ? "text-5xl sm:text-6xl text-lav"
                          : "text-5xl sm:text-6xl text-rose",
                      )}
                    >
                      "{focusedSlide.message}"
                    </p>
                    <p className="mt-6 font-hand text-2xl sm:text-3xl text-gold">
                      — for {focusedSlide.label.toLowerCase()}, always.
                    </p>
                  </div>
                  <p className="max-w-[40ch] text-sm/relaxed text-pretty text-white/70">
                    Press{" "}
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 ring-1 ring-white/15">
                      Esc
                    </span>
                    , or click anywhere dim to close and go back to her journey. The soundtrack keeps playing softly for you 💕
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="relative flex items-center justify-center border-t border-glass-ring px-6 py-6 pb-8 sm:px-10 sm:pb-20">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          made with love
        </span>
      </footer>
    </div>
  );
}
