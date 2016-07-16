module.exports = {

    run: function(creep) {

        var flag = Game.flags['ClaimFlag'];
        if (flag) {

            if (flag.room) {
                var target = flag.room.controller;
                if (target) {
                    var claimStatus = creep.claimController(target);
                    if (claimStatus == OK) {
                        // ok
                    } else if (claimStatus == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    } else {
                        console.log('claim status: '+ claimStatus)
                    }
                } else {
                    console.log(creep.name +': room '+ flag.room.roomName +' has no controller');
                }
            } else {
                creep.moveTo(flag);
            }
            
        } else {
            creep.say(':(')
            console.log(creep.name +': no claim target set');
        }

    },
    
    autoRoleSpawning: false,

};