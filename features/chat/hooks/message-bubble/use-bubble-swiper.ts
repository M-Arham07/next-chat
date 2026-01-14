"use client";
import { useCallback, useState, useRef } from "react";


// will receive whole  msg as param
export function useBubbleSwiper(isMe: boolean, messageId: string) {


    const SWIPE_THRESHOLD = 60;


    const [swipeOffset, setSwipeOffset] = useState(0);
    const [showReplyIcon, setShowReplyIcon] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);


    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const isHorizontalSwipe = useRef(false);
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        isHorizontalSwipe.current = false;
    }, []);

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = currentX - touchStartX.current;
            const diffY = Math.abs(currentY - touchStartY.current);

            // Determine if this is a horizontal swipe
            if (!isHorizontalSwipe.current && Math.abs(diffX) > 10) {
                isHorizontalSwipe.current = diffY < Math.abs(diffX);
            }

            if (!isHorizontalSwipe.current) return;

            // Swipe right for own messages, left for others
            const swipeDirection = isMe ? diffX < 0 : diffX > 0;

            if (swipeDirection) {
                const offset = Math.min(Math.abs(diffX), 80);
                setSwipeOffset(isMe ? -offset : offset);
                setShowReplyIcon(offset >= SWIPE_THRESHOLD);
            }
        },
        [isMe]
    );

    const onSwipeReply = null;

    const handleTouchEnd = useCallback(() => {
        if (Math.abs(swipeOffset) >= SWIPE_THRESHOLD && onSwipeReply && messageId) {
            //Callback: // onSwipeReply(messageId);
        }
        setSwipeOffset(0);
        setShowReplyIcon(false);
        isHorizontalSwipe.current = false;
    }, [swipeOffset, messageId]);


    return {
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd, showReplyIcon,swipeOffset
    }

}


