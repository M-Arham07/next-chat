const formatTime = (date: Date | undefined): string => {

    if (!(date instanceof Date)) return "";

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

export { formatTime };