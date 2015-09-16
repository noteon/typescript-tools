///<reference path='typings/tsd.d.ts'/>
var moment = require("moment");
var d = new Date();
var todayStr = moment().format("YYYY-MM-DD");
var tomorrowStr = moment().add(1, 'day').format("YYYY-MM-DD");
var dateRangeSnippets = [
    {
        caption: "DateRange",
        snippet: "{\n   \\$gte: new Date(\"${3:" + todayStr + "}\"),\n   \\$lt: new Date(\"${4:" + tomorrowStr + "}\")\n }",
        comment: 'Date Range',
        example: "{\n   \\$gte: new Date(\"" + todayStr + "\"),\n   \\$lte: new Date(\"" + tomorrowStr + "\")\n }",
        attachedToFindMethod: true
    },
    {
        caption: "DateRangeMomentJS",
        snippet: "{\n   \\$gte: moment(\"${3:" + todayStr + "}\").startOf(\"day\").toDate(),\n   \\$lte: moment(\"${3:" + todayStr + "}\").endOf(\"day\").toDate()\n }",
        comment: 'Date Range (use momentjs)',
        example: "{\n   \\$gte: moment(\"" + todayStr + "\").startOf(\"day\").toDate(),\n   \\$lte: moment(\"" + todayStr + "\").endOf(\"day\").toDate()\n }",
        attachedToFindMethod: true
    },
    {
        caption: "TodayDateRange",
        snippet: "{\n   \\$gte: moment().startOf(\"day\").toDate(),\n   \\$lte: moment().endOf(\"day\").toDate()\n }",
        comment: 'Today (use momentjs)',
        example: "{\n   \\$gte: moment().startOf(\"day\").toDate(),\n   \\$lte: moment().endOf(\"day\").toDate()\n }",
        attachedToFindMethod: true
    },
    {
        caption: "YesterdayDateRange",
        snippet: "{\n   \\$gte: moment().substract(1,\"day\").startOf(\"day\").toDate(),\n   \\$lte: moment().substract(1,\"day\").endOf(\"day\").toDate()\n }",
        comment: 'Yesterday (use momentjs)',
        example: "{\n   \\$gte: moment().substract(1,\"day\").startOf(\"day\").toDate(),\n   \\$lte: moment().substract(1,\"day\").endOf(\"day\").toDate()\n }",
    },
    {
        caption: "LastNdaysDateRange",
        snippet: "{\n   \\$gte: moment().substract(${3:7},\"day\").startOf(\"day\").toDate(),\n   \\$lte: moment().endOf(\"day\").toDate()\n }",
        comment: 'Last N days (use momentjs)',
        example: "{\n   \\$gte: moment().substract(N,\"day\").startOf(\"day\").toDate(),\n   \\$lte: moment().endOf(\"day\").toDate()\n }",
        attachedToFindMethod: true
    },
    {
        caption: "LastNweeksDateRange",
        snippet: "{\n   \\$gte: moment().substract(${3:1},\"week\").startOf(\"day\").toDate(),\n   \\$lte: moment().endOf(\"day\").toDate()\n }",
        comment: 'Last N weeks (use momentjs)',
        example: "{\n   \\$gte: moment().substract(N,\"week\").startOf(\"day\").toDate(),\n   \\$lte: moment().endOf(\"day\").toDate()\n }",
    },
    {
        caption: "LastNmonthsDateRange",
        snippet: "{\n   \\$gte: moment().substract(${3:1},\"month\").startOf(\"day\").toDate(),\n   \\$lte: moment().endOf(\"day\").toDate()\n }",
        comment: 'Last N months (use momentjs)',
        example: "{\n   \\$gte: moment().substract(N,\"month\").startOf(\"day\").toDate(),\n   \\$lte: moment().endOf(\"day\").toDate()\n }",
    }
];
dateRangeSnippets = dateRangeSnippets.map(function (it) {
    it.meta = "code template";
    return it;
});
module.exports = dateRangeSnippets;
