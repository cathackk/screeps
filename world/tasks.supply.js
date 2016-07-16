var utils = require('utils');

function isSuppliable(s) {
    return s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN;
}

function isStorable(s) {
    return s.structureType == STRUCTURE_STORAGE || s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_LINK;
}

function findSupplyTarget(creep, supplyType) {
    
    var supplyFilter = ((s) => supplyType.filter(s) && utils.freeCapacity(s) > 0);
    
    if (creep.memory.role == 'harvester' && creep.memory.assignment) {
        var assignmentFlag = Game.flags[creep.memory.assignment];
        if (assignmentFlag) {
            
            // are harvesters allowed to supply this type?
            if (!assignmentFlag.memory.harvestersCan) {
                assignmentFlag.memory.harvestersCan = {};
            }
            var allowed = assignmentFlag.memory.harvestersCan[supplyType.name];
            if (allowed == undefined) {
                allowed = true;
                assignmentFlag.memory.harvestersCan[supplyType.name] = allowed;
            }
            if (!allowed) {
                return null;
            }
            
            // filter supply targets in given area
            if (!assignmentFlag.memory.rangeLimit) {
                assignmentFlag.memory.rangeLimit = {};
            }
            var rangeLimit = assignmentFlag.memory.rangeLimit[supplyType.name];
            //console.log(creep.name +': '+ supplyType.name +' range for '+ assignmentFlag.name +' = '+ rangeLimit);
            if (rangeLimit == undefined) {
                rangeLimit = 10;
                assignmentFlag.memory.rangeLimit[supplyType.name] = rangeLimit;
            }
            supplyFilter = (s) => supplyType.filter(s) && utils.freeCapacity(s) && s.pos.inRangeTo(assignmentFlag, rangeLimit);
            
        } else {
            console.log(creep.name +': assignment flag '+ creep.memory.assignment +' not found!');
        }
    }
    
    return creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: supplyFilter });

}


module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        var resource = creep.memory.resource;
        if (!resource) {
            resource = RESOURCE_ENERGY;
            creep.memory.resource = resource;
        }
        
        if (creep.carry[resource] > 0) {
            
            var target = Game.getObjectById(creep.memory.target);
            
            // re-check target validity
            if (!target) {
                creep.memory.target = null;
            } else if (utils.freeCapacity(target) == 0) {
                target = null;
                creep.memory.target = null;
            }
            
            // find a structure to supply
            if (!target) {
                target = findSupplyTarget(creep, { name: 'supply', filter: isSuppliable });
                if (target) {
                    creep.memory.target = target.id;
                    //console.log(creep.name +': located supply target: '+ target +' ('+ utils.storedResource(target, resource) +'/'+ utils.capacity(target) +')');
                }
           }
        
            // if nothing could be supplied, store
            if (!target) {
                target = findSupplyTarget(creep, { name: 'store', filter: isStorable });
                if (target) {
                    creep.memory.target = target.id;
                    //console.log(creep.name +': located store target: '+ target +' ('+ utils.storedResource(target, resource) +'/'+ utils.capacity(target) +')');
                }
            }
        
            // supply/store
            if (target) {
                var amountTransferred = creep.carry[resource];
                var transferStatus = creep.transfer(target, resource);
                if (transferStatus == OK) {
                    // ok
                } else if (transferStatus == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } else {
                // nothing to supply, refill
                if (creep.carry[resource] < creep.carryCapacity) {
                    return true;
                }
            }
        
        }
    
        return creep.carry[resource] == 0;
    },
    
    isSuppliable: isSuppliable,
    isStorable: isStorable,
    findSupplyTarget: findSupplyTarget,
    
}