"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import Image from "next/image";

const HLSVideoPlayer = ({
    src,
    startPosition,
    onStreamEnded = () => {},
}: {
    src: string;
    startPosition: number;
    onStreamEnded?: () => void;
}) => {
    let hls = useRef<Hls>();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [controls, setControls] = useState<{
        playing: boolean;
        stream: number;
        buffering: boolean;
    }>({
        playing: false,
        stream: -1,
        buffering: true,
    });
    const [settingsOpen, setSettingsOpen] = useState(false);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.addEventListener("ended", onStreamEnded);
        }
    }, [onStreamEnded]);

    useEffect(() => {
        if (!src) return;

        function initPlayer() {
            hls.current = new Hls({ startPosition });
            hls.current.loadSource(src);

            hls.current.attachMedia(videoRef.current as any);

            hls.current.on(Hls.Events.MANIFEST_PARSED, function (e, data) {
                console.log(data);
                console.log(data.levels);
                if (controls.playing) videoRef.current?.play();
            });

            hls.current.on(Hls.Events.MEDIA_ATTACHED, () => {
                console.log("Attached");
            });

            hls.current.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hls.current?.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.current?.recoverMediaError();
                            break;

                        default:
                            initPlayer();
                            break;
                    }
                } else if (
                    data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR
                ) {
                    setControls((controls) => ({
                        ...controls,
                        buffering: true,
                    }));
                }
            });

            hls.current.on(Hls.Events.FRAG_BUFFERED, () => {
                setControls((controls) => ({ ...controls, buffering: false }));
            });
        }

        if (Hls.isSupported()) {
            initPlayer();
        } else if (
            videoRef.current?.canPlayType("application/vnd.apple.mpegurl")
        ) {
            videoRef.current.src = src;
            videoRef.current.addEventListener("loadedmetadata", function () {
                if (videoRef.current?.play) videoRef.current?.play();
            });
        }

        return () => {
            if (hls.current) {
                hls.current.destroy();
            }
        };
    }, [src, startPosition]);

    function togglePlayback() {
        if (controls.playing) {
            videoRef?.current?.pause();
        } else {
            videoRef.current?.play();
            onStreamEnded();
        }
        setControls((controls) => ({
            ...controls,
            playing: !controls.playing,
        }));
    }

    function toggleSettings() {
        setSettingsOpen(!settingsOpen);
    }

    function changeQuality(quality: number) {
        if (hls.current) {
            hls.current.currentLevel = quality;
            setControls((controls) => ({ ...controls, stream: quality }));
        }
    }
    function resetQuality() {
        changeQuality(-1);
    }

    return (
        <div className="w-full max-h-[100vh] relative">
            <video
                className="h-[438px] w-[778px]"
                ref={videoRef}
                autoPlay
            ></video>
            <div
                className={`controls absolute bottom-0 w-full justify-between pb-2 px-4 ${
                    !src ? "hidden" : "flex"
                }`}
            >
                <Image
                    alt="play"
                    src={
                        controls.playing ? "/pause-icon.svg" : "/play-icon.svg"
                    }
                    height={32}
                    width={32}
                    className="cursor-pointer"
                    onClick={togglePlayback}
                />
                <div className="relative">
                    <Image
                        alt="settings"
                        src={"/setting.svg"}
                        height={32}
                        width={32}
                        className="cursor-pointer"
                        onClick={toggleSettings}
                    />
                    <div
                        className={`absolute bottom-[100%] right-[100%] text-white border bg-black bg-opacity-70 border-gray-400 rounded ${
                            settingsOpen ? "block" : "hidden"
                        }`}
                    >
                        <ul className="px-0">
                            <li
                                className={`cursor-pointer px-4 py-1 hover:bg-gray-500 ${
                                    controls.stream === -1 ? "bg-gray-500" : ""
                                }`}
                                onClick={resetQuality}
                            >
                                Auto
                            </li>
                            {hls.current?.levels?.map((level, i) => (
                                <li
                                    className={`cursor-pointer px-4 py-1 hover:bg-gray-500 ${
                                        i === controls.stream
                                            ? "bg-gray-500"
                                            : ""
                                    }`}
                                    onClick={() => changeQuality(i)}
                                    key={`lvl_${i}`}
                                >
                                    {level.width}p
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HLSVideoPlayer;
