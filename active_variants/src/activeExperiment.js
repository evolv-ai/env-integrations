
const evolv = window.evolv;

const CONTEXT_EVENTS = [
    "context.initialized",
    "context.value.removed",
    "context.value.added",
    "context.value.changed",
    "context.destroyed"
];

const PROJECT_EVENTS = {
    INITIALIZED: "project.initialized",
    CHANGED: "project.changed"
};


const Cached_ExperiemntData = {};

export function getActiveExperimentData(eid){
    return {
        // ...data,
        on(eventName, fnc){
            const updateIfChanged = ()=> requestAnimationFrame(()=> {
                const confirmation = findConfirmedAllocation(eid);
                if (!confirmation) return;

                getExperimentWithNames(eid).then(data=>{
                    const cachedData = Cached_ExperiemntData[eid];
                    if (!cachedData || (cachedData?.activeVariants?.length || 0) !== (data?.activeVariants?.length || 0)){
                        Cached_ExperiemntData[eid] = {...data, activeVariants:[...(data?.activeVariants || [])]};
                        fnc({...confirmation, ...data});
                    }
                })
            })

            if (eventName === PROJECT_EVENTS.CHANGED){
                CONTEXT_EVENTS.forEach(e=> evolv.client.on(e, updateIfChanged));
            } else { //PROJECT_EVENTS.INITIALIZED
                updateIfChanged();     
            }
            return this;
        },
        subscribe(fnc){
            const updateIfChanged = ()=> requestAnimationFrame(()=> {
                getExperimentWithNames(eid).then(data=>{
                    const cachedData = Cached_ExperiemntData[eid];
                    if ((cachedData?.activeVariants?.length || 0) !== (data?.activeVariants?.length || 0)){
                        Cached_ExperiemntData[eid] = {...data, activeVariants:[...(data?.activeVariants || [])]};
                        fnc(data);
                    }
                })
            })
            CONTEXT_EVENTS.forEach(e=> evolv.client.on(e, updateIfChanged));
            updateIfChanged();     
        }
    }
}


function getExperimentWithNames(experimentId){
    return evolv.client.getConfig('_experiments').then(experiments=>{
        return evolv.client.getConfig('_display_names').then(displayNames=>{
            if (!displayNames || !experiments) return;

            const activeVariants = extractActiveExperimentVariants(
                experiments.find(e=> e.id===experimentId) || {},
                evolv.context.remoteContext?.variants?.active || [],
                displayNames.variants || {}
            );

            return {
                id: experimentId,
                displayName: displayNames.experiments[experimentId],
                activeVariants
            }
        });
    });
}

function extractCommon(variantId){
    if (variantId.includes(':')){
        return variantId.split(":")[0];
    } else {
        return variantId.split('.').slice(0,-1).join('.')
    }
}

function contextMatches(variantId, contexts){
    const variantContextId = variantId.split('.')[1];
    return !! contexts[variantContextId];
}

function isActive(variantId, activeVariants){
    const vId = extractCommon(variantId);
    return activeVariants.some(av=> extractCommon(av) ===  vId)
}

function extractActiveExperimentVariants(experiment, activeVariants, variantDisplayNames){
    let contexts = experiment.web;
    if (!contexts) return [];
    
    // console.info('extractActiveExperimentVariants', experiment, activeVariants, variantDisplayNames)

    return Object.keys(variantDisplayNames)
      .filter(vId=>
        contextMatches(vId, contexts)
      )
      .filter(vId=> 
        isActive(vId, activeVariants)
      )
      .map(vId=>({
        id: vId,//is this correct?
        name: variantDisplayNames[vId]
      }));
}



  function findConfirmedAllocation(eid) {
    const experiments = window.evolv.context.get('experiments');
    const allocation = experiments.allocations.find(a=> a.eid === eid);
    const confirmation = experiments.confirmations.find(c=>c.cid === allocation.cid);
    return confirmation && allocation;
  }