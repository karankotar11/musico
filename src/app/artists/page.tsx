'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import AudioPlayer from '@/components/AudioPlayer';
import Header from '@/components/Header';
import MusicLibrary from '@/components/MusicLibrary';
import Loader from '@/components/laoder';
import { useMusicSearch } from '@/context/useMusicSearch';

type MusicItem = {
    id: number;
    title: string;
    artist: string;
    album?: string;
    music_url: string;
    cover_url?: string;
    pin: number;
};

export default function MusicListPage() {
    const [musicList, setMusicList] = useState<MusicItem[]>([]);
    const [loading, setLoading] = useState(false);

    const [artists, setArtists] = useState<string[]>([]);
    const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

    const { filteredMusic, handleSearch, loading1 } = useMusicSearch();

    useEffect(()=>{

        setMusicList(filteredMusic)
        setSelectedArtist(null)

    },[filteredMusic])


    useEffect(() => {
        setLoading(true)
        const fetchArtists = async () => {
            const { data, error } = await supabase
                .from('music')
                .select('artist');

            if (!error && data) {
                const unique = Array.from(new Set(data.map((item) => item.artist)));
                setArtists(unique);
            } else {
                console.error('Error fetching artists:', error?.message);
            }
        };

        fetchArtists();
        setLoading(false)
    }, []);


    const handleArtistClick = async (artistName: string) => {
        setSelectedArtist(artistName);

        const { data, error } = await supabase
            .from('music')
            .select('*')
            .eq('artist', artistName)
            .order('id', { ascending: false });

        if (!error && data) {
            setMusicList(data);
        }
    };


    const handleFavoriteToggle = async (id: number) => {
        // Example logic: toggle pin value in Supabase
        const musicItem = musicList.find(item => item.id === id);
        const newPinValue = musicItem?.pin === 1 ? 0 : 1;
        setMusicList(prev =>
            prev.map(item =>
                item.id === id ? { ...item, pin: newPinValue } : item
            )
        );
        const { error } = await supabase
            .from('music')
            .update({ pin: newPinValue })
            .eq('id', id);

        if (!error) {
            // Update local state
            // setMusicList(prev =>
            //     prev.map(item =>
            //         item.id === id ? { ...item, pin: newPinValue } : item
            //     )
            // );
        }
    };

    return (
        <>
            <Header
                onSearch={handleSearch}
            />
            {!loading ?
            <>
                <div className=" max-w-[800px]  mx-auto select-none flex flex-wrap gap-2 mb-6 pt-16">
                    {artists.map((artist) => (
                        <button
                            key={artist}
                            onClick={() => handleArtistClick(artist)}
                            className={`px-4 py-2 rounded-full border-2 font-bold hover:border-[#732ff0] text-sm ${selectedArtist === artist
                                ? 'bg-[#732ff0] text-white'
                                : 'bg-[#a0a0a0] text-gray-800'
                                }`}
                        >
                            {artist}
                        </button>
                    ))}

                </div>
                <MusicLibrary musicList={musicList} handleFavoriteToggle={handleFavoriteToggle} />
            </>
            :
            <Loader/>
            }
        </>
    );
}
