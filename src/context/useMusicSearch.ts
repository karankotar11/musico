import { supabase } from '@/lib/supabase';
import { useState } from 'react';


type Music = {
    id: number;
    title: string;
    artist: string;
    album: string;
    music_url: string;
    cover_url: string;
    pin: number;
};
export function useMusicSearch() {
  const [filteredMusic, setFilteredMusic] = useState<Music[]>([]);
  const [loading1, setLoading1] = useState(false);

  const handleSearch = async (text: string) => {
    setLoading1(true);
    const { data, error } = await supabase
      .from('music')
      .select('*')
      .or(`title.ilike.%${text}%,album.ilike.%${text}%,artist.ilike.%${text}%`)
      .order('id', { ascending: false });

    if (!error && data) {
      setFilteredMusic(data);
    }
    setLoading1(false);
  };

  return {
    filteredMusic,
    handleSearch,
    loading1,
  };
}
