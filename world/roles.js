var roleHarvester = require('roles.harvester');
var roleUpgrader = require('roles.upgrader');
var roleBuilder = require('roles.builder');
var roleFixer = require('roles.fixer');
var roleScout = require('roles.scout');
var roleClaimer = require('roles.claimer');
var roleTrucker = require('roles.trucker');
var roleRecycleMe = require('roles.recycleme')

module.exports = {
    harvester: roleHarvester,
    upgrader: roleUpgrader,
    builder: roleBuilder,
    fixer: roleFixer,
    scout: roleScout,
    claimer: roleClaimer,
    trucker: roleTrucker,
    recycleme: roleRecycleMe,
};