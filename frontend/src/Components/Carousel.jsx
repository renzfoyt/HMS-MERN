import React, { useState, useEffect, useRef, useCallback } from "react";

// slides: array of { type: 'image' | 'video', src, alt? }
const Carousel = ({
  slides = [],
  autoPlayInterval = 5000,
  height = "50vh",
  title,
  subtitle,
}) => {
  // The normal carousel (autoplay, arrows, dots) only ever cycles through
  // image slides — the video slide is excluded from that rotation
  // entirely. `imagePointer` tracks position within that image-only list.
  const imageIndices = slides.reduce((acc, slide, index) => {
    if (slide.type !== "video") acc.push(index);
    return acc;
  }, []);
  const videoSlideIndex = slides.findIndex((s) => s.type === "video");

  const [imagePointer, setImagePointer] = useState(0);
  // videoMode: true only while the video slide is actively shown — the
  // only way in is the "Watch Video" button, never autoplay/arrows/dots.
  const [videoMode, setVideoMode] = useState(false);
  const [loadedIndices, setLoadedIndices] = useState(() => new Set([0]));
  const timerRef = useRef(null);
  const videoRefs = useRef([]);

  const current = videoMode ? videoSlideIndex : (imageIndices[imagePointer] ?? 0);

  useEffect(() => {
    setLoadedIndices((prev) => {
      if (prev.has(current)) return prev;
      const next = new Set(prev);
      next.add(current);
      return next;
    });
  }, [current]);

  // Arrows / dots — image-only navigation, always drops out of video mode.
  const goToImage = useCallback(
    (pointerIndex) => {
      setVideoMode(false);
      const len = imageIndices.length;
      if (len === 0) return;
      setImagePointer(((pointerIndex % len) + len) % len);
    },
    [imageIndices.length],
  );

  const nextImage = useCallback(
    () => goToImage(imagePointer + 1),
    [goToImage, imagePointer],
  );
  const prevImage = useCallback(
    () => goToImage(imagePointer - 1),
    [goToImage, imagePointer],
  );

  // The ONLY entry point into the video slide.
  const watchVideo = useCallback(() => {
    if (videoSlideIndex === -1) return;
    setLoadedIndices((prevSet) => {
      if (prevSet.has(videoSlideIndex)) return prevSet;
      const nextSet = new Set(prevSet);
      nextSet.add(videoSlideIndex);
      return nextSet;
    });
    setVideoMode(true);
  }, [videoSlideIndex]);

  // Exit the video (button, or the video finishing on its own) — return
  // to the image carousel and continue forward.
  const exitVideo = useCallback(() => {
    setVideoMode(false);
    nextImage();
  }, [nextImage]);

  // Autoplay timer — image slides only, paused while video is engaged.
  useEffect(() => {
    if (imageIndices.length <= 1 || videoMode) return;
    timerRef.current = setInterval(() => {
      setImagePointer((p) => (p + 1) % imageIndices.length);
    }, autoPlayInterval);
    return () => clearInterval(timerRef.current);
  }, [imagePointer, imageIndices.length, autoPlayInterval, videoMode]);

  // Drives actual play/pause/mute state on the <video> element.
  useEffect(() => {
    videoRefs.current.forEach((videoEl, index) => {
      if (!videoEl) return;
      if (index === current && videoMode) {
        videoEl.muted = false;
        videoEl.currentTime = 0;
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      } else {
        videoEl.pause();
        videoEl.muted = true;
      }
    });
  }, [current, videoMode, loadedIndices]);

  if (!slides.length) return null;

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative w-full bg-black" style={{ height }}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === current
                ? "opacity-100 z-10"
                : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {!loadedIndices.has(index) ? (
              <div className="h-full w-full bg-black" />
            ) : slide.type === "video" ? (
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                muted={!(index === current && videoMode)}
                controls={index === current && videoMode}
                playsInline
                disablePictureInPicture
                preload={index === current ? "auto" : "metadata"}
                className="h-full w-full object-cover"
                onEnded={exitVideo}
              >
                {slide.webmSrc && (
                  <source src={slide.webmSrc} type="video/webm" />
                )}
                <source src={slide.src} type="video/mp4" />
              </video>
            ) : (
              <img
                src={slide.src}
                alt={slide.alt || `Slide ${index + 1}`}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={index === 0 ? "high" : "auto"}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {/* Dark tint overlay — hidden while the video is actively playing */}
      {!videoMode && (
        <div className="absolute inset-0 z-[15] bg-green-950/60 pointer-events-none"></div>
      )}

      {/* Standalone centered text — hidden during active video playback */}
      {(title || subtitle) && !videoMode && (
        <div className="absolute inset-0 z-[16] flex flex-col items-center justify-center px-6 text-center pointer-events-none">
          {title && (
            <h2 className="text-2xl font-bold text-white drop-shadow-md sm:text-4xl md:text-5xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2 text-sm text-white/90 drop-shadow-md sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Watch Video button — the only way into the video slide */}
      {videoSlideIndex !== -1 && !videoMode && (
        <button
          type="button"
          onClick={watchVideo}
          className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-green-800 shadow-lg transition-colors hover:bg-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.34-5.89a1.5 1.5 0 000-2.54L6.3 2.84z" />
          </svg>
          Watch our video
        </button>
      )}

      {/* Exit Video button — the only way out of the video slide, besides
          it finishing on its own */}
      {videoMode && (
        <button
          type="button"
          onClick={exitVideo}
          aria-label="Exit video and return to carousel"
          className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-black/70"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Exit Video
        </button>
      )}

      {/* Arrows — image slides only */}
      {imageIndices.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevImage}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={nextImage}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dots — image slides only */}
      {imageIndices.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {imageIndices.map((_, pointerIdx) => (
            <button
              key={pointerIdx}
              type="button"
              onClick={() => goToImage(pointerIdx)}
              aria-label={`Go to slide ${pointerIdx + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                !videoMode && pointerIdx === imagePointer
                  ? "bg-white"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;