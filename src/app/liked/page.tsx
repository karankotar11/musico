'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Loader from '@/components/laoder';
import MusicLibrary from '@/components/MusicLibrary';
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
    const [loading, setLoading] = useState(true);


    const { filteredMusic, handleSearch, loading1 } = useMusicSearch();

    useEffect(() => {

        setMusicList(filteredMusic)
        setLoading(loading1)

    }, [filteredMusic , loading1])




    useEffect(() => {
        const fetchMusic = async () => {
            const { data, error } = await supabase
                .from('music')
                .select('*')
                .eq('pin', 1)
                .order('id', { ascending: false });

            if (error) {
                console.error('Error fetching music:', error.message);
            } else {
                setMusicList(data);
                console.log(data)
            }
            setLoading(false);
        };

        fetchMusic();
    }, []);








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
           
            console.warn('Error ', error)
        }
    };




    return (
        <>
            <Header
                onSearch={handleSearch}
            />
            {!loading ?
                <MusicLibrary musicList={musicList} handleFavoriteToggle={handleFavoriteToggle} />
                :


                <Loader />


            }
        </>
    );
}
