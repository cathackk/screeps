var tasks = require('tasks');

module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if (creep.memory.task == 'restock') {
            var restockFinished = tasks.restock.run(creep);
            if (restockFinished) {
                creep.memory.task = 'withdraw';
                creep.memory.target = null;
            } else if (!creep.memory.target) {
                creep.memory.task = 'repair';
            }
        } else if (creep.memory.task == 'repair') {
            var repairFinished = tasks.repair.run(creep);
            if (repairFinished) {
                creep.memory.task = 'withdraw';
                creep.memory.target = null;
            }
        } else if (creep.memory.task == 'withdraw') {
            var withdrawFinished = tasks.withdraw.run(creep);
            if (withdrawFinished) {
                creep.memory.task = 'restock';
                creep.memory.target = null;
            }
        } else if (creep.memory.task == 'harvest') {
            var harvestFinished = tasks.harvest.run(creep);
            if (withdrawFinished) {
                creep.memory.task = 'restock';
                creep.memory.target = null;
            }
        } else {
            // default task
            creep.memory.task = 'restock';
            creep.memory.target = null;
        }
        
    },
    
    autoRoleSpawning: true,
};