module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if (creep.carry.energy > 0) {
            var target;
            if (creep.memory.target) {
                target = Game.getObjectById(creep.memory.target);
            } else {
                target = creep.room.controller;
            }
            var upgradeStatus = creep.upgradeController(target);
            if (upgradeStatus == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    
        return creep.carry.energy == 0;
    }
}
