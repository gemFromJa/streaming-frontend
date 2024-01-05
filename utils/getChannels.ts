import { API_URL } from "./constants";

console.log("URL", API_URL);

export default async function getChannels() {
    return (await fetch(`${API_URL}/videos/channels`)).json();
}
export async function getChannel(channel_id: string) {
    console.log("GETTING CHANNEL", API_URL);
    return (await fetch(`${API_URL}/videos/${channel_id}/offset`)).json();
}
