export default function delay(ms: number, result?) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms, result);
    });
}

export function reject(ms: number, error?) {
    return new Promise((resolve, reject) => {
        setTimeout(reject, ms, error);
    }).then;
}

// Helper functions for then

export function delayFunc(ms: number) {
    return result => delay(ms, result);
}

export function delayRejectFunc(ms: number) {
    return result => reject(ms, result);
}