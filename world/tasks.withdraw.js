var utils = require('utils');

function isWithdrawable(s) {
    return s.structureType == STRUCTURE_STORAGE || s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_LINK;
}

module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.carry.energy < creep.carryCapacity) {

            // check if container still valid
            if (creep.memory.target) {
                var target = Game.getObjectById(creep.memory.target);
                if (!target || utils.storedEnergy(target) == 0) {
                    creep.memory.target = null;
                }
            }
        
            // find container with energy
            if (!creep.memory.target) {
                var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => isWithdrawable(s) && utils.storedEnergy(s) > 0
                });
            
                if (target) {
                    creep.memory.target = target.id;
                    //console.log(creep.name +': located withdraw source: '+ target)
                }
            }
        
            // find at least an empty container
            if (!creep.memory.target && !creep.room.memory.workersCanHarvest) {
                var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_CONTAINER
                });
                if (target) {
                    creep.memory.target = target.id;
                }
            }

            // withdraw from container until full
            if (creep.memory.target) {
                var target = Game.getObjectById(creep.memory.target);
                if (utils.storedEnergy(target) > 0) {
                    var withdrawStatus = creep.withdraw(target, RESOURCE_ENERGY);
                    if (withdrawStatus == OK) {
                        // ...
                    } else if (withdrawStatus == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                } else {
                    creep.moveTo(target);
                }
            }
        
            // fallback to harvest (if allowed by room rules)
            if (creep.room.memory.workersCanHarvest == undefined) {
                creep.room.memory.workersCanHarvest = true;
            }
            if (!creep.memory.target && creep.room.memory.workersCanHarvest) {
                creep.memory.task = 'harvest';
                creep.memory.target = null;
            }

        }
    
        return creep.carry.energy == creep.carryCapacity;
    },
    
    isWithdrawable: isWithdrawable,

};