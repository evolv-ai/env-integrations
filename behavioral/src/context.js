
export function updateBehaviorContext(contextBase, behaviors){
    // var behaviorKeys = Object.keys(behaviors);
    // var contextbehaviors = {};

    // behaviorKeys.forEach(function(behaviorKey){
    //     var behavior = behaviors[behaviorKey]
    //     var valueKeys = Object.keys(behavior);
    //     valueKeys.forEach(function(valueKey){
    //         var key = `${contextBase}.${behaviorKey}.${valueKey}`
    //         contextbehaviors[key] = behavior[valueKey];
    //     })
    // })
    window.evolv.context.update({[contextBase]: behaviors});
}
