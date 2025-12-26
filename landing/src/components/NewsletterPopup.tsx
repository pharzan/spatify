"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface NewsletterPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NewsletterPopup({ isOpen, onClose }: NewsletterPopupProps) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const response = await fetch("http://localhost:3333/newsletter/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error("Failed to subscribe");
            }

            setStatus("success");
            setTimeout(() => {
                onClose();
                setStatus("idle");
                setEmail("");
            }, 2000);
        } catch (error) {
            setStatus("error");
            setErrorMessage("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl scale-100 opacity-100 transition-all">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="space-y-6 text-center">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">Join the Waitlist</h2>
                        <p className="text-gray-500">
                            Be the first to know when Spatify launches in your city.
                        </p>
                    </div>

                    {status === "success" ? (
                        <div className="py-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">You're on the list!</h3>
                            <p className="text-gray-500 mt-2">Thanks for subscribing.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={status === "loading"}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            {status === "error" && (
                                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                    <AlertCircle className="w-4 h-4" />
                                    {errorMessage}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full py-3 px-6 bg-[#4CAF50] hover:bg-[#43a047] text-white font-semibold rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {status === "loading" ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Joining...
                                    </>
                                ) : (
                                    "Join Waitlist"
                                )}
                            </button>
                        </form>
                    )}

                    <p className="text-xs text-gray-400">
                        We respect your privacy. No spam, ever.
                    </p>
                </div>
            </div>
        </div>
    );
}
