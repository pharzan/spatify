import { Download, AlertTriangle } from "lucide-react";

export default function BetaPage() {
    // TODO: Replace this URL with your actual GitHub Release asset URL
    // Example: https://github.com/pharzan/spatify/releases/download/v0.1.0/app-release.apk
    const APK_DOWNLOAD_URL = "#";

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden text-center">
                <div className="bg-[#4CAF50] p-6 text-white">
                    <h1 className="text-2xl font-bold mb-2">Internal Beta Access</h1>
                    <p className="opacity-90">Download the latest development build</p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-left flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                            <span className="font-semibold block mb-1">Confidential Build</span>
                            This version is for internal testing only. Please do not share this link publicly.
                        </div>
                    </div>

                    <a
                        href={APK_DOWNLOAD_URL}
                        className="w-full py-4 rounded-xl bg-black text-white font-bold text-lg flex items-center justify-center hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                        download
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Download APK
                    </a>

                    <p className="text-xs text-gray-400">
                        Android 8.0+ required • v0.1.0-dev
                    </p>
                </div>
            </div>
        </div>
    );
}
