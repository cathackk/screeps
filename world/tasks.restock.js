module.exports = {
    
    /** @param {Creep} creep **/
    run: function(creep) {
    
        // check target still valid
        if (creep.memory.target) {
            var target = Game.getObjectById(creep.memory.target);
            if (!target || target.energy == target.energyCapacity) {
                creep.memory.target = null;
            }
        }
    
        // find restock target
        if (!creep.memory.target) {
            var target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
               filter: (s) => s.structureType == STRUCTURE_TOWER && s.energy < s.energyCapacity
            });
            if (target) {
                creep.memory.target = target.id;
                console.log(creep.name +': located restock target: '+ target);
            }
        }
    
        // restock
        if (creep.memory.target) {
            var target = Game.getObjectById(creep.memory.target);
            var transferStatus = creep.transfer(target, RESOURCE_ENERGY);
            if (transferStatus == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    
        return creep.carry.energy == 0;
    
    }
    
}