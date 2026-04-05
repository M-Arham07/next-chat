/**
 * 
 * WILL FIX IN FUTURE FOR REACT NATIVE 
 * Returns the name of the environment 
 * eg : pc or mobile
 * fallbacks to pc in case of undefined navigator
 */

export function getEnvironmentName(): string {

    return "mobile";

    // // fallback to pc:
    // if (typeof navigator === "undefined") return "pc";
    // return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? "mobile" : "pc";
}


