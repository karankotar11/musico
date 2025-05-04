// app/delete_song/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useMusicSearch } from '@/context/useMusicSearch';
import Header from '@/components/Header';

type Song = {
    id: number;
    title: string;
    artist: string;
    album: string;
    music_url: string;
    cover_url: string;
    pin: number;
};

const PAGE_SIZE = 10;

const DeleteSongPage = () => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

    const { filteredMusic, handleSearch } = useMusicSearch();

    useEffect(() => {
        setSongs(filteredMusic);
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

            if (data.length < PAGE_SIZE) setHasMore(false);

            setSongs(prev => {
                const existingIds = new Set(prev.map(item => item.id));
                const newData = data.filter(item => !existingIds.has(item.id));
                return [...prev, ...newData];
            });
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
            window.innerHeight + document.documentElement.scrollTop >=
            document.documentElement.offsetHeight - 100 &&
            !loading &&
            hasMore
        ) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchMusic(nextPage);
        }
    }, [loading, hasMore, fetchMusic, page]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const deleteSong = async (song: Song) => {
        setDeletingId(song.id);
        setLoading(true);
        try {
            const musicPath = song.music_url.split('/').slice(-2).join('/');
            const coverPath = song.cover_url.split('/').slice(-2).join('/');

            await supabase.storage.from('music-files').remove([musicPath]);
            await supabase.storage.from('music-files').remove([coverPath]);

            const { error: dbError } = await supabase
                .from('music')
                .delete()
                .eq('id', song.id);

            if (dbError) throw dbError;

            setSongs(prev => prev.filter(s => s.id !== song.id));
        } catch (error) {
            alert('Failed to delete song');
            console.error(error);
        } finally {
            setDeletingId(null);
            setLoading(false);
        }
    };

    return (
        <>
            <Header onSearch={handleSearch} />
            <div className="pt-18 p-6 text-white">
                <h1 className="text-3xl font-bold mb-4">Delete Songs</h1>

                {initialLoad ? (
                    <p>Loading songs...</p>
                ) : songs.length === 0 ? (
                    <p>No songs found.</p>
                ) : (
                    <>
                        <ul className="space-y-4">
                            {songs.map((song) => (
                                <li
                                    key={song.id}
                                    className="bg-[#1F1D1D] p-4 rounded-lg flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-semibold">{song.title}</p>
                                        <p className="text-sm text-gray-400">{song.artist}</p>
                                    </div>
                                    <button
                                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
                                        onClick={() => deleteSong(song)}
                                        disabled={deletingId === song.id}
                                    >
                                        {deletingId === song.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        {loading && songs.length > 0 && <p className="mt-4 text-center">Loading more songs...</p>}
                        {!hasMore && <p className="mt-4 text-center text-gray-400">No more songs to load</p>}
                    </>
                )}
            </div>
        </>
    );
};

export default DeleteSongPage;
