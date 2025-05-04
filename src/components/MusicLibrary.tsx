'use client';

import { useEffect, useRef, useState } from 'react';
import AudioPlayer from './AudioPlayer'; // Adjust this path as needed

type Music = {
    id: number;
    title: string;
    artist: string;
    album?: string;
    music_url: string;
    cover_url?: string;
    pin: number;
};


type Props = {
    musicList: Music[];
    handleFavoriteToggle: (id: number) => void;
};

const MusicLibrary = ({ musicList, handleFavoriteToggle }: Props) => {
    const [selectedMusicIndex, setSelectedMusicIndex] = useState<number | null>(null);
    const [selectedMusicInfo, setSelectedMusicInfo] = useState<Music | null>(null);

    const musicRefs = useRef<(HTMLDivElement | null)[]>([]);
    useEffect(() => {
        if (
            selectedMusicIndex !== null &&
            musicRefs.current[selectedMusicIndex]
        ) {
            musicRefs.current[selectedMusicIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [selectedMusicIndex]);

    return (
        <div className="pt-16 max-w-4xl mx-auto select-none">
            <h1 className="p-6 text-2xl font-bold mb-2">Music Library</h1>
            <div className="p-4 grid sm:gap-6 gap-2 max-sm:grid-cols-2 sm:grid-cols-2 md:grid-cols-3">
                {musicList.map((music, index) => (
                    <div
                        key={music.id}
                        ref={(el) => {
                            musicRefs.current[index] = el;
                        }}
                        
                        className="bg-[#1F1D1D] shadow-md hover:border-gray-500 border-2 border-transparent rounded-lg sm:p-4 max-sm:p-2 flex flex-col items-center text-center relative"
                        style={{
                            borderColor:
                                selectedMusicIndex !== null &&
                                    musicList[selectedMusicIndex]?.id === music.id
                                    ? 'var(--color-gray-500)'
                                    : '',
                        }}
                        onClick={() => { setSelectedMusicIndex(index); setSelectedMusicInfo(music) }}
                    >
                        {music.cover_url ? (
                            <div className="max-sm:relative">
                                <img
                                    src={music.cover_url}
                                    alt={`${music.title} cover`}
                                    className="w-32 h-32 object-cover mb-4 rounded"
                                />
                                <button
                                    className="absolute top-0 right-0 sm:p-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFavoriteToggle(music.id);
                                    }}
                                >
                                    {music.pin === 1 ? (
                                        <img src="favorite.svg" alt="fav Icon" width={25} />
                                    ) : (
                                        <img src="notfavorite.svg" alt="fav Icon" width={25} />
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="w-32 h-32 mb-4 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm">
                                No cover
                            </div>
                        )}

                        <h2 className="text-lg font-semibold max-sm:truncate max-sm:overflow-hidden max-sm:whitespace-nowrap max-sm:w-32">
                            {music.title}
                        </h2>
                        <p className="text-[#b6a9a9] max-sm:truncate max-sm:overflow-hidden max-sm:whitespace-nowrap max-sm:w-32">
                            {music.artist}
                        </p>
                        {music.album && (
                            <p className="text-gray-500 text-sm max-sm:truncate max-sm:overflow-hidden max-sm:whitespace-nowrap max-sm:w-32">
                                {music.album}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {selectedMusicInfo !== null && (
                <AudioPlayer
                    track={selectedMusicInfo}
                    autoPlay={true}
                    next={() => {
                        if (
                            selectedMusicIndex !== null &&
                            selectedMusicIndex + 1 < musicList.length
                        ) {
                            
                            setSelectedMusicInfo(musicList[selectedMusicIndex + 1])
                            setSelectedMusicIndex(selectedMusicIndex + 1);
                        }
                    }}
                    previous={() => {
                        if (selectedMusicIndex !== null && selectedMusicIndex > 0) {
                            setSelectedMusicInfo(musicList[selectedMusicIndex - 1])
                            setSelectedMusicIndex(selectedMusicIndex - 1);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default MusicLibrary;
