module.exports = {
    nextDead: nextDead,
    age: age,
    bodyCost: bodyCost,
    storedResource: storedResource,
    storedEnergy: storedEnergy,
    capacity: capacity,
    freeCapacity: freeCapacity,
    createNameByRole: createNameByRole,
    nameByRoleWasUsed: nameByRoleWasUsed,
    err: err,
    memoryCleanup: memoryCleanup,
    recycle: recycle,
};

function nextDead() {
    var minTicks = _.min(_.map(Game.creeps, (c) => c.ticksToLive));
    var creep = _.find(Game.creeps, (c) => c.ticksToLive == minTicks);
    return [creep, creep.ticksToLive];
}

function age(creep) {
    return Game.time - creep.memory.born;
}

function bodyCost(body) {
    return _.sum(_.map(body, bp => BODYPART_COST[bp]));
}

function storedResource(s, resource) {
    switch (s.structureType) {
        case STRUCTURE_STORAGE:
        case STRUCTURE_CONTAINER:
            if (resource) {
                return s.store[resource];
            } else {
                // all resources summed
                return _.sum(s.store);
            }
        case STRUCTURE_SPAWN:
        case STRUCTURE_EXTENSION:
        case STRUCTURE_LINK:
            if (!resource || resource == RESOURCE_ENERGY) {
                return s.energy;
            }
    }
}

function storedEnergy(s) {
    return storedResource(s, RESOURCE_ENERGY);
}

function capacity(s) {
    switch (s.structureType) {
        case STRUCTURE_STORAGE:
        case STRUCTURE_CONTAINER:
            return s.storeCapacity;
        case STRUCTURE_SPAWN:
        case STRUCTURE_EXTENSION:
        case STRUCTURE_LINK:
            return s.energyCapacity;
    }
}

function freeCapacity(s) {
    return capacity(s) - storedResource(s);
}

function err(code) {
    switch (code) {
        case ERR_NOT_OWNER:
            return 'ERR_NOT_OWNER';
        case ERR_NO_PATH:
            return 'ERR_NO_PATH';
        case ERR_NAME_EXISTS:
            return 'ERR_NAME_EXISTS';
        case ERR_BUSY:
            return 'ERR_BUSY';
        case ERR_NOT_FOUND:
            return 'ERR_NOT_FOUND';
        case ERR_NOT_ENOUGH_ENERGY:
            return 'ERR_NOT_ENOUGH_*';
        case ERR_INVALID_TARGET:
            return 'ERR_INVALID_TARGET';
        case ERR_FULL:
            return 'ERR_FULL';
        case ERR_NOT_IN_RANGE:
            return 'ERR_NOT_IN_RANGE';
        case ERR_FULL:
            return 'ERR_FULL';
        case ERR_INVALID_ARGS:
            return 'ERR_INVALID_ARGS';
        case ERR_TIRED:
            return 'ERR_TIRED';
        case ERR_NO_BODYPART:
            return 'ERR_NO_BODYPART';
        case ERR_RCL_NOT_ENOUGH:
            return 'ERR_RCL_NOT_ENOUGH';
        case ERR_GCL_NOT_ENOUGH:
            return 'ERR_GCL_NOT_ENOUGH';
        default:
            return 'unknown error code '+ code;
    }
}

function createNameByRole(roleName) {
    if (!Memory.global.roles) {
        Memory.global.roles = {};
    }
    if (!Memory.global.roles.nameCounter) {
        Memory.global.roles.nameCounter = {};
    }
    if (!Memory.global.roles.nameCounter[roleName]) {
        Memory.global.roles.nameCounter[roleName] = 1;
    }
    var nextCount = Memory.global.roles.nameCounter[roleName];
    return roleName[0].toUpperCase() + roleName.substring(1).toLowerCase() + nextCount;
}

function nameByRoleWasUsed(roleName) {
    ++Memory.global.roles.nameCounter[roleName];
}

function memoryCleanup(period) {
    if (!Memory.global) {
        Memory.global = {};
    }
    if (!Memory.global.lastMemoryCleanup) {
        Memory.global.lastMemoryCleanup = 0;
    }
    
    if (Game.time >= Memory.global.lastMemoryCleanup + period) {
        
        console.log('commencing memory cleanup!');
        Memory.global.lastMemoryCleanup = Game.time;
        
        // clean creeps
        for (var creepName in Memory.creeps) {
            if (!Game.creeps[creepName]) {
                delete Memory.creeps[creepName];
                console.log('  memory deleted: creeps.'+ creepName);
            }
        }
        
        // clean flags
        for (var flagName in Memory.flags) {
            if (!Game.flags[flagName]) {
                delete Memory.flags[flagName];
                console.log('  memory deleted: flags.'+ flagName);
            }
        }
        
        console.log('next memory cleanup scheduled in '+ period +' ticks');
        return true;
        
    } else {
        return false;
    }
}

function recycle(creep) {
    creep.memory.role = 'recycleme';
    creep.memory.target = null;
    return OK;
}