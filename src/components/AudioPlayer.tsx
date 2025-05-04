// File: components/AudioPlayer.tsx
import React, { useEffect, useRef, useState } from "react";

export type MusicItem = {
    id: number;
    title: string;
    artist: string;
    album?: string;
    music_url: string;
    cover_url?: string;
    pin: number;
};

interface AudioPlayerProps {
    track: MusicItem;
    next: () => void;
    previous: () => void;
    autoPlay?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ track, autoPlay = false, previous, next }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [fullView, setFullView] = useState<boolean>(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const onTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => {
            setIsPlaying(false);
            next(); // Call next when audio ends
        };


        audio.addEventListener("loadedmetadata", onLoadedMetadata);
        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);
        audio.addEventListener("ended", onEnded);

        if (autoPlay) {
            audio.play().catch((e) => {
                console.warn("Autoplay failed:", e);
            });
        }

        return () => {
            audio.removeEventListener("loadedmetadata", onLoadedMetadata);
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
            audio.removeEventListener("ended", onEnded);
        };
    }, [track, autoPlay]);




    useEffect(() => {
        document.title = `Playing: ${track.title}`;
        updateFavicon(track.cover_url || 'favicon.ico')
        setIsPlaying(autoPlay)

    }, [track])

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying((prev) => !prev);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = ("0" + Math.floor(time % 60)).slice(-2);
        return `${minutes}:${seconds}`;
    };


    const updateFavicon = (url: string) => {
        const finalUrl = url;

        // Update standard favicon
        let favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.head.appendChild(favicon);
        }
        favicon.href = finalUrl;

        // Update Apple touch icon (for iOS)
        let appleTouchIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
        if (!appleTouchIcon) {
            appleTouchIcon = document.createElement('link');
            appleTouchIcon.rel = 'apple-touch-icon';
            document.head.appendChild(appleTouchIcon);
        }
        appleTouchIcon.href = finalUrl;

    };
    useEffect(() => {
        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title,
                artist: Array.isArray(track.artist) ? track.artist.join(', ') : track.artist,
                album: track.album || '',
                artwork: [
                    {
                        src: track.cover_url || 'favicon.ico',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            });

            navigator.mediaSession.setActionHandler("previoustrack", () => {

                previous()
            });

            navigator.mediaSession.setActionHandler("nexttrack", () => {

                next()
            });
        }
    }, [track]);


    return (
        <div className={`max-sm:sticky sm:fixed sm:m-2 relative  ${fullView ? 'max-sm:bottom-0' : 'max-sm:bottom-[-85px]'} max-sm:left-0 sm:top-18  sm:right-0 select-none  rounded-2xl text-white  bg-[#1f1d1d] p-2  sm:w-[350px] max-sm:w-full sm:border-2 border-[#494747]`}
            style={{
                boxShadow: '0 0 10px 2px rgba(169, 162, 0, 0.5)' // amber glow all around

            }}

        >
            <button className="sm:hidden absolute top-[-20px] w-12 flex justify-center rounded-t-xl left-1/2 -translate-x-1/2 bg-[#3b3939]" onClick={() => setFullView((prev) => !prev)}>
                { !fullView ? <img src="arrowtop.svg" alt="Next Icon" width={20} />:<img src="arrowdown.svg" alt="Next Icon" width={20} />}
            </button>
            <audio ref={audioRef} src={track.music_url} preload="metadata" />
            <div className="flex flex-row gap-2 justify-start items-start">
                {track.cover_url && <img src={track.cover_url} alt={track.title} className="h-20 w-20 rounded-2xl" />}
                <div className="justify-center items-start h-full mt-1 ">
                    <h3 className="font-bold text-[20px] h-auto text-ellipsis ">{track.title}</h3>
                    <p className="text-[15px] font-bold text-[#b6a9a9]">{track.artist}</p>
                </div>
            </div>
            <div className="flex flex-col mt-2  p-2 rounded-2xl">
                <div className="flex gap-2">
                    <span className="text-[12px]">{formatTime(currentTime)}</span>
                    <input
                        disabled={duration === 0}
                        className="w-full"
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.1"
                        value={currentTime}
                        onChange={handleSeek}
                    />
                    <span className="text-[12px]">{formatTime(duration - currentTime)}</span>
                </div>
                <div className="flex justify-center gap-5 mt-5">
                    <button onClick={previous} className="">
                        <img src="previous.svg" alt="Next Icon" width={30} />
                    </button>
                    <button onClick={togglePlay} className="text-pink-400" >{isPlaying ? <img src="pause.svg" alt="Next Icon" width={25} /> : <img src="play.svg" alt="Next Icon" width={25} />}</button>
                    <button onClick={next}>
                        <img src="next.svg" alt="Next Icon" width={30} />
                    </button>


                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;
