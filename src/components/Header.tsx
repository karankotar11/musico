
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface HeaderProps {
    onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
    const [searchText, setSearchText] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [searchFocus, setSearchFocus] = useState<boolean>(false)
    const [menuOpen, setMenuOpen] = useState(false);


    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchText.trim() === '') {
                setSuggestions([]);
                return;
            }

            const { data, error } = await supabase
                .from('music')
                .select('title, album, artist')
                .or(
                    `title.ilike.%${searchText}%,album.ilike.%${searchText}%,artist.ilike.%${searchText}%`
                )
                .limit(5);

            if (!error && data) {
                const uniqueSuggestions = new Set<string>();

                data.forEach((item) => {
                    if (item.title?.toLowerCase().includes(searchText.toLowerCase())) {
                        uniqueSuggestions.add(item.title);
                    }
                    if (item.album?.toLowerCase().includes(searchText.toLowerCase())) {
                        uniqueSuggestions.add(item.album);
                    }
                    if (item.artist?.toLowerCase().includes(searchText.toLowerCase())) {
                        uniqueSuggestions.add(item.artist);
                    }
                });
                if (searchFocus) {

                    setSuggestions([...uniqueSuggestions]);
                }

            }
        };

        const timeout = setTimeout(fetchSuggestions, 300); // debounce
        return () => clearTimeout(timeout);
    }, [searchText]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchText);
        setSuggestions([]);
    };


    return (
        <div className="fixed w-full bg-[#0A0A0A] border-y-2 border-[#1F1D1D] z-50">
            <div className="flex  sm:flex-row sm:justify-between items-center  px-5 py-3 gap-3 relative">
                {/* Logo and Toggle */}
                <div className="flex w-full justify-between items-center">
                    <button
                        className="sm:hidden text-white text-xl relative"
                        onClick={() => setMenuOpen((prev) => !prev)}
                    >
                        ☰
                    </button>
                    <div className={`max-sm:absolute max-sm:left-10 max-sm:bg-[#0A0A0A] max-sm:py-2 max-sm:w-full max-sm:px-5 max-sm:z-[900] sm:flex sm:flex-row gap-3 ${menuOpen ? 'flex' : 'hidden'} sm:gap-5`}>
                        <Link href="/"><button className="text-white">Home</button></Link>
                        <Link href="/artists"><button className="text-white">Artists</button></Link>
                        <Link href="/liked"><button className="text-white">Liked</button></Link>
                        <Link href="/add_music"><button className="text-white">Add</button></Link>
                        <Link href="/delete_song"><button className="text-white">Delete</button></Link>
                    </div>
                    <h1 className="font-bold text-[30px] text-white">Musico</h1>
                </div>

                {/* Nav Links */}

                {/* Search */}
                <form onSubmit={handleSubmit} className="w-full sm:w-auto relative">
                    <input
                        type="text"
                        className="bg-[#1F1D1D] w-full sm:w-64 rounded-2xl px-3 py-1 text-white"
                        placeholder="Search"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onFocus={() => setSearchFocus(true)}
                        onBlur={() => setTimeout(() => setSearchFocus(false), 150)} // delay so click can register
                    />
                    {suggestions.length > 0 && searchFocus && (
                        <ul className="absolute mt-1 bg-[#1F1D1D] text-white rounded shadow-md w-full max-h-60 overflow-y-auto z-50">
                            {suggestions.map((s, i) => (
                                <li
                                    key={i}
                                    className="px-4 py-2 hover:bg-[#333]"
                                    onClick={() => {
                                        setSearchText(s);
                                        onSearch(s);
                                        setSuggestions([]);
                                    }}
                                >
                                    {s}
                                </li>
                            ))}
                        </ul>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Header;
