///<reference path='typings/node/node.d.ts'/>
var mongoShellCommand = [
    {
        caption: "help",
        snippet: "help",
        comment: 'Show help.',
        meta: "command"
    },
    {
        caption: "show dbs",
        snippet: "show dbs",
        comment: 'Print a list of all databases on the server.',
        meta: "command"
    },
    {
        caption: "use <db>",
        snippet: "use $1",
        comment: 'Switch current database to <db>. The mongo shell variable db is set to the current database.',
        meta: "command"
    },
    {
        caption: "show collections",
        snippet: "show collections",
        comment: 'Print a list of all collections for current database',
        meta: "command"
    },
    {
        caption: "show users",
        snippet: "show users",
        comment: 'Print a list of users for current database.',
        meta: "command"
    },
    {
        caption: "show roles",
        snippet: "show roles",
        comment: 'Print a list of all roles, both user-defined and built-in, for the current database.',
        meta: "command"
    },
    {
        caption: "show profile",
        snippet: "show profile",
        comment: 'Print the five most recent operations that took 1 millisecond or more. See documentation on the database profiler for more information',
        meta: "command"
    },
    {
        caption: "show databases",
        snippet: "show databases",
        comment: 'New in version 2.4: Print a list of all available databases.',
        meta: "command"
    },
];
module.exports = mongoShellCommand;
