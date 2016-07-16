var tasks = require('tasks');

module.exports = {
    
    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.task == 'withdraw') {
            var withdrawFinished = tasks.withdraw.run(creep);
            if (withdrawFinished) {
                creep.memory.task = 'upgrade';
                creep.memory.target = null;
            }
        } else if (creep.memory.task == 'upgrade') {
            var upgradeFinished = tasks.upgrade.run(creep);
            if (upgradeFinished) {
                // report progress
                var contr = creep.room.controller;
                var progressRatio = contr.progress / contr.progressTotal;
                var progressPercent = Math.round(progressRatio * 1000) / 10;
                var gclProgressRatio = Game.gcl.progress / Game.gcl.progressTotal;
                var gclProgressPercent = Math.round(gclProgressRatio * 1000) / 10;
                creep.say(progressPercent + '/'+ gclProgressPercent);
                creep.memory.task = 'withdraw';
                creep.memory.target = null;
            }
        } else if (creep.memory.task == 'harvest') {
            var harvestFinished = tasks.harvest.run(creep);
            if (harvestFinished) {
                creep.memory.task = 'upgrade';
                creep.memory.target = null;
            }
        } else {
            creep.memory.task = 'withdraw';
            creep.memory.target = null;
        }
        
        
    },
    
    autoRoleSpawning: true,

};