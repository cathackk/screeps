var utils = require('utils');

module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        // already full?
        if (_.sum(creep.carry) == creep.carryCapacity) {
            return true;
        }
            
        var target = Game.getObjectById(creep.memory.target);
        if (!target) {
            // memory reset
            creep.memory.target = null;
        }
        
        // find assigned harvest target (if anything assigned)
        if (!target && creep.memory.role == 'harvester' && creep.memory.assignment) {
            var flag = Game.flags[creep.memory.assignment];
            if (!flag.memory.rangeLimit) {
                flag.memory.rangeLimit = {};
            }
            var harvestRangeLimit = flag.memory.rangeLimit.harvest;
            if (harvestRangeLimit == undefined) {
                harvestRangeLimit = 10;
                flag.memory.rangeLimit.harvest = harvestRangeLimit;
            }
            
            target = flag.pos.findInRange(FIND_SOURCES, harvestRangeLimit)[0];
            if (!target) {
                target = flag.pos.findInRange(FIND_MINERALS, harvestRangeLimit)[0];
            }
            if (target) {
                creep.memory.target = target.id;
                console.log(creep.name +': located assigned harvest source: '+ target);
            }
        }
        
        // if no assigned target, find any energy source
        if (!target) {
            target = creep.pos.findClosestByPath(FIND_SOURCES);
            if (target) {
                creep.memory.target = target.id;
                //console.log(creep.name +': located harvest source: '+ target)
            }
        }

        // harvest from the target until full
        if (target) {
            var harvestStatus = creep.harvest(target);
            if (harvestStatus == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            } else if (harvestStatus == ERR_NOT_ENOUGH_RESOURCES) {
                // when source is empty, at least move closer
                creep.moveTo(target);
            }
        }

        return false;
    }

}