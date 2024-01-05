import HLSVideoPlayer from "@/components/HLSVideoPlayer";
import MediaController from "@/components/MediaController";
import getChannels from "@/utils/getChannels";
import Image from "next/image";

export default async function Home() {
    // get the channels
    let channels;

    try {
        const { data } = await getChannels();

        if (data) {
            channels = data.channels;
        }
    } catch (error) {}

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <MediaController channels={channels} />
        </main>
    );
}
