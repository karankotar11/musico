'use client';

import { useEffect, useState, useCallback } from 'react';
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

const PAGE_SIZE = 10; // Number of songs to load per page

export default function MusicListPage() {
    const [musicList, setMusicList] = useState<MusicItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

    const { filteredMusic, handleSearch, loading1 } = useMusicSearch();

    useEffect(() => {
        setMusicList(filteredMusic);
    }, [filteredMusic]);

    const fetchMusic = useCallback(async (pageNumber: number) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('music')
                .select('*')
                .order('id', { ascending: false })
                .range((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE - 1);

            if (error) throw error;

            if (data.length < PAGE_SIZE) {
                setHasMore(false);
            }

            if (pageNumber === 1) {
                setMusicList(data);
            } else {
                setMusicList(prev => {
                    const existingIds = new Set(prev.map(item => item.id));
                    const newData = data.filter(item => !existingIds.has(item.id));
                    return [...prev, ...newData];
                });
            }
        } catch (error) {
            console.error('Error fetching music:', error);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    }, []);

    useEffect(() => {
        fetchMusic(1);
    }, [fetchMusic]);

    const handleScroll = useCallback(() => {
        if (
            window.innerHeight + document.documentElement.scrollTop !== 
            document.documentElement.offsetHeight || 
            loading || 
            !hasMore
        ) {
            return;
        }
        setPage(prev => {
            const nextPage = prev + 1;
            fetchMusic(nextPage);
            return nextPage;
        });
    }, [loading, hasMore, fetchMusic]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const handleFavoriteToggle = async (id: number) => {
        const musicItem = musicList.find(item => item.id === id);
        const newPinValue = musicItem?.pin === 1 ? 0 : 1;
        
        // Optimistic update
        setMusicList(prev =>
            prev.map(item =>
                item.id === id ? { ...item, pin: newPinValue } : item
            )
        );

        const { error } = await supabase
            .from('music')
            .update({ pin: newPinValue })
            .eq('id', id);

        if (error) {
            // Revert if error
            setMusicList(prev =>
                prev.map(item =>
                    item.id === id ? { ...item, pin: musicItem?.pin || 0 } : item
                )
            );
            console.error('Error updating favorite status:', error);
        }
    };

    return (
        <>
            <Header onSearch={handleSearch} />
            {initialLoad ? (
                <Loader />
            ) : (
                <>
                    <MusicLibrary 
                        musicList={musicList} 
                        handleFavoriteToggle={handleFavoriteToggle} 
                    />
                    {loading && <Loader />}
                    {!hasMore && !loading && (
                        <div className="text-center text-gray-500 py-4">
                            No more songs to load
                        </div>
                    )}
                </>
            )}
        </>
    );
}