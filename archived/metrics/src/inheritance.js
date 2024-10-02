
const clearsKey = [
    'source',
    // 'when'
]

export function mergeMetric(context, metric){
    const {key, apply, value, comment, when, ...baseContext} = context;

    if (Object.keys(metric).some(k=> clearsKey.includes(k))){
        return {...baseContext, ...metric}
    } else {
        return {...baseContext, key, ...metric}
    }
}
