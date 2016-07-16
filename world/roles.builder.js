var tasks = require('tasks');

module.exports = {
    
    /** @param {Creep} creep **/
    run: function(creep) {
        
        if (creep.memory.task == 'build') {
            var buildFinished = tasks.build.run(creep);
            if (buildFinished) {
                creep.memory.task = 'withdraw';
                creep.memory.target = null;
            }
        } else if (creep.memory.task == 'withdraw') {
            var withdrawFinished = tasks.withdraw.run(creep);
            if (withdrawFinished) {
                creep.memory.task = 'build';
                creep.memory.target = null;
            }
        } else if (creep.memory.task == 'harvest') {
            var harvestFinished = tasks.harvest.run(creep);
            if (harvestFinished) {
                creep.memory.task = 'build';
                creep.memory.target = null;
            }
        } else {
            creep.memory.task = 'build';
            creep.memory.target = null;
        }
    },
    
    autoRoleSpawning: true,
    spawnCondition: function(spawn) {
        return spawn.room.find(FIND_CONSTRUCTION_SITES).length > 0;
    }

};