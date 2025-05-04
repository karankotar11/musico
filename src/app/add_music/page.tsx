'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { parseBlob } from 'music-metadata-browser';

type MusicMetadata = {
    title: string;
    artist: string;
    album: string;
    file: File;
    cover_url?: string;
};


export default function AddMusicPage() {

    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [cover_url, setcover_url] = useState<string | null>(null);

    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');

    const [tracks, setTracks] = useState<MusicMetadata[]>([]);

    const extractAlbumArt = async (audioFile: File) => {
        if (!audioFile.type.startsWith("audio/")) {
            alert("Please upload a valid audio file.");
            return;
        }
        try {
            const metadata = await parseBlob(audioFile);
            console.log(metadata.common)
            const picture = metadata.common.picture?.[0];
            const song_title = metadata.common.title; // Album name (if available)



            const { data: existingMusic, error: selectError } = await supabase
                .from('music')
                .select('id')
                .eq('title', song_title)
                .single();

            if (selectError && selectError.code !== 'PGRST116') {
                // PGRST116 = no rows found (which is OK)
                alert('Error checking existing music: ' + selectError.message);
                setUploading(false);
                return;
            }

            if (existingMusic) {
                // alert(`A music entry with ${song_title} already exists.`);
                console.warn('aready exist skip')
                return;
            }




            if (picture) {
                const blob = new Blob([picture.data], { type: picture.format });

                // Optional: upload to Supabase
                const imageExt = picture.format.split('/')[1] || 'jpg';
                const imageFileName = `${Date.now()}.${imageExt}`;
                const imagePath = `album-art/${imageFileName}`;

                const { error: imageUploadError } = await supabase.storage
                    .from('music-files')
                    .upload(imagePath, blob, {
                        contentType: picture.format,
                    });

                if (!imageUploadError) {
                    const { data: imageUrlData } = supabase.storage
                        .from('music-files')
                        .getPublicUrl(imagePath);

                    setTracks((prev) => [
                        ...prev,
                        {
                            title: metadata.common.title || '',
                            artist: Array.isArray(metadata.common.artist) ? metadata.common.artist.join(', ') : metadata.common.artist || '',
                            album: metadata.common.album || '',
                            file: audioFile,
                            cover_url: imageUrlData.publicUrl,
                        },
                    ]);
                }
                // console.warn('Album art upload failed:', imageUploadError.message);
                // return null;


            }
        } catch (err) {
            console.warn('Error extracting album art:', err);
        }
        return null;
    };

    const handleUpload = async () => {


        setUploading(true);
        let i = 0
        for (const track of tracks) {

            i += 1


            const fileExt = track.file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `music/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('music-files')
                .upload(filePath, track.file);

            if (uploadError) {
                alert('Upload failed: ' + uploadError.message);
                setUploading(false);
                return;
            }

            const { data: fileUrlData } = supabase.storage
                .from('music-files')
                .getPublicUrl(filePath);

            const publicUrl = fileUrlData?.publicUrl;



            const { error: insertError } = await supabase
                .from('music')
                .insert([
                    {
                        title: track.title,
                        artist: track.artist,
                        album: track.album,
                        music_url: publicUrl,
                        cover_url: track.cover_url, // add this to your table schema
                    },
                ]);


            if (insertError) {
                alert('Database insert failed: ' + insertError.message);
                continue;
            }

        }
        alert(`Total ${i} Music added successfully!`);
        setUploading(false);

        // router.push('/');
    };

    const handlePasswordSubmit = () => {
        if (password === 'kk10') {
            setAuthenticated(true);
        } else {
            alert('Incorrect password!');
        }
    };
    if (!authenticated) {
        return (
            <div className="p-6 max-w-sm mx-auto mt-20">
                <form>
                    <h2 className="text-xl font-semibold mb-4">Enter Password</h2>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border p-2 mb-2"
                    />
                    <button
                        onClick={handlePasswordSubmit}
                        onSubmit={handlePasswordSubmit}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Submit
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4">Add Music</h1>
           
            <div className="mb-4">
                <label
                    htmlFor="audioUpload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors"
                >

                    Upload Audio File
                </label>
                <input
                    id="audioUpload"
                    multiple
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                        const selectedFiles = Array.from(e.target.files || []);
                        setFiles(selectedFiles);
                        selectedFiles.forEach(extractAlbumArt); // process each
                    }}
                />

            </div>
            {tracks.map((track, idx) => (
                <div key={idx} className="mb-4 border p-2 rounded">
                    <p className="font-semibold">{track.title || track.file.name}</p>
                    <p className="text-sm text-gray-600">Artist: {track.artist || 'Unknown'}</p>
                    {track.cover_url && (
                        <img src={track.cover_url} alt="Album Art" className="max-h-32 mt-2" />
                    )}
                </div>
            ))}


            {/* {albumArtUrl && (
                <img src={albumArtUrl} alt="Album Art" className="mb-4 max-h-48" />
            )} */}
            <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
}
