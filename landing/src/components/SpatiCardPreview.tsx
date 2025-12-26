import Image from "next/image";
import { Star, MapPin, Clock, Navigation } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming utils is standard, I might need to create it if not present.

// Since I configured images: { unoptimized: true }, standard Image usage is fine but might need width/height if remote.
// I'll stick to standard div backgrounds or simple img tags if simpler for this demo, but next/image is better.

export function SpatiCardPreview() {
    const spati = {
        name: "Cozy Corner Cafe",
        rating: 4.8,
        description: "A perfect spot for studying or catching up with friends. Great coffee and quiet atmosphere.",
        address: "123 Main St, Tech City",
        type: "Cafe",
        hours: "Open Now • Closes 10 PM",
        imageUrl: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80",
        mood: {
            color: "#FFD700", // Gold/Yellowish for cozy
            imageUrl: "https://em-content.zobj.net/source/microsoft-teams/337/hot-beverage_2615.png", // Placeholder mood stamp
        }
    };

    return (
        <div className="relative w-full max-w-sm rounded-[24px] bg-white shadow-xl overflow-hidden transform transition-all hover:scale-105 duration-300">
            {/* Close Button Mock */}
            <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center cursor-pointer shadow-sm">
                <span className="text-gray-800 text-lg">✕</span>
            </div>

            {/* Image Container with Glow */}
            <div className="p-4 pb-0">
                <div
                    className="relative rounded-2xl overflow-hidden border-2"
                    style={{
                        borderColor: spati.mood.color,
                        boxShadow: `0 0 20px ${spati.mood.color}40` // 40 is opacity hex
                    }}
                >
                    <div className="relative h-48 w-full bg-gray-200">
                        {/* Using standard img for simplicity with external URLs in static export without domain config */}
                        <img
                            src={spati.imageUrl}
                            alt={spati.name}
                            className="w-full h-full object-cover"
                        />

                        {/* Mood Stamp */}
                        <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-md animate-bounce-slow">
                            <img
                                src={spati.mood.imageUrl}
                                alt="Mood"
                                className="w-12 h-12 object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 flex-1 mr-2">{spati.name}</h3>
                    <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 fill-current mr-1" />
                        <span className="font-semibold">{spati.rating}</span>
                    </div>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{spati.description}</p>

                <div className="flex items-center text-gray-500 text-xs mb-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {spati.address}
                </div>

                <div className="flex items-center text-gray-500 text-xs mb-4">
                    <Clock className="w-3 h-3 mr-1" />
                    {spati.type} • {spati.hours}
                </div>

                <button className="w-full py-3 rounded-full bg-[#4CAF50] text-white font-semibold flex items-center justify-center hover:bg-[#43a047] transition-colors shadow-lg shadow-green-200">
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                </button>
            </div>
        </div>
    );
}
