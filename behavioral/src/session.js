

export function isNewSession(behavioralData, inactiveMinutes){
    var currentTime = new Date().getTime();
    if (!inactiveMinutes){
        inactiveMinutes = 30
    }
    return behavioralData.updatedAt < (currentTime - (inactiveMinutes *60*1000));
}
