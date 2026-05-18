function stringToColor(str: string) {
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
        "bg-red-200 dark:bg-red-500/40 text-red-900 dark:text-red-400",
        "bg-blue-200 dark:bg-blue-500/40 text-blue-900 dark:text-blue-400",
        "bg-green-200 dark:bg-green-500/40 text-green-900 dark:text-green-400",
        "bg-yellow-200 dark:bg-yellow-500/40 text-yellow-900 dark:text-yellow-400",
        "bg-purple-200 dark:bg-purple-500/40 text-purple-900 dark:text-purple-400",
        "bg-pink-200 dark:bg-pink-500/40 text-pink-900 dark:text-pink-400",
        "bg-indigo-200 dark:bg-indigo-500/40 text-indigo-900 dark:text-indigo-400",
        "bg-orange-200 dark:bg-orange-500/40 text-orange-900 dark:text-orange-400",
        "bg-teal-200 dark:bg-teal-500/40 text-teal-900 dark:text-teal-400",
        "bg-cyan-200 dark:bg-cyan-500/40 text-cyan-900 dark:text-cyan-400",
    ];

    return colors[Math.abs(hash) % colors.length];
}

export default stringToColor;