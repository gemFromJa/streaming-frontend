"use client";

import React, { useEffect, useState } from "react";
import HLSVideoPlayer from "./HLSVideoPlayer";
import { getChannel } from "@/utils/getChannels";

export default function MediaController({ channels }: { channels: string[] }) {
    const [selectedChannl, setSelectedChannl] = useState(channels?.[0]);
    const [channel, setChannel] = useState<{ src: string; offset: number }>();

    useEffect(() => {
        if (selectedChannl) {
            fetchInfo();
        }
    }, [selectedChannl]);

    function fetchInfo() {
        getChannel(selectedChannl)
            .then(({ data }) => {
                if (data.movie) {
                    setChannel({
                        src: data.movie.url,
                        offset: data.movie.currentOffset,
                    });
                }
            })
            .catch((err) => console.log("Error fetching channel info", err));
    }

    return (
        <div>
            <div className="flex text-white">
                {channels?.map((channel, i) => (
                    <div
                        key={`chan_${i}`}
                        className={`px-4 py-3 mr-2 rounded ${
                            channel === selectedChannl
                                ? "text-gray-600 cursor-default"
                                : "text-white cursor-pointer"
                        }`}
                        onClick={() => setSelectedChannl(channel)}
                    >
                        {channel}
                    </div>
                ))}
            </div>
            <HLSVideoPlayer
                src={channel?.src || ""}
                startPosition={channel?.offset ?? -1}
                onStreamEnded={fetchInfo}
            />
        </div>
    );
}
